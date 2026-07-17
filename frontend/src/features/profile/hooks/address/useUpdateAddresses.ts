import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addressApi } from '@/features/profile/api/address.api';
import { addressKeys } from '@/features/profile/constants/address-query-key';
import { UPDATE_ADDRESSES_ERROR_MESSAGES } from '@/features/profile/constants/address-error.messages';
import type { UpdateAddressesBody } from '@/features/profile/schemas/update-addresses.schema';
import type { UpdateAddressesResponse } from '@/features/profile/types/address/update-addresses.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useUpdateAddresses(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAddressesResponse,
    ApiResponseError,
    UpdateAddressesBody
  >({
    mutationFn: async (
      body: UpdateAddressesBody,
    ): Promise<UpdateAddressesResponse> => {
      return await addressApi.updateAddresses(body);
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: addressKeys.detail(userId),
      });

      toast.success(response.message);
    },

    onError: (error) => {
      const code = error?.errorCode;
      const message =
        (code && UPDATE_ADDRESSES_ERROR_MESSAGES[code]) ??
        UPDATE_ADDRESSES_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    }
  });
}
