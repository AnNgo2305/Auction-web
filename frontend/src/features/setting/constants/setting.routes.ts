export const SETTING_ROUTES = {
  PASSWORD: 'password',
  SESSIONS: 'sessions',
  NOTIFICATIONS: 'notifications',
  PENDING_REQUESTS: 'pending-requests',
  SENT_REQUESTS: 'sent-requests',
  BLOCKED_USERS: 'blocked-users',
} as const;

export const settingsPaths = {
  password: () => '/settings/password',
  sessions: () => '/settings/sessions',
  notifications: () => '/settings/notifications',
  pendingRequests: () => '/settings/pending-requests',
  sentRequests: () => '/settings/sent-requests',
  blockedUsers: () => '/settings/blocked-users',
} as const;
