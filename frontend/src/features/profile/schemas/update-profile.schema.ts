import { z } from 'zod';
import { GENDERS } from '@/shared/types/user.ts';

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
    .pipe(z.iso.date('dateOfBirth must be a valid ISO date string'))
    .nullable(),

  gender: z
    .enum([GENDERS.MALE, GENDERS.FEMALE, GENDERS.OTHER], {
      error: 'gender must be a valid enum value',
    })
    .nullable(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
