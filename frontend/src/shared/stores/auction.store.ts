import { create } from 'zustand';
import {
  AUCTION_STATUSES,
  type AuctionStatus,
} from '@/shared/types/auction-status';

interface AuctionDraft {
  title: string;
  startTime: string;
  endTime: string;
  startingPrice: number;
  minimumBidIncrement: number;
  status: AuctionStatus;
}

interface AuctionStoreState {
  auction: AuctionDraft;
}

interface AuctionStoreActions {
  updateBasicInformation: (
    values: Partial<
      Pick<
        AuctionDraft,
        | 'title'
        | 'startTime'
        | 'endTime'
        | 'startingPrice'
        | 'minimumBidIncrement'
        | 'status'
      >
    >,
  ) => void;

  resetAuction: () => void;
}

type AuctionStore = AuctionStoreState & AuctionStoreActions;

const initialAuction: AuctionDraft = {
  title: '',
  startTime: '',
  endTime: '',
  startingPrice: 0,
  minimumBidIncrement: 0,
  status: AUCTION_STATUSES.PENDING,
};

export const useAuctionStore = create<AuctionStore>((set) => ({
  auction: initialAuction,

  updateBasicInformation: (values) =>
    set((state) => ({
      auction: {
        ...state.auction,
        ...values,
      },
    })),

  resetAuction: () =>
    set({
      auction: initialAuction,
    }),
}));
