import { useQuery } from '@tanstack/react-query';
import { addressApi } from '@/features/profile/api/address.api';
import { addressKeys } from '@/features/profile/constants/address-query-key';
import {
  GetAddressesData,
  type GetAddressesResponse,
} from '@/features/profile/types/address/get-addresses.response';

import type { ApiResponseError } from '@/shared/types/error';

export function useGetAddresses(userId: string) {
  return useQuery<GetAddressesResponse, ApiResponseError, GetAddressesData[]>({
    queryKey: addressKeys.detail(userId),
    queryFn: async (): Promise<GetAddressesResponse> => {
      return await addressApi.getAddresses(userId);
    },
    enabled: !!userId,
    select: (response) => response.data,
    staleTime: 1000 * 30,
  });
}
