import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .pipe(z.email('Invalid email address')),

    username: z
      .string({
        error: 'Username must be a string',
      })
      .min(1, 'Username is required')
      .min(3, 'Username must contain at least 3 characters')
      .max(20, 'Username cannot exceed 20 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ),

    password: z
      .string({
        error: 'Password must be a string',
      })
      .min(1, 'Password is required')
      .min(6, 'Password must contain at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/,
        'Password must contain at least one special character',
      ),

    confirmPassword: z.string().min(1, 'Confirm password is required'),

    role: z.enum(['BIDDER', 'SELLER'], {
      error: 'Role is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterBody = z.infer<typeof registerSchema>;
