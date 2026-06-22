import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .pipe(z.email('Invalid email address')),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
