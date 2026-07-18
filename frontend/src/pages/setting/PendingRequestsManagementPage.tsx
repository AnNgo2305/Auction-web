import { Clock3, Inbox, ShieldCheck, UsersRound } from 'lucide-react';
import { UserRelationshipCard } from '@/features/setting/components/UserRelationshipCard';
import { useGetPendingFollowRequests } from '@/features/setting/hooks/relationship/useGetPendingFollowRequests';
import { RELATIONSHIP_STATUSES } from '@/shared/types/relationship';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export function PendingRequestsManagementPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage }
    = useGetPendingFollowRequests();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || !fetchNextPage) return;

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
        root: null,
        rootMargin: '300px',
        threshold: 0,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const pendingRequests = data?.pendingRequests ?? [];

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <Card className="from-primary/10 via-primary/5 to-background overflow-hidden border-none bg-linear-to-r">
        <CardContent className="flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <UsersRound className="text-primary h-8 w-8" />
              <h1 className="text-3xl font-bold">Pending Follow Requests</h1>
            </div>

            <p className="text-muted-foreground max-w-2xl">
              Review users who have requested to follow your profile. Accept
              trusted requests or decline ones you don't recognize.
            </p>
          </div>

          <div className="bg-primary/10 rounded-full p-6">
            <Clock3 className="text-primary h-12 w-12" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Inbox className="text-primary h-5 w-5" />
              <span className="font-medium">Pending</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pendingRequests.length}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Waiting for your decision
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Followers</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Manage Requests</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Accept or reject incoming follow requests.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="font-medium">Privacy</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Protected</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Only approved users can follow your profile.
            </p>
          </CardContent>
        </Card>
      </div>
      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Inbox className="text-muted-foreground mx-auto mb-5 h-12 w-12" />
            <h2 className="text-xl font-semibold">No pending requests</h2>
            <p className="text-muted-foreground mt-2">
              New follow requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((user) => (
            <UserRelationshipCard
              key={user.userId}
              {...user}
              relationshipStatus={RELATIONSHIP_STATUSES.PENDING_INCOMING}
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
