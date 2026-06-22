import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .pipe(z.email('Invalid email address')),

  password: z
    .string({
      error: 'Password must be a string',
    })
    .min(1, 'Password is required'),

  provider: z
    .string({
      error: 'Provider must be a string',
    })
    .optional(),
});

export type LoginBody = z.infer<typeof loginSchema>;
