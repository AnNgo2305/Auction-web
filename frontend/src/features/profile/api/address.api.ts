import { api } from '@/shared/api/axios';
import type { UpdateAddressesBody } from '@/features/profile/schemas/update-addresses.schema';
import type { GetAddressesResponse } from '@/features/profile/types/address/get-addresses.response';
import type { UpdateAddressesResponse } from '@/features/profile/types/address/update-addresses.response';

const ADDRESS_API_PREFIX = '/addresses';

export const addressApi = {
  getAddresses: async (userId: string): Promise<GetAddressesResponse> => {
    const res = await api.get<GetAddressesResponse>(
      `${ADDRESS_API_PREFIX}/${userId}`,
    );

    return res.data;
  },

  updateAddresses: async (
    body: UpdateAddressesBody,
  ): Promise<UpdateAddressesResponse> => {
    const res = await api.put<UpdateAddressesResponse>(
      ADDRESS_API_PREFIX,
      body.addresses,
    );

    return res.data;
  },
};
