/**
 * Audit Middleware
 * Automatically logs CRUD operations to AuditLog collection
 * Non-blocking: uses setTimeout(0) to fire-and-forget
 *
 * IMPORTANT: This middleware should be placed AFTER the main route handler
 * so we can capture the response and any state changes.
 */

import { createAuditLog } from '../modules/audit/controller/auditController.js';

// ==========================================
// ACTION MAPPING
// ==========================================

/**
 * Maps HTTP methods + resource types to audit actions
 */
const ACTION_MAP = {
  'POST': {
    'user': 'CREATE_USER',
    'event': 'CREATE_EVENT',
    'announcement': 'CREATE_ANNOUNCEMENT',
    'broadcast': 'BROADCAST_MESSAGE',
    'sms': 'SEND_SMS',
    'default': 'CREATE'
  },
  'PUT': {
    'user': 'UPDATE_USER',
    'event': 'UPDATE_EVENT',
    'announcement': 'UPDATE_ANNOUNCEMENT',
    'default': 'UPDATE'
  },
  'DELETE': {
    'user': 'DELETE_USER',
    'event': 'DELETE_EVENT',
    'announcement': 'DELETE_ANNOUNCEMENT',
    'default': 'DELETE'
  },
  'PATCH': {
    'user': 'UPDATE_USER',
    'event': 'UPDATE_EVENT',
    'announcement': 'UPDATE_ANNOUNCEMENT',
    'default': 'UPDATE'
  }
};

/**
 * Extract target type from URL path or context
 */
const TARGET_TYPE_MAP = {
  '/api/admin/users': 'USER',
  '/api/events': 'EVENT',
  '/api/announcements': 'ANNOUNCEMENT',
  '/api/messages/notify': 'BROADCAST',
  '/api/messages/sms': 'SMS',
  'default': 'SYSTEM'
};

// ==========================================
// AUDIT MIDDLEWARE FACTORY
// ==========================================

/**
 * Creates an audit middleware for a specific resource type
 *
 * @param {string} resourceType - 'user', 'event', 'announcement', 'broadcast', 'sms'
 * @param {Object} options - Optional config
 * @param {boolean} options.captureChanges - If true, fetches before/after state (requires extra DB query)
 * @param {string} options.customAction - Override automatic action detection
 * @returns {Function} Express middleware
 */
