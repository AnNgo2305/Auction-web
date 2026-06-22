import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must contain at least 6 characters')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/,
    'Password must contain at least one special character',
  );

export const resetPasswordSchema = z
  .object({
    resetPasswordToken: z.string().min(1, 'Reset password token is required'),

    newPassword: passwordSchema,

    confirmNewPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match',
  });

export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
