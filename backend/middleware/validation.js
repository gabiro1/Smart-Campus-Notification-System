/**
 * Validation Middleware
 * Uses Joi for schema validation and sanitize-html for XSS prevention
 */

import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

// ==========================================
// 1. HTML SANITIZATION
// ==========================================

/**
 * Sanitize HTML content to prevent XSS
 * Uses sanitize-html to remove dangerous tags/attributes
 */
export const sanitizeHTML = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return htmlContent;
  }

  return sanitizeHtml(htmlContent, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    allowedAttributes: {
      a: ['href', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: [],
    disabledTags: ['script', 'style', 'iframe', 'object', 'embed', 'form']
  });
};

/**
 * Middleware to sanitize request body fields
 * Specify which fields to sanitize in options
 */
export const sanitizeRequestBody = (fieldsToSanitize = []) => {
  return (req, res, next) => {
    if (!req.body) return next();

    fieldsToSanitize.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHTML(req.body[field]);
      }
      // Also handle nested objects if needed
      if (Array.isArray(req.body[field])) {
        req.body[field] = req.body[field].map(item =>
          typeof item === 'string' ? sanitizeHTML(item) : item
        );
      }
    });

    next();
  };
};

// ==========================================
// 2. USER VALIDATION SCHEMAS
// ==========================================

export const userRegistrationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.min': 'Name must be at least 2 characters.',
      'string.max': 'Name cannot exceed 100 characters.',
      'any.required': 'Name is required.'
    }),

  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.'
    }),

  password: Joi.string().min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$'))
    .messages({
      'string.min': 'Password must be at least 8 characters.',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&).',
      'any.required': 'Password is required.'
    }),

  phoneNumber: Joi.string().optional().allow('')
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid international phone number (e.g., +1234567890).'
    }),

  role: Joi.string().valid('student').required()
    .messages({
      'any.only': 'Invalid role. Only students can self-register.',
      'any.required': 'Role is required.'
    }),

  college: Joi.string().optional().allow(''),
  school: Joi.string().optional().allow(''),
  department: Joi.string().optional().allow(''),
  level: Joi.string().valid('Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5').optional().allow(''),
  interests: Joi.array().items(Joi.string()).optional().default([]),
  profilePicture: Joi.string().uri().optional().allow('')
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const userProfileUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  phoneNumber: Joi.string().optional().allow('')
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base': 'Invalid phone number format.'
    }),
  interests: Joi.array().items(Joi.string()).optional(),
  profilePicture: Joi.string().optional().allow(''),
  level: Joi.string().valid('Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5').optional().allow(''),
  languagePreference: Joi.string().valid('en', 'rw').optional().default('en'),
  quietHours: Joi.object({
    startTime: Joi.string().allow(null, '').optional(),
    endTime: Joi.string().allow(null, '').optional()
  }).optional(),
  digestEnabled: Joi.boolean().optional(),
  password: Joi.string().min(8).optional().allow(''),
  notificationPreferences: Joi.object({
    push: Joi.boolean().optional(),
    email: Joi.boolean().optional(),
    sms: Joi.boolean().optional()
  }).optional()
});

export const passwordResetSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordTokenSchema = Joi.object({
  password: Joi.string().min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$'))
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character.'
    })
});

// ==========================================
// 3. EVENT VALIDATION SCHEMAS
// ==========================================

export const eventCreationSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required()
    .messages({
      'string.min': 'Title must be at least 5 characters.',
      'string.max': 'Title cannot exceed 200 characters.',
      'any.required': 'Title is required.'
    }),

  description: Joi.string().trim().min(20).max(5000).required()
    .messages({
      'string.min': 'Description must be at least 20 characters.',
      'string.max': 'Description cannot exceed 5000 characters.',
      'any.required': 'Description is required.'
    }),

  date: Joi.date().iso().required()
    .messages({
      'date.format': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM).',
      'any.required': 'Date is required.'
    }),

  time: Joi.string().empty('').optional().allow(''),
  location: Joi.string().empty('').optional().allow(''),
  posterUrl: Joi.string().uri().optional().allow(''),
  targetSchool: Joi.string().empty('').default(null).optional().allow(null),
  targetDept: Joi.string().empty('').default(null).optional().allow(null),
  targetLevel: Joi.number().integer().min(0).max(5).empty('').default(0).optional(),
  tags: Joi.array().items(Joi.string()).optional().default([]),
  isEmergency: Joi.boolean().optional().default(false),
  attachmentUrl: Joi.string().uri().optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high').optional().default('medium')
});

export const eventUpdateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().min(1).max(5000).optional(),
  date: Joi.date().iso().optional(),
  time: Joi.string().optional().allow(''),
  location: Joi.string().optional().allow(''),
  posterUrl: Joi.string().uri().optional().allow(''),
  targetSchool: Joi.string().optional().allow(''),
  targetDept: Joi.string().optional().allow(''),
  targetLevel: Joi.number().integer().min(0).max(5).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isEmergency: Joi.boolean().optional(),
  attachmentUrl: Joi.string().uri().optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high').optional()
});

