import type {
  ProfileAction,
  RelationshipStatus,
} from '@/features/profile/types/relationship.type';
import type { Role } from '@/features/profile/types/profile.type';

type RelationshipContext = {
  relationship: RelationshipStatus;
  currentUserRole: Role | undefined;
  profileRole: Role;
};
export function getRelationshipLabel({ relationship, currentUserRole, profileRole }: RelationshipContext): string | null {
  switch (relationship) {
    case 'SELF':
      return 'Edit Profile';

    case 'NONE':
      if (currentUserRole === 'BIDDER' && profileRole === 'SELLER') {
        return 'Follow';
      }

      if (currentUserRole === 'SELLER' && profileRole === 'BIDDER') {
        return 'More';
      }

      return null;

    case 'FOLLOWING':
      return 'Following';

    case 'ACCEPTED':
      return 'Connected';

    case 'PENDING_OUTGOING':
      return 'Request Sent';

    case 'PENDING_INCOMING':
      return 'Awaiting Approval';

    case 'BLOCKING':
      return 'Blocking';

    default:
      return null;
  }
}

export function getRelationshipActions({
  relationship,
  currentUserRole,
  profileRole,
}: RelationshipContext): ProfileAction[] {
  const isBidderViewingSeller =
    currentUserRole === 'BIDDER' && profileRole === 'SELLER';

  const isSellerViewingBidder =
    currentUserRole === 'SELLER' && profileRole === 'BIDDER';

  switch (relationship) {
    case 'SELF':
      return [];

    case 'NONE':
      if (isBidderViewingSeller) {
        return ['Follow'];
      }

      if (isSellerViewingBidder) {
        return ['Block'];
      }

      return [];

    case 'FOLLOWING':
      return ['Unfollow'];

    case 'ACCEPTED':
      return ['Unfollow', 'Block'];

    case 'PENDING_OUTGOING':
      return ['Cancel'];

    case 'PENDING_INCOMING':
      return ['Accept', 'Decline', 'Block'];

    case 'BLOCKING':
      return ['Unblock'];

    default:
      return [];
  }
}
