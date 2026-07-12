import type { FollowUserData } from '@/features/profile/types/relationship/get-followers.response';
import { useUser } from '@/shared/contexts/UserContext';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Link } from 'react-router-dom';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import { getRelationshipLabel } from '@/features/profile/utils/relationship';
import { Badge } from '@/shared/ui/badge';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group';
import { Loader2, Search } from 'lucide-react';

interface UserPreviewListProps {
  users: FollowUserData[];
  columns?: 1 | 2;
  isInitialLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function UserPreviewList({
  users,
  columns = 2,
  isInitialLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: UserPreviewListProps) {
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

  const { currentUser } = useUser();
  const [searchText, setSearchText] = useState('');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
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
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) =>
      user.username.toLowerCase().includes(keyword),
    );
  }, [users, searchText]);

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
          return (
            <Link
              key={user.userId}
              to={profilePaths.overview(user.userId)}
              className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profileImageUrl ?? undefined} />
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.username}</p>
                  <p className="text-muted-foreground text-sm">
                    {user.role === 'SELLER' ? 'Seller' : 'Bidder'}
                  </p>
                </div>
              </div>
              {relationshipLabel && (
                <Badge variant="secondary">{relationshipLabel}</Badge>
              )}
            </Link>
          );
        })}
        <div ref={loadMoreRef} className="h-1" />
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
