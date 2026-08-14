import type { DoubleCsrfUtilities } from 'csrf-csrf';
import { doubleCsrf } from 'csrf-csrf';
import type { Request } from 'express';

export const csrfConfig = (): DoubleCsrfUtilities => {
  return doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET!,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getCsrfTokenFromRequest: (req: Request) => {
      return req.headers['x-csrf-token'];
    },
    getSessionIdentifier: (req: Request): string => {
      const accessToken = req.cookies?.access_token as string;
      if (!accessToken) {
        throw new Error('Access token not found');
      }
      return accessToken;
    },
    cookieName: 'csrf-token',
    cookieOptions: {
      sameSite: 'strict',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
    size: 32,
    skipCsrfProtection: (req: Request): boolean => {
      const publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email-otp',
        '/auth/verify-reset-password-otp',
        '/auth/resend-otp',
      ];
      return publicRoutes.includes(req.path);
    },
  });
};
