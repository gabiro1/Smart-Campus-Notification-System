/**
 * Logger Utility
 * Structured logging for development and production
 */

import { APP_CONFIG, FEATURE_FLAGS } from '../config/index.js';

// Log Levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
};

// Color codes for console output
const COLORS = {
  DEBUG: '#67e8f9',    // cyan
  INFO: '#3b82f6',     // blue
  WARN: '#f59e0b',     // amber
  ERROR: '#ef4444',    // red
  CRITICAL: '#dc2626', // dark red
  RESET: 'color: inherit',
};

class Logger {
  constructor() {
    this.currentLevel = APP_CONFIG.ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
    this.logs = []; // Store logs in memory
    this.maxLogs = 1000; // Max logs to keep in memory
    this.isEnabled = FEATURE_FLAGS.ENABLE_LOGGING;
  }

  /**
   * Format timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Create log message
   */
  createLogMessage(level, title, data) {
    return {
      timestamp: this.getTimestamp(),
      level,
      title,
      data,
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    };
  }

  /**
   * Store log in memory
   */
  storeLog(logMessage) {
    this.logs.push(logMessage);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Format console output
   */
  formatConsole(level, title, data) {
    const color = COLORS[level];
    const emoji = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      CRITICAL: '🔴',
    };

    return [
      `%c[${emoji[level]}] ${level} - ${title}`,
      `color: ${color}; font-weight: bold;`,
      data,
    ];
  }

  /**
   * Base logging method
   */
  log(level, title, data = {}) {
    if (!this.isEnabled || LOG_LEVELS[level] < this.currentLevel) {
      return;
    }

    const logMessage = this.createLogMessage(level, title, data);
    this.storeLog(logMessage);

    // Console output
    if (typeof console !== 'undefined' && console[level.toLowerCase()]) {
      const [message, style, output] = this.formatConsole(level, title, data);
      console.log(message, style, output);
    }
  }

  // Public logging methods
  debug(title, data = {}) {
    this.log('DEBUG', title, data);
  }

  info(title, data = {}) {
    this.log('INFO', title, data);
  }

  warn(title, data = {}) {
    this.log('WARN', title, data);
  }

  error(title, data = {}) {
    this.log('ERROR', title, data);
  }

  critical(title, data = {}) {
    this.log('CRITICAL', title, data);
  }

  /**
   * Performance logging
   */
  time(label) {
    if (!this.isEnabled) return;
    console.time(label);
  }

  timeEnd(label) {
    if (!this.isEnabled) return;
    console.timeEnd(label);
  }

  /**
   * Log API calls
   */
  logApiCall(method, url, data = null, response = null) {
    this.info(`API ${method}`, {
      url,
      requestData: data,
      responseStatus: response?.status,
      responseData: response?.data,
    });
  }

  /**
   * Log user actions
   */
  logAction(action, details = {}) {
    this.info(`Action: ${action}`, details);
  }

  /**
   * Log page navigation
   */
  logNavigation(from, to) {
    this.info('Navigation', { from, to });
  }

  /**
   * Get all stored logs
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level) {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Set log level
   */
  setLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
      this.currentLevel = LOG_LEVELS[level];
    }
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Log error with stack trace
   */
  logError(error, context = {}) {
    this.error(error.message, {
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
