import { z } from 'zod';
import { ADDRESS_TYPE } from '@/shared/types/address';

export const addressSchema = z.object({
  streetAddress: z.string().trim().min(1, 'Street address is required'),

  city: z.string().trim().min(1, 'City is required'),

  state: z.string().trim().nullable(),

  postalCode: z.string().trim().nullable(),

  country: z.string().trim().min(1, 'Country is required'),

  addressType: z.enum([
    ADDRESS_TYPE.Home,
    ADDRESS_TYPE.Work,
    ADDRESS_TYPE.Others,
  ]),
});

export const updateAddressesBodySchema = z.object({
  addresses: z.array(addressSchema),
});

export type UpdateAddressesBody = z.infer<typeof updateAddressesBodySchema>;
