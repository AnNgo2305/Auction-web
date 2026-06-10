import { AddressType } from '@generated/prisma/enums';

export class CreateAddressDto {
  streetAddress!: string;

  city!: string;

  state?: string;

  postalCode?: string;

  country!: string;

  addressType!: AddressType;
}
