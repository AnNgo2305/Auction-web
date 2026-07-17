import type { AddressType } from '@generated/prisma/enums';

export class UpdateAddressesDto {
  streetAddress!: string;

  city!: string;

  state?: string;

  postalCode?: string;

  country!: string;

  addressType!: AddressType;
}
