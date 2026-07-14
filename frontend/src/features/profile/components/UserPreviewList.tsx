import type { FollowUserData } from '@/features/profile/types/relationship/get-followers.response';
import { useUser } from '@/shared/contexts/UserContext';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Link } from 'react-router-dom';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import {
  getRelationshipActions,
  getRelationshipLabel,
} from '@/features/profile/utils/relationship';
import { Badge } from '@/shared/ui/badge';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group';
import { Loader2, Search } from 'lucide-react';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { ACTION_CONFIG } from '@/features/profile/constants/relationship-actions';
import { useRelationshipActions } from '@/features/profile/hooks/relationship/useRelationshipActions';

interface UserPreviewListProps {
  ownerUserId?: string;
  users: FollowUserData[];
  columns?: 1 | 2;
  isInitialLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

const ROLE_LABEL = {
  SELLER: 'Seller',
  BIDDER: 'Bidder',
} as const;

const ROLE_BADGE_CLASS = {
  SELLER: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  BIDDER: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
} as const;

export function UserPreviewList({
  ownerUserId,
  users,
  columns = 2,
  isInitialLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: UserPreviewListProps) {
  const { currentUser } = useUser();
  const [searchText, setSearchText] = useState('');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { handleRelationshipAction } = useRelationshipActions();

  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) =>
      user.username.toLowerCase().includes(keyword),
    );
  }, [users, searchText]);
  const isSearching = searchText.trim().length > 0;

  useEffect(() => {
    if (isSearching) return;
    if (!loadMoreRef.current || !onLoadMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry &&
          entry?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          onLoadMore();
        }
      },
      {
        root: null,
        threshold: 0.1,
      },
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore, isSearching]);

  if (isInitialLoading) {
    return (
      <div
        className={cn(
          'grid gap-4',
          columns === 1 ? 'grid-cols-1' : 'grid-cols-2',
        )}
      >
        {Array.from({ length: columns === 2 ? 6 : 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <InputGroup>
          <InputGroupAddon>
            <Search className="text-muted-foreground h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by username..."
          />
        </InputGroup>
      </div>

      <div
        className={cn(
          'grid gap-4',
          columns === 1 ? 'grid-cols-1' : 'grid-cols-2',
        )}
      >
        {filteredUsers.map((user) => {
          const relationshipLabel = getRelationshipLabel({
            relationship: user.relation!.status,
            currentUserRole: currentUser?.role,
            profileRole: user.role,
          });

          const relationshipActions = getRelationshipActions({
            relationship: user.relation!.status,
            currentUserRole: currentUser?.role,
            profileRole: user.role,
          });

          return (
            <Link
              key={user.userId}
              to={profilePaths.overview(user.userId)}
              className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-4 transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={user.profileImageUrl || defaultAvatarImageUrl}
                  />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-semibold">
                      {user.username}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'shrink-0 px-2 py-0.5 text-xs font-semibold uppercase',
                        ROLE_BADGE_CLASS[user.role],
                      )}
                    >
                      {ROLE_LABEL[user.role]}
                    </Badge>
                  </div>
                </div>
              </div>
              {relationshipLabel && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      {relationshipLabel}
                    </Button>
                  </DropdownMenuTrigger>
                  {relationshipActions.length > 0 && (
                    <DropdownMenuContent align="end">
                      {relationshipActions.map((action, index) => {
                        const config = ACTION_CONFIG[action];
                        const Icon = config.icon;
                        return (
                          <React.Fragment key={action}>
                            {index > 0 && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                              className={config.className}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRelationshipAction(
                                  ownerUserId!,
                                  user.userId!,
                                  action,
                                );
                              }}
                            >
                              <Icon className="mr-2 h-4 w-4" />
                              {config.label}
                            </DropdownMenuItem>
                          </React.Fragment>
                        );
                      })}
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              )}
            </Link>
          );
        })}
        {!isSearching && <div ref={loadMoreRef} className="h-1" />}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
