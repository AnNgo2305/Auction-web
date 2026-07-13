export const AUTH_ROUTES = {
  LOGIN: 'login',
  REGISTER: 'sign-up',
  FORGOT_PASSWORD: 'forgot-password',
  VERIFY_EMAIL: 'verify-email',
  VERIFY_RESET_PASSWORD: 'verify-reset-password',
  RESET_PASSWORD: 'reset-password',
} as const;

export const authPaths = {
  login: () => `/auth/${AUTH_ROUTES.LOGIN}`,
  register: () => `/auth/${AUTH_ROUTES.REGISTER}`,
  forgotPassword: () => `/auth/${AUTH_ROUTES.FORGOT_PASSWORD}`,
  verifyEmail: () => `/auth/${AUTH_ROUTES.VERIFY_EMAIL}`,
  verifyResetPassword: () => `/auth/${AUTH_ROUTES.VERIFY_RESET_PASSWORD}`,

  // Navigate
  resetPasswordWithToken: (token: string) =>
    `/auth/${AUTH_ROUTES.RESET_PASSWORD}?token=${token}`,

  // Pathname
  resetPassword: () => `/auth/${AUTH_ROUTES.RESET_PASSWORD}`,
} as const;
