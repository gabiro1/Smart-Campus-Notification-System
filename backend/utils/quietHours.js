/**
 * Quiet Hours Helper
 * -----------------
 * Checks if the current time falls within a user's configured quiet hours.
 * Used to suppress non-urgent notifications during designated rest periods.
 *
 * Format: quietHours = { startTime: "HH:MM", endTime: "HH:MM" } (24-hour format)
 * Supports overnight windows (e.g., 22:00 to 07:00)
 */

/**
 * Determines if the current time is within the user's quiet hours.
 * @param {Object} user - User document with quietHours field
 * @returns {boolean} - true if current time is within quiet hours, false otherwise
 */
export const isWithinQuietHours = (user) => {
  try {
    const { quietHours } = user;

    // If quiet hours not configured, return false
    if (!quietHours || !quietHours.startTime || !quietHours.endTime) {
      return false;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Parse start and end times (format "HH:MM")
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(quietHours.startTime);
    const endMinutes = parseTime(quietHours.endTime);

    // Handle overnight case (e.g., 22:00 to 07:00)
    if (endMinutes < startMinutes) {
      // Quiet hours wrap past midnight
      // If current time >= start OR current time < end, then it's quiet hours
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      // Normal same-day window
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  } catch (error) {
    console.error('[QuietHours] Error parsing quiet hours for user', user._id, error);
    return false; // Fail safe: if error, don't suppress
  }
};

/**
 * Checks if a notification should be sent based on quiet hours and priority.
 * Critical/urgent notifications bypass quiet hours.
 *
 * @param {Object} user - User document with quietHours and notificationPreferences
 * @param {string} priority - Notification priority: 'low', 'medium', 'high', 'critical'
 * @returns {boolean} - true if notification should be sent now, false if delayed
 */
export const shouldSendNow = (user, priority = 'medium') => {
  // Critical/urgent always send immediately
  if (priority === 'critical' || priority === 'high') {
    return true;
  }

  // If quiet hours not set, send normally
  if (!user.quietHours || !user.quietHours.startTime || !user.quietHours.endTime) {
    return true;
  }

  // Check if current time is within quiet hours
  if (isWithinQuietHours(user)) {
    // During quiet hours, delay low/medium priority notifications
    return false;
  }

  // Outside quiet hours, send normally
  return true;
};
