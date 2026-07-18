import { useEffect, useRef } from 'react';
import { Clock3, Loader2, Send, ShieldCheck, UserPlus2 } from 'lucide-react';

import { UserRelationshipCard } from '@/features/setting/components/UserRelationshipCard';
import { useGetSentFollowRequests } from '@/features/setting/hooks/relationship/useGetSentFollowRequests';
import { RELATIONSHIP_STATUSES } from '@/shared/types/relationship';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';

export function SentRequestsManagementPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetSentFollowRequests();

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

  const sentRequests = data?.sentRequests ?? [];

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <Card className="to-background overflow-hidden border-none bg-linear-to-r from-blue-500/10 via-blue-500/5">
        <CardContent className="flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Send className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Sent Follow Requests</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Track the follow requests you've sent to sellers. Requests will
              remain pending until the seller accepts or declines them.
            </p>
          </div>
          <div className="rounded-full bg-blue-500/10 p-6">
            <Clock3 className="h-12 w-12 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Sent</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{sentRequests.length}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Pending outgoing requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserPlus2 className="h-5 w-5 text-indigo-500" />
              <span className="font-medium">Following</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Awaiting Response</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Sellers can accept or decline your requests.
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
              You can cancel any pending request at any time.
            </p>
          </CardContent>
        </Card>
      </div>
      {sentRequests.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Send className="text-muted-foreground mx-auto mb-5 h-12 w-12" />

            <h2 className="text-xl font-semibold">No sent requests</h2>

            <p className="text-muted-foreground mt-2">
              Follow requests you send will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sentRequests.map((user) => (
            <UserRelationshipCard
              key={user.userId}
              {...user}
              relationshipStatus={RELATIONSHIP_STATUSES.PENDING_OUTGOING}
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
