import type { AddressType } from '@generated/prisma/enums';

export class AddressResponseDto {
  addressId!: string;

  streetAddress!: string;

  city!: string;

  state?: string | null;

  postalCode?: string | null;

  country!: string;

  addressType!: AddressType;

  createdAt!: Date;

  updatedAt!: Date;
}
