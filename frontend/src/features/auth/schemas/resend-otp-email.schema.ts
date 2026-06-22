import { z } from 'zod';

export const OTP_TYPES = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  RESET_PASSWORD: 'RESET_PASSWORD',
} as const;

export const resendOtpEmailSchema = z.object({
  email: z.email('Invalid email address'),

  type: z.enum([OTP_TYPES.VERIFY_EMAIL, OTP_TYPES.RESET_PASSWORD]),
});

export type ResendOtpEmailBody = z.infer<typeof resendOtpEmailSchema>;