export const auditLog = (resourceType, options = {}) => {
  const { captureChanges = false, customAction = null } = options;

  return async (req, res, next) => {
    // Capture original state if needed (for change tracking)
    let beforeState = null;

    if (captureChanges && req.params.id) {
      try {
        // Attempt to fetch the current state from DB before the update
        // WARNING: This introduces an extra DB query. Use judiciously.
        const Model = getModelForResource(resourceType);
        if (Model) {
          beforeState = await Model.findById(req.params.id).lean();
        }
      } catch (err) {
        // Non-blocking: log error but continue
        console.warn(`[Audit] Could not fetch before state for ${resourceType}/${req.params.id}:`, err.message);
      }
    }

    // Capture response details after handler completes
    const originalJson = res.json;
    res.json = function (body) {
      // Restore original function
      res.json = originalJson;

      // Fire-and-forget: schedule audit log in next tick
      setImmediate(() => {
        createAuditLogAsync(req, res, body, resourceType, customAction, beforeState);
      });

      // Return original response
      return originalJson.call(this, body);
    };

    // Also handle cases where res.send() or res.status().json() is used
    const originalSend = res.send;
    res.send = function (body) {
      // Only audit JSON responses (skip file downloads, redirects)
      if (originalJson && typeof body === 'object') {
        res.json = originalJson; // restore
        setImmediate(() => {
          createAuditLogAsync(req, res, body, resourceType, customAction, beforeState);
        });
      }
      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Direct middleware that logs immediately (for errors, non-CRUD)
 */
export const auditEvent = (action, description, targetId = null, targetType = 'SYSTEM') => {
  return (req, res, next) => {
    setImmediate(() => {
      createAuditLogAsync(req, res, null, null, null, null, action, description, targetId, targetType);
    });
    next();
  };
};

// ==========================================
// ASYNC AUDIT LOG CREATION (Non-Blocking)
// ==========================================

/**
 * Creates audit log in background without blocking response
 */
async function createAuditLogAsync(req, res, responseBody, resourceType, customAction, beforeState) {
  try {
    const adminId = req.user?._id || req.user?.id || null;
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Determine action from HTTP method + resource type
    const action = customAction ||
      (ACTION_MAP[req.method]?.[resourceType] || ACTION_MAP[req.method]?.default || 'ACTION');

    // Determine target type
    const targetType = resourceType ? TARGET_TYPE_MAP[resourceType] || resourceType.toUpperCase() : 'SYSTEM';

    // Extract target ID from params, body, or response
    const targetId = extractTargetId(req, resourceType, responseBody);

    // Build description
    const description = buildDescription(action, resourceType, req, targetId);

    // Capture changes if beforeState exists and we have a response
    let changes = null;
    if (beforeState && responseBody && responseBody.success) {
      const afterState = extractAfterState(responseBody, resourceType);
      if (afterState) {
        changes = {
          before: beforeState,
          after: afterState
        };
      }
    }

    // Call createAuditLog (from auditController)
    // We import it here to avoid circular dependencies
    const { createAuditLog: createLog } = await import('../modules/audit/controller/auditController.js');

    // Build payload
    const auditData = {
      action,
      targetId,
      targetType,
      description,
      changes,
      ipAddress: ip,
      userAgent,
      status: 'SUCCESS'
    };

    // Create fake request object with body
    const fakeReq = {
      body: auditData,
      user: adminId ? { _id: adminId } : null,
      ip,
      headers: { 'user-agent': userAgent }
    };

    // Fake response object (we don't care about the result)
    const fakeRes = {
      json: () => {},
      status: () => ({ json: () => {} })
    };

    // Create log (fire and forget - don't await, but catch errors)
    createLog(fakeReq, fakeRes, () => {})
      .catch(err => {
        console.error('[AuditMiddleware] Failed to create audit log:', err.message);
      });

  } catch (err) {
    // LOG ERROR BUT DON'T THROW - non-blocking!
    console.error('[AuditMiddleware] Failed to create audit log:', err.message);
  }
}

/**
 * Extract target ID from request/response
 * Handles various response shapes: { data: {_id} }, { user: {_id} }, { event: {_id} }, etc.
 */
function extractTargetId(req, resourceType, responseBody) {
  // 1. From URL params (PUT/DELETE /:id)
  if (req.params?.id) {
    return req.params.id;
  }

  // 2. From request body (rare)
  if (req.body?.id) {
    return req.body.id;
  }

  // 3. From response body - direct _id
  if (responseBody?._id) {
    return responseBody._id;
  }

  // 4. From response body - wrapped in 'data' field with _id
  if (responseBody?.data?._id) {
    return responseBody.data._id;
  }

  // 5. From response body - wrapped in resourceType singular (e.g., event, user, announcement)
  if (responseBody?.[resourceType]?._id) {
    return responseBody[resourceType]._id;
  }

  // 6. From response body - 'user', 'event', etc. common keys
  const commonKeys = ['user', 'event', 'announcement', 'target'];
  for (const key of commonKeys) {
    if (responseBody?.[key]?._id) {
      return responseBody[key]._id;
    }
  }

  // 7. Fallback: try to extract from URL pattern
  const urlMatch = req.originalUrl.match(/\/([^\/]+)\/([^\/]+)$/);
  if (urlMatch) {
    // If URL is like /something/:id, return :id
    return urlMatch[2];
  }

  return null;
}

/**
 * Extract after state from response
 */
function extractAfterState(responseBody, resourceType) {
  if (responseBody?.success && responseBody?.data) {
    return responseBody.data;
  }
  return null;
}

/**
 * Build human-readable description
 */
function buildDescription(action, resourceType, req, targetId) {
  const actor = req.user?.name || req.user?.email || 'System';
  const resource = resourceType ? resourceType.charAt(0).toUpperCase() + resourceType.slice(1) : 'Resource';
  const target = targetId ? ` (ID: ${targetId.toString().slice(-8)})` : '';

  switch (action) {
    case 'CREATE_USER':
    case 'CREATE_EVENT':
    case 'CREATE_ANNOUNCEMENT':
      return `${actor} created a ${resource}${target}`;
    case 'UPDATE_USER':
    case 'UPDATE_EVENT':
    case 'UPDATE_ANNOUNCEMENT':
      return `${actor} updated a ${resource}${target}`;
    case 'DELETE_USER':
    case 'DELETE_EVENT':
    case 'DELETE_ANNOUNCEMENT':
      return `${actor} deleted a ${resource}${target}`;
    case 'BROADCAST_MESSAGE':
      return `${actor} sent a broadcast notification`;
    case 'SEND_SMS':
      return `${actor} sent an SMS`;
    case 'LOGIN':
      return `${actor} logged in`;
    case 'LOGOUT':
      return `${actor} logged out`;
    default:
      return `${actor} performed ${action} on ${resource}${target}`;
  }
}

/**
 * Get Mongoose model for a resource type (for fetching before state)
 */
function getModelForResource(resourceType) {
  const modelMap = {
    user: () => import('../modules/user/model/User.js').then(m => m.default),
    event: () => import('../modules/event/model/Event.js').then(m => m.default),
    announcement: () => import('../modules/announcement/model/Announcement.js').then(m => m.default)
    // Add more as needed
  };

  return modelMap[resourceType] ? modelMap[resourceType]() : null;
}

// ==========================================
// HELPER: Wrap route handler with audit
// ==========================================

/**
 * Wraps an existing route handler to add audit logging
 * Usage: router.post('/users', withAudit('user'), createUser);
 */
export const withAudit = (resourceType, options = {}) => {
  return (handler) => {
    return async (req, res, next) => {
      // Apply audit middleware
      const auditMiddleware = auditLog(resourceType, options);
      await new Promise((resolve, reject) => {
        auditMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      // Then call the actual handler
      return handler(req, res, next);
    };
  };
};

export default {
  auditLog,
  auditEvent,
  withAudit
};
