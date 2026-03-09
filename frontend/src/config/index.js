/**
 * Centralized Application Configuration
 * Single source of truth for all app settings
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Smart Campus Notification',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENV: import.meta.env.VITE_APP_ENV || 'development',
  DEBUG: import.meta.env.DEV,
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  ENABLE_ERROR_BOUNDARY: import.meta.env.VITE_ENABLE_ERROR_BOUNDARY === 'true',
};

// Storage Configuration
export const STORAGE_CONFIG = {
  PREFIX: import.meta.env.VITE_STORAGE_PREFIX || 'scns_',
  TOKEN_KEY: import.meta.env.VITE_TOKEN_KEY || 'authToken',
  USER_KEY: import.meta.env.VITE_USER_KEY || 'user',
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: parseInt(import.meta.env.VITE_TOAST_DURATION || '3000', 10),
  TOAST_POSITION: import.meta.env.VITE_TOAST_POSITION || 'top-right',
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'dark',
  ANIMATION_DURATION: 300,
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10', 10),
  MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100', 10),
  PAGE_OPTIONS: [10, 20, 50, 100],
};

// Authentication Configuration
export const AUTH_CONFIG = {
  AUTH_TIMEOUT: parseInt(import.meta.env.VITE_AUTH_TIMEOUT || '3600000', 10),
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  SESSION_WARNING_TIME: 2 * 60 * 1000, // 2 minutes before expiry
};

// Event Types & Priorities
export const EVENT_TYPES = {
  ACADEMIC: 'academic',
  SOCIAL: 'social',
  WORKSHOP: 'workshop',
  SPORTS: 'sports',
  CULTURAL: 'cultural',
  COMPETITION: 'competition',
  OTHER: 'other',
};

export const EVENT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DEAN: 'dean',
  HOD: 'hod',
  PRINCIPAL: 'principal',
  LECTURER: 'lecturer',
  GUILD_PRESIDENT: 'guild_president',
  STUDENT: 'student',
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// Common Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATE_SUCCESS: 'Created successfully.',
  UPDATE_SUCCESS: 'Updated successfully.',
  DELETE_SUCCESS: 'Deleted successfully.',
  SAVE_SUCCESS: 'Saved successfully.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    PROFILE: '/users/profile',
    LOGOUT: '/users/logout',
  },
  EVENTS: {
    LIST: '/events',
    CREATE: '/events/create',
    DETAILS: (id) => `/events/${id}`,
    UPDATE: (id) => `/events/${id}`,
    DELETE: (id) => `/events/${id}`,
    FEED: '/events/feed',
    SEARCH: '/events/search',
    INTEREST: (id) => `/events/${id}/interest`,
    RATE: (id) => `/events/${id}/rate`,
  },
  REMINDERS: {
    LIST: '/reminders',
    CREATE: '/reminders',
    UPDATE: (id) => `/reminders/${id}`,
    DELETE: (id) => `/reminders/${id}`,
    COMPLETE: (id) => `/reminders/${id}/complete`,
    UNCOMPLETE: (id) => `/reminders/${id}/uncomplete`,
    DUE: '/reminders/due',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAILS: (id) => `/notifications/${id}`,
    DELETE: (id) => `/notifications/${id}`,
    READ_ALL: '/notifications/read-all',
    SUMMARY: '/notifications/summary',
    UNREAD_COUNT: '/notifications/unread-count',
  },
  ADMIN: {
    METRICS: '/admin/metrics',
    USERS: '/admin/users',
    USERS_DETAIL: (id) => `/admin/users/${id}`,
    ANALYTICS: '/admin/analytics',
    AUDIT_LOGS: '/admin/audit-logs',
  },
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 32,
};

// Export all configs as a single object for convenience
export default {
  API_CONFIG,
  APP_CONFIG,
  FEATURE_FLAGS,
  STORAGE_CONFIG,
  UI_CONFIG,
  PAGINATION_CONFIG,
  AUTH_CONFIG,
  EVENT_TYPES,
  EVENT_PRIORITIES,
  USER_ROLES,
  HTTP_METHODS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_ENDPOINTS,
  VALIDATION_RULES,
};
