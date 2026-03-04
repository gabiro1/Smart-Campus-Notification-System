/**
 * Validation Utilities
 * Form and data validation helpers
 */

import { Patterns, UserTypes, PriorityLevels } from '../types/index.js';
import logger from './logger.js';

/**
 * Validate email
 */
export const validateEmail = (email) => {
  if (!email) return { valid: false, message: 'Email is required.' };
  if (!Patterns.EMAIL.test(email)) {
    return { valid: false, message: 'Invalid email format.' };
  }
  return { valid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  const rules = {
    minLength: password?.length >= 8,
    hasUpperCase: /[A-Z]/.test(password || ''),
    hasLowerCase: /[a-z]/.test(password || ''),
    hasNumbers: /\d/.test(password || ''),
    hasSpecialChar: /[@$!%*?&]/.test(password || ''),
  };

  const strength = Object.values(rules).filter(Boolean).length;
  const isValid = strength >= 4;

  return {
    valid: isValid,
    strength,
    rules,
    message: isValid
      ? 'Password is strong.'
      : 'Password must have: uppercase, lowercase, number, special char (@$!%*?&), 8+ chars.',
  };
};

/**
 * Validate username
 */
export const validateUsername = (username) => {
  if (!username) return { valid: false, message: 'Username is required.' };
  if (username.length < 3) return { valid: false, message: 'Username must be 3+ chars.' };
  if (username.length > 32) return { valid: false, message: 'Username max 32 chars.' };
  if (!Patterns.USERNAME.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, _, -' };
  }
  return { valid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: 'Phone is required.' };
  if (!Patterns.PHONE.test(phone)) {
    return { valid: false, message: 'Invalid phone format.' };
  }
  return { valid: true };
};

/**
 * Validate URL
 */
export const validateUrl = (url) => {
  if (!url) return { valid: false, message: 'URL is required.' };
  if (!Patterns.URL.test(url)) {
    return { valid: false, message: 'Invalid URL format.' };
  }
  return { valid: true };
};

/**
 * Validate event title
 */
export const validateEventTitle = (title) => {
  if (!title) return { valid: false, message: 'Event title is required.' };
  if (title.length < 5) return { valid: false, message: 'Title must be 5+ chars.' };
  if (title.length > 200) return { valid: false, message: 'Title max 200 chars.' };
  return { valid: true };
};

/**
 * Validate event description
 */
export const validateEventDescription = (description) => {
  if (!description) return { valid: false, message: 'Description is required.' };
  if (description.length < 20) return { valid: false, message: 'Description must be 20+ chars.' };
  if (description.length > 5000) return { valid: false, message: 'Description max 5000 chars.' };
  return { valid: true };
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: false, message: 'Both dates are required.' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start < now) {
    return { valid: false, message: 'Start date cannot be in the past.' };
  }

  if (end <= start) {
    return { valid: false, message: 'End date must be after start date.' };
  }

  return { valid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true };
};

/**
 * Validate string length
 */
export const validateLength = (value, min, max, fieldName = 'Field') => {
  if (!value) return { valid: false, message: `${fieldName} is required.` };

  const length = value.toString().length;

  if (length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters.` };
  }

  if (length > max) {
    return { valid: false, message: `${fieldName} must be at most ${max} characters.` };
  }

  return { valid: true };
};

/**
 * Validate number range
 */
export const validateNumberRange = (value, min, max, fieldName = 'Number') => {
  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a number.` };
  }

  if (num < min || num > max) {
    return { valid: false, message: `${fieldName} must be between ${min} and ${max}.` };
  }

  return { valid: true };
};

/**
 * Validate user role
 */
export const validateUserRole = (role) => {
  if (!role) return { valid: false, message: 'Role is required.' };
  if (!Object.values(UserTypes).includes(role)) {
    return { valid: false, message: 'Invalid user role.' };
  }
  return { valid: true };
};

/**
 * Validate priority level
 */
export const validatePriority = (priority) => {
  if (!priority) return { valid: false, message: 'Priority is required.' };
  if (!Object.values(PriorityLevels).includes(priority)) {
    return { valid: false, message: 'Invalid priority level.' };
  }
  return { valid: true };
};

/**
 * Validate form data
 */
export const validateForm = (data, schema) => {
  const errors = {};

  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(data[field]);
    if (!result.valid) {
      errors[field] = result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

/**
 * Validate against regex
 */
export const validatePattern = (value, pattern, message = 'Invalid format.') => {
  if (!pattern.test(value)) {
    return { valid: false, message };
  }
  return { valid: true };
};

/**
 * Validate array
 */
export const validateArray = (value, minLength = 1, maxLength = Infinity) => {
  if (!Array.isArray(value)) {
    return { valid: false, message: 'Must be an array.' };
  }

  if (value.length < minLength) {
    return { valid: false, message: `Array must have at least ${minLength} items.` };
  }

  if (value.length > maxLength) {
    return { valid: false, message: `Array must have at most ${maxLength} items.` };
  }

  return { valid: true };
};

/**
 * Validate object
 */
export const validateObject = (value, requiredKeys = []) => {
  if (typeof value !== 'object' || value === null) {
    return { valid: false, message: 'Must be an object.' };
  }

  const missingKeys = requiredKeys.filter((key) => !(key in value));

  if (missingKeys.length > 0) {
    return { valid: false, message: `Missing required fields: ${missingKeys.join(', ')}` };
  }

  return { valid: true };
};

export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhone,
  validateUrl,
  validateEventTitle,
  validateEventDescription,
  validateDateRange,
  validateRequired,
  validateLength,
  validateNumberRange,
  validateUserRole,
  validatePriority,
  validateForm,
  sanitizeInput,
  validatePattern,
  validateArray,
  validateObject,
};
