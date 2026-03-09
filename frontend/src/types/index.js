/**
 * Type Definitions & Enums
 * Centralized type definitions for TypeScript-like type safety in JavaScript
 */

// User Types
export const UserTypes = {
  STUDENT: 'STUDENT',
  LECTURER: 'LECTURER',
  HOD: 'HOD',
  DEAN: 'DEAN',
  PRINCIPAL: 'PRINCIPAL',
  GUILD_PRESIDENT: 'GUILD_PRESIDENT',
  ADMIN: 'ADMIN',
};

// Event Status
export const EventStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
};

// Reminder Status
export const ReminderStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SNOOZED: 'snoozed',
};

// Notification Status
export const NotificationStatus = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived',
};

// Request Status
export const RequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// API Response Status
export const ResponseStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  PENDING: 'pending',
  LOADING: 'loading',
};

// HTTP Status Codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Types
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Sort Options
export const SortOptions = {
  ASC: 'asc',
  DESC: 'desc',
};

// Date Formats
export const DateFormats = {
  SHORT_DATE: 'MMM DD, YYYY',
  LONG_DATE: 'MMMM DD, YYYY',
  SHORT_TIME: 'HH:mm',
  LONG_TIME: 'HH:mm:ss',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  DISPLAY: 'MMM DD, YYYY HH:mm',
};

// Filter Types
export const FilterTypes = {
  EVENT_TYPE: 'eventType',
  PRIORITY: 'priority',
  STATUS: 'status',
  DATE_RANGE: 'dateRange',
  ROLE: 'role',
  DEPARTMENT: 'department',
};

// Action Types (for Redux-like state management)
export const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  SET_DATA: 'SET_DATA',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE',
};

// Modal Types
export const ModalTypes = {
  CONFIRM: 'confirm',
  ALERT: 'alert',
  INPUT: 'input',
  FORM: 'form',
  INFO: 'info',
};

// Toast Types
export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  LOADING: 'loading',
};

// Navigation Roles (for route protection)
export const NavigationRoles = {
  ADMIN: ['admin'],
  DEAN: ['dean', 'admin'],
  HOD: ['hod', 'dean', 'admin'],
  PRINCIPAL: ['principal', 'dean', 'admin'],
  LECTURER: ['lecturer', 'hod', 'dean', 'admin'],
  GUILD_PRESIDENT: ['guild_president', 'admin'],
  STUDENT: ['student', 'lecturer', 'hod', 'dean', 'admin'],
  PUBLIC: ['student', 'lecturer', 'hod', 'dean', 'principal', 'guild_president', 'admin'],
};

// Storage Keys
export const StorageKeys = {
  AUTH_TOKEN: 'scns_authToken',
  USER: 'scns_user',
  THEME: 'scns_theme',
  LANGUAGE: 'scns_language',
  USER_PREFERENCES: 'scns_userPreferences',
  RECENT_SEARCHES: 'scns_recentSearches',
  FAVORITES: 'scns_favorites',
  DRAFTS: 'scns_drafts',
};

// Event Categories
export const EventCategories = {
  ACADEMIC: 'academic',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  SOCIAL: 'social',
  TECHNICAL: 'technical',
  WORKSHOP: 'workshop',
  SEMINAR: 'seminar',
  COMPETITION: 'competition',
  CONFERENCE: 'conference',
};

// Priority Levels
export const PriorityLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Time Units
export const TimeUnits = {
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
  WEEKS: 'weeks',
  MONTHS: 'months',
};

// Pagination Types
export const PaginationTypes = {
  LIMIT_OFFSET: 'limit_offset',
  CURSOR: 'cursor',
  PAGE_NUMBER: 'page_number',
};

// File Types
export const FileTypes = {
  IMAGE: 'image',
  PDF: 'pdf',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
};

// Regex Patterns
export const Patterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,32}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

export default {
  UserTypes,
  EventStatus,
  ReminderStatus,
  NotificationStatus,
  RequestStatus,
  ResponseStatus,
  HttpStatus,
  ErrorTypes,
  SortOptions,
  DateFormats,
  FilterTypes,
  ActionTypes,
  ModalTypes,
  ToastTypes,
  NavigationRoles,
  StorageKeys,
  EventCategories,
  PriorityLevels,
  TimeUnits,
  PaginationTypes,
  FileTypes,
  Patterns,
};
