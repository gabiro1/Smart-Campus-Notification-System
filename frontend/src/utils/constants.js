/**
 * Application Wide Constants
 * Shared constants across the application
 */

// API Response Constants
export const API_RESPONSE_CODES = {
  SUCCESS: 'success',
  ERROR: 'error',
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
};

// Pagination Limits
export const PAGINATION = {
  MIN_PAGE_SIZE: 5,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Cache Durations (in ms)
export const CACHE_DURATIONS = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Debounce Delays (in ms)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  TYPING: 500,
  WINDOW_RESIZE: 200,
  SCROLL: 150,
};

// Throttle Delays (in ms)
export const THROTTLE_DELAYS = {
  SCROLL: 100,
  WINDOW_RESIZE: 200,
  API_CALLS: 1000,
};

// Animation Durations (in ms)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Transition Timings
export const TRANSITIONS = {
  FADE: 'all 0.3s ease',
  SLIDE: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  SCALE: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Limits
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_UPLOAD_FILES: 10,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_BIO_LENGTH: 500,
  MIN_PASSWORD_LENGTH: 8,
};

// Time Constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
};

// Browser Storage Keys (without prefix)
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
  RECENT_SEARCHES: 'recent_searches',
  DRAFT_EVENTS: 'draft_events',
  SAVED_FILTERS: 'saved_filters',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  EVENTS: '/events',
  EVENTS_DETAIL: (id) => `/events/${id}`,
  REMINDERS: '/reminders',
  NOTIFICATIONS: '/notifications',
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
    AUDIT_LOGS: '/admin/audit-logs',
  },
  STUDENT: {
    DASHBOARD: '/student',
    FEED: '/student/feed',
    PROFILE: '/student/profile',
  },
  DEAN: {
    DASHBOARD: '/dean',
    APPROVALS: '/dean/approvals',
  },
  HOD: {
    DASHBOARD: '/hod',
  },
  NOT_FOUND: '*',
};

// Form Field Names
export const FORM_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  USERNAME: 'username',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  PHONE: 'phone',
  TITLE: 'title',
  DESCRIPTION: 'description',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  LOCATION: 'location',
  CATEGORY: 'category',
  PRIORITY: 'priority',
};

// Event Categories
export const CATEGORIES = {
  ACADEMIC: 'Academic',
  CULTURAL: 'Cultural',
  SPORTS: 'Sports',
  SOCIAL: 'Social',
  TECHNICAL: 'Technical',
  WORKSHOP: 'Workshop',
  SEMINAR: 'Seminar',
  COMPETITION: 'Competition',
};

// Priority Colors
export const PRIORITY_COLORS = {
  low: '#10b981', // green
  medium: '#f59e0b', // amber
  high: '#ef4444', // red
  critical: '#7c2d12', // dark red
};

// Status Colors
export const STATUS_COLORS = {
  draft: '#6b7280', // gray
  published: '#3b82f6', // blue
  ongoing: '#8b5cf6', // purple
  completed: '#10b981', // green
  cancelled: '#ef4444', // red
};

// API Timeout Durations (in ms)
export const API_TIMEOUTS = {
  SHORT: 5 * 1000, // 5 seconds
  NORMAL: 30 * 1000, // 30 seconds
  LONG: 60 * 1000, // 60 seconds
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  LOADING: 'loading',
};

// Z-Index Scale
export const Z_INDEX = {
  DROPDOWN: 100,
  STICKY: 200,
  FIXED: 300,
  MODAL_BACKDROP: 900,
  MODAL: 1000,
  TOOLTIP: 1100,
  NOTIFICATION: 1200,
};

// Regex Patterns
export const REGEX = {
  WORD: /\w+/g,
  NUMBER: /\d+/g,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/i,
  HEX_COLOR: /#[0-9a-f]{6}/i,
};

// Accessibility
export const A11Y = {
  SKIP_TO_MAIN: 'skip-to-main',
  FOCUS_TRAP: 'focus-trap',
  ARIA_LIVE_POLITE: 'polite',
  ARIA_LIVE_ASSERTIVE: 'assertive',
};

// Error Retry
export const RETRY = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 30 * 1000,
  BACKOFF_MULTIPLIER: 2,
};

export default {
  API_RESPONSE_CODES,
  PAGINATION,
  CACHE_DURATIONS,
  DEBOUNCE_DELAYS,
  THROTTLE_DELAYS,
  ANIMATION_DURATIONS,
  TRANSITIONS,
  LIMITS,
  TIME,
  STORAGE_KEYS,
  ROUTES,
  FORM_FIELDS,
  CATEGORIES,
  PRIORITY_COLORS,
  STATUS_COLORS,
  API_TIMEOUTS,
  NOTIFICATION_TYPES,
  Z_INDEX,
  REGEX,
  A11Y,
  RETRY,
};
