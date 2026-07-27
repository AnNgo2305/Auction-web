export const SETTING_ROUTES = {
  PASSWORD: 'password',
  SESSIONS: 'sessions',
  NOTIFICATIONS: 'notifications',
  PENDING_REQUESTS: 'pending-requests',
  SENT_REQUESTS: 'sent-requests',
  BLOCKED_USERS: 'blocked-users',
} as const;

export const settingsPaths = {
  password: () => `/setting/${SETTING_ROUTES.PASSWORD}`,
  sessions: () => `/setting/${SETTING_ROUTES.SESSIONS}`,
  notifications: () => `/setting/${SETTING_ROUTES.NOTIFICATIONS}`,
  pendingRequests: () => `/setting/${SETTING_ROUTES.PENDING_REQUESTS}`,
  sentRequests: () => `/setting/${SETTING_ROUTES.SENT_REQUESTS}`,
  blockedUsers: () => `/setting/${SETTING_ROUTES.BLOCKED_USERS}`,
} as const;
