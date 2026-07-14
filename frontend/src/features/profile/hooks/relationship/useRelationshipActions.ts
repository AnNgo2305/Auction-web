import { useFollowSeller } from './useFollowSeller';
import { useUnfollowSeller } from './useUnfollowSeller';
import { useCancelFollowRequest } from './useCancelFollowRequest';
import { useAcceptFollow } from './useAcceptFollow';
import { useDeclineFollow } from './useDeclineFollow';
import { useBlockBidder } from './useBlockBidder';
import { useUnblockBidder } from './useUnblockBidder';
import  { PROFILE_ACTIONS, type ProfileAction } from '@/shared/types/relationship.ts';

export function useRelationshipActions() {
  const followMutation = useFollowSeller();
  const unfollowMutation = useUnfollowSeller();
  const cancelFollowRequestMutation = useCancelFollowRequest();

  const acceptFollowMutation = useAcceptFollow();

  const declineFollowMutation = useDeclineFollow();
  const blockBidderMutation = useBlockBidder();
  const unblockBidderMutation = useUnblockBidder();

  const handleRelationshipAction = (currentUserId: string, targetUserId: string, action: ProfileAction) => {
    switch (action) {
      case PROFILE_ACTIONS.FOLLOW:
        return followMutation.mutate({
          bidderId: currentUserId,
          sellerId: targetUserId,
        });

      case PROFILE_ACTIONS.UNFOLLOW:
        return unfollowMutation.mutate({
          bidderId: currentUserId,
          sellerId: targetUserId,
        });

      case PROFILE_ACTIONS.ACCEPT:
        return acceptFollowMutation.mutate({
          sellerId: currentUserId,
          bidderId: targetUserId,
        });

      case PROFILE_ACTIONS.DECLINE:
        return declineFollowMutation.mutate({
          sellerId: currentUserId,
          bidderId: targetUserId,
        });

      case PROFILE_ACTIONS.CANCEL:
        return cancelFollowRequestMutation.mutate({
          bidderId: currentUserId,
          sellerId: targetUserId,
        });

      case PROFILE_ACTIONS.BLOCK:
        return blockBidderMutation.mutate({
          sellerId: currentUserId,
          bidderId: targetUserId,
        });

      case PROFILE_ACTIONS.UNBLOCK:
        return unblockBidderMutation.mutate({
          sellerId: currentUserId,
          bidderId: targetUserId,
        });
    }
  };

  return { handleRelationshipAction };
}
