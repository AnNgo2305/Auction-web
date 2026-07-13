import { useFollowSeller } from './useFollowSeller';
import { useUnfollowSeller } from './useUnfollowSeller';
import { useCancelFollowRequest } from './useCancelFollowRequest';
import { useAcceptFollow } from './useAcceptFollow';
import { useDeclineFollow } from './useDeclineFollow';
import { useBlockBidder } from './useBlockBidder';
import { useUnblockBidder } from './useUnblockBidder';
import type { ProfileAction } from '@/features/profile/types/profile/relationship.type';

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
      case 'Follow':
        return followMutation.mutate({
          bidderId: currentUserId,
          sellerId: targetUserId,
        });

      case 'Unfollow':
        return unfollowMutation.mutate({
          bidderId: currentUserId,
          sellerId: targetUserId,
        });

      case 'Accept':
        return acceptFollowMutation.mutate({
          sellerId: currentUserId,
          bidderId: targetUserId
        });

      case 'Decline':
        return declineFollowMutation.mutate({
          sellerId: currentUserId,
          bidderId: targetUserId,
        });

      case 'Cancel':
        return cancelFollowRequestMutation.mutate({
          bidderId: currentUserId,
          sellerId: targetUserId,
        });

      case 'Block':
        return blockBidderMutation.mutate({
          sellerId: currentUserId,
          bidderId: targetUserId,
        });

      case 'Unblock':
        return unblockBidderMutation.mutate({
          sellerId: currentUserId,
          bidderId: targetUserId,
        });
    }
  };

  return { handleRelationshipAction };
}
