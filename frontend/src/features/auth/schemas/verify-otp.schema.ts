import { z } from 'zod';

export const verifyOtpSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),

  type: z.enum(['VERIFY_EMAIL', 'RESET_PASSWORD'], {
    error: 'OTP type must be a valid value',
  }),

  code: z
    .string()
    .min(1, 'OTP code is required')
    .regex(/^\d{6}$/, 'OTP code must contain exactly 6 digits'),
});

export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>;
