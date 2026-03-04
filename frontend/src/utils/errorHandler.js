/**
 * Error Handler Utility
 * Centralized error handling and logging
 */

import { ErrorTypes as ET, HttpStatus } from '../types/index.js';
import logger from './logger.js';

// Custom Error Class
export class AppError extends Error {
  constructor(message, type = ET.UNKNOWN_ERROR, statusCode = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse error and extract meaningful message
 */
export const parseError = (error) => {
  // Handle axios errors
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || error.message;

    logger.error('API Error', { status, message, data });

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return {
          type: ET.VALIDATION_ERROR,
          message: message || 'Invalid request. Please check your input.',
          statusCode: status,
        };
      case HttpStatus.UNAUTHORIZED:
        return {
          type: ET.AUTHENTICATION_ERROR,
          message: 'Session expired. Please login again.',
          statusCode: status,
        };
      case HttpStatus.FORBIDDEN:
        return {
          type: ET.AUTHORIZATION_ERROR,
          message: 'You do not have permission to perform this action.',
          statusCode: status,
        };
      case HttpStatus.NOT_FOUND:
        return {
          type: ET.VALIDATION_ERROR,
          message: 'The requested resource was not found.',
          statusCode: status,
        };
      case HttpStatus.CONFLICT:
        return {
          type: ET.VALIDATION_ERROR,
          message: message || 'Resource conflict. Please refresh and try again.',
          statusCode: status,
        };
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return {
          type: ET.VALIDATION_ERROR,
          message: message || 'Invalid data. Please check your input.',
          statusCode: status,
          validation: data?.errors,
        };
      case HttpStatus.INTERNAL_SERVER_ERROR:
      case HttpStatus.SERVICE_UNAVAILABLE:
        return {
          type: ET.SERVER_ERROR,
          message: 'Server error. Please try again later.',
          statusCode: status,
        };
      default:
        return {
          type: ET.SERVER_ERROR,
          message: message || 'An error occurred. Please try again.',
          statusCode: status,
        };
    }
  }

  // Handle network errors
  if (error.code === 'ECONNABORTED') {
    logger.error('Network Timeout', { error });
    return {
      type: ET.TIMEOUT_ERROR,
      message: 'Request timeout. Please check your connection and try again.',
      statusCode: 0,
    };
  }

  // Handle network errors
  if (!error.response && error.message === 'Network Error') {
    logger.error('Network Error', { error });
    return {
      type: ET.NETWORK_ERROR,
      message: 'Network error. Please check your internet connection.',
      statusCode: 0,
    };
  }

  // Handle validation errors
  if (error.validation) {
    logger.warn('Validation Error', { validation: error.validation });
    return {
      type: ET.VALIDATION_ERROR,
      message: error.message || 'Validation failed. Please check your input.',
      statusCode: HttpStatus.BAD_REQUEST,
      validation: error.validation,
    };
  }

  // Handle generic errors
  logger.error('Unknown Error', { error: error.message });
  return {
    type: ET.UNKNOWN_ERROR,
    message: error.message || 'An unexpected error occurred. Please try again.',
    statusCode: 0,
    raw: error,
  };
};

/**
 * Create API error response
 */
export const createErrorResponse = (error) => {
  const parsed = parseError(error);
  return {
    success: false,
    error: parsed.message,
    type: parsed.type,
    statusCode: parsed.statusCode,
    details: parsed,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return [];

  if (Array.isArray(errors)) {
    return errors.map((err) => ({
      field: err.field ?? err.path ?? 'field',
      message: err.message,
    }));
  }

  if (typeof errors === 'object') {
    return Object.entries(errors).map(([field, message]) => ({
      field,
      message: typeof message === 'string' ? message : message.message,
    }));
  }

  return [];
};

/**
 * Retry failed requests
 */
export const retryRequest = async (
  fn,
  maxRetries = 3,
  delay = 1000,
  backoff = true
) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const waitTime = backoff ? delay * Math.pow(2, i) : delay;
        logger.warn(`Retry attempt ${i + 1}/${maxRetries}`, { waitTime });
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};

/**
 * Validate error is retryable
 */
export const isRetryable = (error) => {
  const statusCode = error?.response?.status;

  // Retry on server errors and timeouts
  if (
    statusCode >= HttpStatus.INTERNAL_SERVER_ERROR ||
    statusCode === HttpStatus.SERVICE_UNAVAILABLE
  ) {
    return true;
  }

  // Retry on network errors
  if (
    error.code === 'ECONNABORTED' ||
    error.message === 'Network Error'
  ) {
    return true;
  }

  return false;
};

/**
 * Global error boundary handler
 */
export const handleErrorBoundary = (error, errorInfo) => {
  logger.error('Error Boundary', {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
  });

  return {
    message: 'Something went wrong. Please refresh the page.',
    canRetry: true,
  };
};

export default {
  AppError,
  parseError,
  createErrorResponse,
  formatValidationErrors,
  retryRequest,
  isRetryable,
  handleErrorBoundary,
};
