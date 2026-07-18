import { useEffect, useRef } from 'react';
import {
  Ban,
  Loader2,
  ShieldAlert,
  UserX,
  Lock,
} from 'lucide-react';
import { UserRelationshipCard } from '@/features/setting/components/UserRelationshipCard';
import { useGetBlockedUsers } from '@/features/setting/hooks/relationship/useGetBlockedUsers';
import { RELATIONSHIP_STATUSES } from '@/shared/types/relationship';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';

export function BlockedUsersManagementPage() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetBlockedUsers();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry &&
          entry?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: '300px',
        threshold: 0,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>

                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const blockedUsers = data?.blockedUsers ?? [];

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <Card className="overflow-hidden border-none bg-linear-to-r from-red-500/10 via-red-500/5 to-background">
        <CardContent className="flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Ban className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold">Blocked Users</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Users in this list cannot follow or interact with your account
              until you unblock them.
            </p>
          </div>
          <div className="rounded-full bg-red-500/10 p-6">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              <span className="font-medium">Blocked</span>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold">{blockedUsers.length}</p>

            <p className="text-muted-foreground mt-2 text-sm">
              Users currently blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Access Control</span>
            </div>
          </CardHeader>

          <CardContent>
            <p className="font-medium">Restricted</p>

            <p className="text-muted-foreground mt-2 text-sm">
              Blocked users cannot follow your account.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="font-medium">Privacy</span>
            </div>
          </CardHeader>

          <CardContent>
            <p className="font-medium">Protected</p>

            <p className="text-muted-foreground mt-2 text-sm">
              Unblock a user anytime if you change your mind.
            </p>
          </CardContent>
        </Card>
      </div>
      {blockedUsers.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Ban className="text-muted-foreground mx-auto mb-5 h-12 w-12" />

            <h2 className="text-xl font-semibold">
              No blocked users
            </h2>

            <p className="text-muted-foreground mt-2">
              Users you block will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {blockedUsers.map((user) => (
            <UserRelationshipCard
              key={user.userId}
              {...user}
              relationshipStatus={RELATIONSHIP_STATUSES.BLOCKING}
            />
          ))}
          <div ref={loadMoreRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}