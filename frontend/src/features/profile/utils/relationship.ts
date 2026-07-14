import { type Role, ROLES } from '@/shared/types/user.ts';
import  {
  PROFILE_ACTIONS,
  type ProfileAction,
  RELATIONSHIP_STATUSES,
  type RelationshipStatus,
} from '@/shared/types/relationship.ts';

type RelationshipContext = {
  relationship: RelationshipStatus;
  currentUserRole: Role | undefined;
  profileRole: Role;
};

export function getRelationshipLabel({ relationship, currentUserRole, profileRole }: RelationshipContext): string | null {
  switch (relationship) {
    case RELATIONSHIP_STATUSES.NONE:
      if (currentUserRole === ROLES.BIDDER && profileRole === ROLES.SELLER) {
        return 'Follow';
      }

      if (currentUserRole === ROLES.SELLER && profileRole === ROLES.BIDDER) {
        return 'More';
      }

      return null;

    case RELATIONSHIP_STATUSES.FOLLOWING:
      return 'Following';

    case RELATIONSHIP_STATUSES.ACCEPTED:
      return 'Connected';

    case RELATIONSHIP_STATUSES.PENDING_OUTGOING:
      return 'Request Sent';

    case RELATIONSHIP_STATUSES.PENDING_INCOMING:
      return 'Awaiting Approval';

    case RELATIONSHIP_STATUSES.BLOCKING:
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
    currentUserRole === ROLES.BIDDER && profileRole === ROLES.SELLER;

  const isSellerViewingBidder =
    currentUserRole === ROLES.SELLER && profileRole === ROLES.BIDDER;

  switch (relationship) {
    case RELATIONSHIP_STATUSES.NONE:
      if (isBidderViewingSeller) {
        return [PROFILE_ACTIONS.FOLLOW];
      }

      if (isSellerViewingBidder) {
        return [PROFILE_ACTIONS.BLOCK];
      }

      return [];

    case RELATIONSHIP_STATUSES.FOLLOWING:
      return [PROFILE_ACTIONS.UNFOLLOW];

    case RELATIONSHIP_STATUSES.ACCEPTED:
      return [PROFILE_ACTIONS.BLOCK];

    case RELATIONSHIP_STATUSES.PENDING_OUTGOING:
      return [PROFILE_ACTIONS.CANCEL];

    case RELATIONSHIP_STATUSES.PENDING_INCOMING:
      return [
        PROFILE_ACTIONS.ACCEPT,
        PROFILE_ACTIONS.DECLINE,
        PROFILE_ACTIONS.BLOCK,
      ];

    case RELATIONSHIP_STATUSES.BLOCKING:
      return [PROFILE_ACTIONS.UNBLOCK];

    default:
      return [];
  }
}
