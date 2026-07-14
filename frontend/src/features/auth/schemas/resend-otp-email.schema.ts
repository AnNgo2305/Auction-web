import { z } from 'zod';
import { OTP_TYPE } from '@/shared/types/otp.ts';

export const resendOtpEmailSchema = z.object({
  email: z.email('Invalid email address'),

  type: z.enum([OTP_TYPE.VERIFY_EMAIL, OTP_TYPE.RESET_PASSWORD]),
});

export type ResendOtpEmailBody = z.infer<typeof resendOtpEmailSchema>;