// ==========================================
// 4. REMINDER VALIDATION SCHEMAS
// ==========================================

export const reminderCreationSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  note: Joi.string().optional().allow('').max(1000),
  dueDate: Joi.date().iso().required(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional().default('Low'),
  category: Joi.string().optional().allow('').max(50)
});

export const reminderUpdateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  note: Joi.string().optional().allow('').max(1000),
  dueDate: Joi.date().iso().optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  completed: Joi.boolean().optional()
});

// ==========================================
// 5. MESSAGE VALIDATION SCHEMAS
// ==========================================

export const messageSendSchema = Joi.object({
  receiverId: Joi.string().required(),
  content: Joi.string().optional().allow('').max(5000),
  messageType: Joi.string().valid('text', 'document', 'poll').optional().default('text')
}).or('content'); // Either content or file must be present (file handled separately by multer)

export const pollVoteSchema = Joi.object({
  optionIndex: Joi.number().integer().min(0).required()
});

// ==========================================
// 6. ANNOUNCEMENT VALIDATION SCHEMAS
// ==========================================

export const announcementCreationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  content: Joi.string().trim().min(5).max(5000).required(),
  courseId: Joi.string().required(),
  type: Joi.string().valid('General', 'Urgent', 'Assignment', 'Event').optional().default('General'),
  scheduledAt: Joi.date().iso().optional().allow(null, ''),
  requiresAcknowledgment: Joi.boolean().optional().default(false)
});

export const announcementUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  content: Joi.string().trim().min(5).max(5000).optional(),
  courseId: Joi.string().optional(),
  type: Joi.string().valid('General', 'Urgent', 'Assignment', 'Event').optional(),
  scheduledAt: Joi.date().iso().optional().allow(null, ''),
  requiresAcknowledgment: Joi.boolean().optional()
});

// ==========================================
// 7. ADMIN USER MANAGEMENT SCHEMAS
// ==========================================

export const adminUserCreationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).optional(),
  phoneNumber: Joi.string().optional().allow(''),
  role: Joi.string().valid('student', 'lecturer', 'hod', 'dean', 'admin', 'guild_president', 'principal', 'class_rep').required(),
  college: Joi.string().optional().allow(''),
  school: Joi.string().optional().allow(''),
  department: Joi.string().optional().allow(''),
  level: Joi.string().valid('Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5').optional().allow(''),
  interests: Joi.array().items(Joi.string()).optional().default([]),
  profilePicture: Joi.string().uri().optional().allow(''),
  notificationPreferences: Joi.object({
    push: Joi.boolean().optional(),
    email: Joi.boolean().optional(),
    sms: Joi.boolean().optional()
  }).optional()
});

export const adminUserUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional().allow(''),
  role: Joi.string().valid('student', 'lecturer', 'hod', 'dean', 'admin', 'guild_president', 'principal', 'class_rep').optional(),
  college: Joi.string().optional().allow(''),
  school: Joi.string().optional().allow(''),
  department: Joi.string().optional().allow(''),
  level: Joi.string().valid('Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5').optional().allow(''),
  interests: Joi.array().items(Joi.string()).optional(),
  profilePicture: Joi.string().uri().optional().allow(''),
  notificationPreferences: Joi.object({
    push: Joi.boolean().optional(),
    email: Joi.boolean().optional(),
    sms: Joi.boolean().optional()
  }).optional(),
  emailVerified: Joi.boolean().optional()
});

// ==========================================
// 7. HELPER FUNCTIONS
// ==========================================

/**
 * Validate request body against a Joi schema
 * Returns 400 with error details if validation fails
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    // Skip validation for GET/DELETE requests (no body)
    if (['GET', 'DELETE'].includes(req.method)) {
      return next();
    }

    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Auto-sanitize string fields that might contain HTML
    // These fields are known to accept rich text
    const htmlFields = ['description', 'content', 'note'];
    htmlFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHTML(req.body[field]);
      }
    });

    next();
  };
};

/**
 * Validate URL parameters against a schema
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors
      });
    }

    next();
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors
      });
    }

    next();
  };
};

// Export schemas individually if needed for manual validation
export const schemas = {
  userRegistration: userRegistrationSchema,
  userLogin: userLoginSchema,
  userProfileUpdate: userProfileUpdateSchema,
  passwordReset: passwordResetSchema,
  resetPasswordToken: resetPasswordTokenSchema,
  eventCreation: eventCreationSchema,
  eventUpdate: eventUpdateSchema,
  reminderCreation: reminderCreationSchema,
  reminderUpdate: reminderUpdateSchema,
  messageSend: messageSendSchema,
  pollVote: pollVoteSchema,
  announcementCreation: announcementCreationSchema,
  announcementUpdate: announcementUpdateSchema,
  adminUserCreation: adminUserCreationSchema,
  adminUserUpdate: adminUserUpdateSchema
};

export default {
  validateBody,
  validateParams,
  validateQuery,
  sanitizeHTML,
  sanitizeRequestBody,
  schemas
};
