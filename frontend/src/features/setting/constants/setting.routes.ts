export const SETTING_ROUTES = {
  PASSWORD: 'password',
  SESSIONS: 'sessions',
  NOTIFICATIONS: 'notifications',
  PENDING_REQUESTS: 'pending-requests',
  SENT_REQUESTS: 'sent-requests',
  BLOCKED_USERS: 'blocked-users',
} as const;

export const settingsPaths = {
  password: () => '/setting/password',
  sessions: () => '/setting/sessions',
  notifications: () => '/setting/notifications',
  pendingRequests: () => '/setting/pending-requests',
  sentRequests: () => '/setting/sent-requests',
  blockedUsers: () => '/setting/blocked-users',
} as const;
