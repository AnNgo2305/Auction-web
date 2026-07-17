import {
  ACTION_CONFIG,
  PROFILE_ACTIONS,
  type ProfileAction,
  RELATIONSHIP_STATUSES,
  type RelationshipStatus,
} from '@/shared/types/relationship';
import { type Role, ROLES } from '@/shared/types/user';
import { Card, CardContent } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import { Badge } from 'lucide-react';
import { formatIsoToNow } from '@/shared/utils/format-time';
import { useUser } from '@/shared/contexts/UserContext';
import { useRelationshipActions } from '@/features/profile/hooks/relationship/useRelationshipActions';
import { Button } from '@/shared/ui/button'

type UserRelationshipCardProps = {
  userId: string;
  username: string;
  role: Role;
  profileImageUrl: string | null;
  createdAt: string;
  relationshipStatus: RelationshipStatus;
};

const RELATIONSHIP_ACTIONS: Partial<
  Record<RelationshipStatus, ProfileAction[]>
> = {
  [RELATIONSHIP_STATUSES.PENDING_INCOMING]: [
    PROFILE_ACTIONS.DECLINE,
    PROFILE_ACTIONS.ACCEPT,
  ],
  [RELATIONSHIP_STATUSES.PENDING_OUTGOING]: [PROFILE_ACTIONS.CANCEL],
  [RELATIONSHIP_STATUSES.BLOCKING]: [PROFILE_ACTIONS.UNBLOCK],
};

const RELATIONSHIP_TIME_LABELS: Partial<Record<RelationshipStatus, string>> = {
  [RELATIONSHIP_STATUSES.PENDING_INCOMING]: 'Received',
  [RELATIONSHIP_STATUSES.PENDING_OUTGOING]: 'Sent',
  [RELATIONSHIP_STATUSES.BLOCKING]: 'Blocked',
};

export function UserRelationshipCard({
  userId,
  username,
  role,
  profileImageUrl,
  createdAt,
  relationshipStatus,
}: UserRelationshipCardProps) {
  const { currentUser } = useUser();
  const { handleRelationshipAction } = useRelationshipActions();

  const actions = RELATIONSHIP_ACTIONS[relationshipStatus] ?? [];
  const timeLabel = RELATIONSHIP_TIME_LABELS[relationshipStatus];

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profileImageUrl ?? defaultAvatarImageUrl} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{username}</p>
              <Badge
                className={
                  role === ROLES.SELLER
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-blue-200 bg-blue-50 text-blue-700'
                }
              >
                {role === ROLES.SELLER ? 'Seller' : 'Bidder'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {timeLabel} {formatIsoToNow(createdAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {actions.map((action) => {
            const config = ACTION_CONFIG[action];
            const Icon = config.icon;

            return (
              <Button
                key={action}
                variant={
                  action === PROFILE_ACTIONS.ACCEPT ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => {
                  if (!currentUser) return;
                  handleRelationshipAction(currentUser.userId, userId, action);
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {config.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


