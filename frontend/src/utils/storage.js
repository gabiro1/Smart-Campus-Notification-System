/**
 * Storage Utility
 * Unified handling of localStorage with prefix and encryption
 */

import { STORAGE_CONFIG } from '../config/index.js';
import logger from './logger.js';

class StorageManager {
  constructor() {
    this.prefix = STORAGE_CONFIG.PREFIX;
    this.storage = typeof window !== 'undefined' ? localStorage : null;
  }

  /**
   * Generate full key with prefix
   */
  getFullKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Set item in storage
   */
  setItem(key, value, options = {}) {
    if (!this.storage) {
      logger.warn('Storage not available');
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      let data = value;

      // Serialize if object
      if (typeof value === 'object' && value !== null) {
        data = JSON.stringify({
          value,
          timestamp: Date.now(),
          ttl: options.ttl,
        });
      }

      this.storage.setItem(fullKey, data);
      logger.debug(`Storage set: ${key}`);
      return true;
    } catch (error) {
      logger.error('Storage setItem error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Get item from storage
   */
  getItem(key, defaultValue = null) {
    if (!this.storage) {
      logger.warn('Storage not available');
      return defaultValue;
    }

    try {
      const fullKey = this.getFullKey(key);
      let data = this.storage.getItem(fullKey);

      if (data === null) {
        return defaultValue;
      }

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(data);

        // Check if TTL has expired
        if (parsed.ttl && parsed.timestamp) {
          const now = Date.now();
          const elapsed = now - parsed.timestamp;

          if (elapsed > parsed.ttl) {
            this.removeItem(key);
            logger.debug(`Storage item expired: ${key}`);
            return defaultValue;
          }
        }

        return parsed.value !== undefined ? parsed.value : parsed;
      } catch {
        // Return as string if not JSON
        return data;
      }
    } catch (error) {
      logger.error('Storage getItem error', { key, error: error.message });
      return defaultValue;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key) {
    if (!this.storage) {
      logger.warn('Storage not available');
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      this.storage.removeItem(fullKey);
      logger.debug(`Storage removed: ${key}`);
      return true;
    } catch (error) {
      logger.error('Storage removeItem error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Clear all storage items with prefix
   */
  clear() {
    if (!this.storage) {
      logger.warn('Storage not available');
      return false;
    }

    try {
      const keys = [];

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          keys.push(key);
        }
      }

      keys.forEach((key) => this.storage.removeItem(key));
      logger.debug(`Storage cleared: ${keys.length} items`);
      return true;
    } catch (error) {
      logger.error('Storage clear error', { error: error.message });
      return false;
    }
  }

  /**
   * Check if key exists
   */
  hasItem(key) {
    if (!this.storage) return false;

    try {
      const fullKey = this.getFullKey(key);
      return this.storage.getItem(fullKey) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get all items
   */
  getAll() {
    if (!this.storage) {
      logger.warn('Storage not available');
      return {};
    }

    try {
      const items = {};

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '');
          items[cleanKey] = this.getItem(cleanKey);
        }
      }

      return items;
    } catch (error) {
      logger.error('Storage getAll error', { error: error.message });
      return {};
    }
  }

  /**
   * Set auth token
   */
  setToken(token) {
    return this.setItem(STORAGE_CONFIG.TOKEN_KEY, token);
  }

  /**
   * Get auth token
   */
  getToken() {
    return this.getItem(STORAGE_CONFIG.TOKEN_KEY);
  }

  /**
   * Remove auth token
   */
  removeToken() {
    return this.removeItem(STORAGE_CONFIG.TOKEN_KEY);
  }

  /**
   * Set user data
   */
  setUser(user) {
    return this.setItem(STORAGE_CONFIG.USER_KEY, user);
  }

  /**
   * Get user data
   */
  getUser() {
    return this.getItem(STORAGE_CONFIG.USER_KEY);
  }

  /**
   * Remove user data
   */
  removeUser() {
    return this.removeItem(STORAGE_CONFIG.USER_KEY);
  }

  /**
   * Clear auth data
   */
  clearAuth() {
    this.removeToken();
    this.removeUser();
    logger.debug('Auth data cleared');
  }

  /**
   * Set preferences
   */
  setPreferences(preferences) {
    return this.setItem('preferences', preferences);
  }

  /**
   * Get preferences
   */
  getPreferences() {
    return this.getItem('preferences', {});
  }

  /**
   * Update preference
   */
  updatePreference(key, value) {
    const prefs = this.getPreferences();
    prefs[key] = value;
    return this.setPreferences(prefs);
  }

  /**
   * Get storage size
   */
  getSize() {
    if (!this.storage) return 0;

    try {
      let size = 0;

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          const value = this.storage.getItem(key);
          size += (key + value).length * 2; // 2 bytes per character
        }
      }

      return Math.round(size / 1024); // Return in KB
    } catch {
      return 0;
    }
  }

  /**
   * List all keys
   */
  getKeys() {
    if (!this.storage) return [];

    try {
      const keys = [];

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          keys.push(key.replace(this.prefix, ''));
        }
      }

      return keys;
    } catch {
      return [];
    }
  }

  /**
   * Watch for storage changes
   */
  watch(key, callback) {
    const fullKey = this.getFullKey(key);

    const handleStorageChange = (e) => {
      if (e.key === fullKey) {
        callback(e.newValue, e.oldValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Return unwatch function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
}

// Create singleton instance
const storage = new StorageManager();

export default storage;
