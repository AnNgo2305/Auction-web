export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/sign-up',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_EMAIL: '/auth/verify-email',
  VERIFY_RESET_PASSWORD: '/auth/verify-reset-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];
