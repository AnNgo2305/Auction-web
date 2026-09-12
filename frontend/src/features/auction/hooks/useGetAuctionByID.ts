import { useQuery } from '@tanstack/react-query';
import { auctionApi } from '@/features/auction/api/auction.api.ts';
import { auctionKeys } from '@/features/auction/constants/auction-query-key.ts';
import type {
  GetAuctionByIdResponse,
  GetAuctionByIdData,
} from '@/features/auction/types/get-auction-by-id.response.ts';
import { ApiError } from '@/shared/api/api-error.ts';

export function useGetAuctionById(auctionId: string) {
  return useQuery<GetAuctionByIdResponse, ApiError, GetAuctionByIdData>({
    queryKey: auctionKeys.detail(auctionId),
    queryFn: () => auctionApi.getAuctionById(auctionId),
    enabled: !!auctionId,
    staleTime: 1000 * 30,
    select: (response) => response.data,
  });
}
