import type { ApiResponse } from '@/shared/types/response';
import type { AddressType } from '@/shared/types/address';

export class GetAddressesData {
  addressId!: string;

  streetAddress!: string;

  city!: string;

  state!: string | null;

  postalCode!: string | null;

  country!: string;

  addressType!: AddressType;

  createdAt!: string;

  updatedAt!: string;
}

export type GetAddressesResponse = ApiResponse<GetAddressesData[]>;
