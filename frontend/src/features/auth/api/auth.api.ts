import { api } from '@/shared/api/axios';

import type { LoginBody } from '@/features/auth/schemas/login.schema';
import type { RegisterBody } from '@/features/auth/schemas/register.schema';
import type { ForgotPasswordBody } from '@/features/auth/schemas/forgot-password.schema';
import type { ResetPasswordBody } from '@/features/auth/schemas/reset-password.schema';
import type { VerifyOtpBody } from '@/features/auth/schemas/verify-otp.schema';
import type { ResendOtpEmailBody } from '@/features/auth/schemas/resend-otp-email.schema';

import type { LoginResponse } from '@/features/auth/types/login.response';
import type { RegisterResponse } from '@/features/auth/types/register.response';
import type { ForgotPasswordResponse } from '@/features/auth/types/forgot-password.response';
import type { VerifyResetPasswordOtpResponse } from '@/features/auth/types/verify-reset-password-otp.response';
import type { ResetPasswordResponse } from '@/features/auth/types/reset-password.response';
import type { VerifyEmailOtpResponse } from '@/features/auth/types/verify-email-otp.response';
import type { LogoutResponse } from '@/features/auth/types/logout.response';
import type { LogoutAllResponse } from '@/features/auth/types/logout-all.response';
import type { ResendOtpEmailResponse } from '@/features/auth/types/resend-otp-email.response';

const AUTH_API_PREFIX = '/auth';

export const authApi = {
  login: async (body: LoginBody): Promise<LoginResponse>  => {
    const res = await api.post<LoginResponse>(
      `${AUTH_API_PREFIX}/login`,
      body
    );
    return res.data;
  },

  register: async (body: RegisterBody): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>(
      `${AUTH_API_PREFIX}/register`,
      body
    );
    console.log(res.data);
    return res.data;
  },

  forgotPassword: async (body: ForgotPasswordBody): Promise<ForgotPasswordResponse> => {
    const res = await api.post<ForgotPasswordResponse>(
      `${AUTH_API_PREFIX}/forgot-password`,
      body,
    );

    return res.data;
  },

  verifyResetPasswordOTP: async (body: VerifyOtpBody):  Promise<VerifyResetPasswordOtpResponse> => {
    const res = await api.post<VerifyResetPasswordOtpResponse>(
      `${AUTH_API_PREFIX}/verify-reset-password-otp`,
      body,
    )

    return res.data;
  },

  resetPassword: async (body: ResetPasswordBody): Promise<ResetPasswordResponse> => {
    const res = await api.post<ResetPasswordResponse>(
      `${AUTH_API_PREFIX}/reset-password`,
      body
    );

    return res.data;
  },

  verifyEmailOTP: async (body: VerifyOtpBody): Promise<VerifyEmailOtpResponse> => {
    const res = await api.post<VerifyEmailOtpResponse>(
      `${AUTH_API_PREFIX}/verify-email-otp`,
      body
    );

    return res.data;
  },


  resendOtp: async (body: ResendOtpEmailBody): Promise<ResendOtpEmailResponse> => {
    const res = await api.post<ResendOtpEmailResponse>(
      `${AUTH_API_PREFIX}/resend-otp`,
      body
    );

    return res.data;
  },

  logout: () => api.post<LogoutResponse>(`${AUTH_API_PREFIX}/logout`),

  logoutAll: () => api.post<LogoutAllResponse>(`${AUTH_API_PREFIX}/logout-all`),
};
