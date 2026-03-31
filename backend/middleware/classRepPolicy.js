// ============================================================
// middleware/classRepPolicy.js
// ============================================================
// Enforces Class Representative (class_rep) specific permissions
// WITHOUT touching any other role (student, lecturer, admin, etc.).
//
// Two behaviours:
//   1. BLOCK  — POST /api/announcements        → 403
//   2. ENRICH — POST /api/pulses/events         → auto-scope to class
//
// Prerequisites: `protect` must run before this middleware so that
//                req.user is already populated from the JWT.
// ============================================================

/**
 * classRepAnnouncementGuard
 * ─────────────────────────
 * Prevents class_reps from posting official academic announcements.
 * All other roles fall through untouched.
 *
 * Usage (in your announcement router):
 *   import { classRepAnnouncementGuard } from '../../middleware/classRepPolicy.js';
 *   router.post('/', protect, classRepAnnouncementGuard, createAnnouncement);
 */
export const classRepAnnouncementGuard = (req, res, next) => {
  // Only apply restrictions to class_rep; every other role passes straight through.
  if (req.user?.role !== 'class_rep') {
    return next();
  }

  // class_rep attempted to POST an official announcement — this is not allowed
  // because announcements go through the institutional governance/approval chain.
  return res.status(403).json({
    success: false,
    message: 'Class Reps cannot post official academic announcements',
  });
};


/**
 * classRepPulseEventScope
 * ───────────────────────
 * When a class_rep creates a pulse/event, automatically lock the
 * targetScope to 'class' and derive the audience from the rep's own
 * `representedLevel` and `representedDepartment` fields.
 *
 * This prevents a class_rep from accidentally (or maliciously) targeting
 * scopes wider than their mandate (e.g., 'university' or 'department').
 *
 * All other roles fall through untouched.
 *
 * Usage (in your pulses/events router):
 *   import { classRepPulseEventScope } from '../../middleware/classRepPolicy.js';
 *   router.post('/', protect, classRepPulseEventScope, createPulseEvent);
 */
export const classRepPulseEventScope = (req, res, next) => {
  // Only intercept class_rep requests; everyone else continues normally.
  if (req.user?.role !== 'class_rep') {
    return next();
  }

  // Sanity-check: the class_rep profile must have their mandate fields set.
  // If not, reject early rather than silently setting null audience values.
  if (!req.user.representedLevel || !req.user.representedDepartment) {
    return res.status(422).json({
      success: false,
      message:
        'Your Class Rep profile is incomplete. ' +
        'representedLevel and representedDepartment must be set before you can post events.',
    });
  }

  // ── Scope override ──────────────────────────────────────────────────
  // Force targetScope to 'class' regardless of what the client sent.
  // A class_rep's mandate is strictly their own class cohort.
  req.body.targetScope = 'class';

  // ── Audience derivation ─────────────────────────────────────────────
  // Automatically populate the audience from the rep's own profile fields
  // so the client doesn't need to (and cannot fake) a wider audience.
  req.body.targetLevel      = req.user.representedLevel;           // e.g. 'Year 2'
  req.body.targetDepartment = req.user.representedDepartment;      // ObjectId ref to Department

  // Proceed to the actual route handler with the enriched body.
  return next();
};
