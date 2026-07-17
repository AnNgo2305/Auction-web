import { Inbox } from 'lucide-react';
import { UserRelationshipCard } from '@/features/setting/components/UserRelationshipCard';
import { useGetPendingFollowRequests } from '@/features/setting/hooks/relationship/useGetPendingFollowRequests';
import { RELATIONSHIP_STATUSES } from '@/shared/types/relationship';
import { Skeleton } from '@/shared/ui/skeleton';

export function PendingRequestsManagementPage() {
  const { data, isLoading } = useGetPendingFollowRequests();

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
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pending Follow Requests
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and respond to bidders who want to follow you.
        </p>
      </div>
      {pendingRequests.length === 0 ? (
        <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center">
          <Inbox className="mx-auto mb-4 h-10 w-10 opacity-50" />
          <h2 className="text-foreground text-lg font-medium">
            No pending requests
          </h2>
          <p className="mt-2 text-sm">New follow requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((user) => (
            <UserRelationshipCard
              key={user.userId}
              {...user}
              relationshipStatus={RELATIONSHIP_STATUSES.PENDING_INCOMING}
            />
          ))}
        </div>
      )}
    </section>
  );
}
