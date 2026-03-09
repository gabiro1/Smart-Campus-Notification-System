// App-wide configuration constants
export const APP_CONFIG = {
  APP_NAME: 'Event Alert & Reminder',
  VERSION: '1.0.0',
  API_TIMEOUT: 30000, // 30 seconds

  // Colors
  COLORS: {
    primary: '#3b82f6',
    secondary: '#1f2937',
    background: '#111827',
    surface: '#1f2937',
    error: '#ef4444',
    warning: '#f97316',
    success: '#10b981',
    info: '#3b82f6',
    text: {
      primary: '#fff',
      secondary: '#e2e8f0',
      tertiary: '#cbd5e1',
      muted: '#94a3b8',
    },
    border: '#334155',
  },

  // Typography
  FONTS: {
    extraSmall: { fontSize: 11, fontWeight: '400' },
    small: { fontSize: 12, fontWeight: '400' },
    body: { fontSize: 14, fontWeight: '400' },
    bodyMedium: { fontSize: 15, fontWeight: '500' },
    subtitle1: { fontSize: 16, fontWeight: '600' },
    subtitle2: { fontSize: 14, fontWeight: '600' },
    heading1: { fontSize: 28, fontWeight: '800' },
    heading2: { fontSize: 24, fontWeight: '800' },
    heading3: { fontSize: 20, fontWeight: '700' },
    heading4: { fontSize: 18, fontWeight: '700' },
    heading5: { fontSize: 16, fontWeight: '700' },
  },

  // Spacing
  SPACING: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  // Border Radius
  BORDER_RADIUS: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Animation
  ANIMATION: {
    DURATION: 300,
    TIMING: 'ease-in-out',
  },

  // API
  API: {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },

  // Pagination
  PAGINATION: {
    PAGE_SIZE: 10,
    INITIAL_PAGE: 1,
  },

  // Notifications
  NOTIFICATIONS: {
    CHANNELS: {
      DEFAULT: 'default',
      ALERTS: 'alerts',
      REMINDERS: 'reminders',
    },
  },

  // Auth
  AUTH: {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'user',
    TOKEN_EXPIRY_LOGIN: 30 * 24 * 60 * 60 * 1000, // 30 days
    TOKEN_EXPIRY_REGISTER: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Event Priorities
  EVENT_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  },

  // User Roles
  USER_ROLES: {
    STUDENT: 'student',
    LECTURER: 'lecturer',
    HOD: 'hod',
    GUILD_PRESIDENT: 'guild_president',
    ADMIN: 'admin',
  },

  // Match Score Thresholds
  MATCH_SCORE: {
    HIGH: 80,
    MEDIUM: 60,
    LOW: 0,
  },

  // Toast Duration
  TOAST_DURATION: 3000,
};

// Utility function to get color based on priority
export const getPriorityColor = (priority: string): string => {
  const { primary, warning, error } = APP_CONFIG.COLORS;
  switch (priority) {
    case APP_CONFIG.EVENT_PRIORITIES.HIGH:
      return error;
    case APP_CONFIG.EVENT_PRIORITIES.MEDIUM:
      return warning;
    case APP_CONFIG.EVENT_PRIORITIES.LOW:
      return primary;
    default:
      return primary;
  }
};

// Utility function to get color based on role
export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    [APP_CONFIG.USER_ROLES.ADMIN]: '#ef4444',
    [APP_CONFIG.USER_ROLES.HOD]: '#8b5cf6',
    [APP_CONFIG.USER_ROLES.LECTURER]: '#3b82f6',
    [APP_CONFIG.USER_ROLES.GUILD_PRESIDENT]: '#f97316',
    [APP_CONFIG.USER_ROLES.STUDENT]: '#10b981',
  };
  return colors[role] || '#3b82f6';
};

// Utility function to get color based on match score
export const getMatchScoreColor = (score: number): string => {
  const { success, primary, warning } = APP_CONFIG.COLORS;
  if (score >= APP_CONFIG.MATCH_SCORE.HIGH) return success;
  if (score >= APP_CONFIG.MATCH_SCORE.MEDIUM) return primary;
  return warning;
};
