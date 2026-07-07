import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z
    .string({
      error: 'fullName must be a string',
    })
    .max(255, 'fullName must not exceed 255 characters')
    .nullable(),

  phoneNumber: z
    .string({
      error: 'phoneNumber must be a string',
    })
    .max(255, 'phoneNumber must not exceed 255 characters')
    .nullable(),

  bio: z
    .string({
      error: 'bio must be a string',
    })
    .max(500, 'bio must not exceed 500 characters')
    .nullable(),

  dateOfBirth: z
    .string({
      error: 'dateOfBirth must be a string',
    })
    .pipe(z.iso.datetime('dateOfBirth must be a valid ISO date string'))
    .nullable(),

  gender: z
    .enum(['MALE', 'FEMALE', 'OTHER'], {
      error: 'gender must be a valid enum value',
    })
    .nullable(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
