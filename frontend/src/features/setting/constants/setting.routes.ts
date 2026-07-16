export const SETTINGS_ROUTES = {
  PASSWORD: 'password',
  SESSIONS: 'sessions',
  NOTIFICATIONS: 'notifications',
  PREFERENCES: 'preferences',
} as const;

export const settingsPaths = {
  password: () => '/settings/password',
  sessions: () => '/settings/sessions',
  notifications: () => '/settings/notifications',
  preferences: () => '/settings/preferences',
} as const;
