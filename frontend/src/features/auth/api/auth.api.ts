import { api } from '@/shared/api/axios';

import type { LoginBody } from '../schemas/login.schema';
import type { RegisterBody } from '../schemas/register.schema';
import type { ForgotPasswordBody } from '../schemas/forgot-password.schema';
import type { ResetPasswordBody } from '../schemas/reset-password.schema';
import type { VerifyOtpBody } from '../schemas/verify-otp.schema';
import type { ResendOtpEmailBody } from '../schemas/resend-otp-email.schema';

import type { LoginResponse } from '../types/login.response';
import type { RegisterResponse } from '../types/register.response';
import type { ForgotPasswordResponse } from '../types/forgot-password.response';
import type { VerifyResetPasswordOtpResponse } from '../types/verify-reset-password-otp.response';
import type { ResetPasswordResponse } from '../types/reset-password.response';
import type { VerifyEmailOtpResponse } from '../types/verify-email-otp.response';
import type { LogoutResponse } from '../types/logout.response';
import type { LogoutAllResponse } from '../types/logout-all.response';
import type { ResendOtpEmailResponse } from '../types/resend-otp-email.response';

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
