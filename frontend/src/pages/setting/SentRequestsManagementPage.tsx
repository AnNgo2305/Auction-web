import { Send } from 'lucide-react';
import { UserRelationshipCard } from '@/features/setting/components/UserRelationshipCard';
import { useGetSentFollowRequests } from '@/features/setting/hooks/relationship/useGetSentFollowRequests';
import { RELATIONSHIP_STATUSES } from '@/shared/types/relationship';
import { Skeleton } from '@/shared/ui/skeleton';

export function SentRequestsManagementPage() {
  const { data, isLoading } = useGetSentFollowRequests();

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="mt-2 h-4 w-72" />
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
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sent Follow Requests
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track the follow requests you've sent to sellers.
        </p>
      </div>

      {sentRequests.length === 0 ? (
        <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center">
          <Send className="mx-auto mb-4 h-10 w-10 opacity-50" />
          <h2 className="text-foreground text-lg font-medium">
            No sent requests
          </h2>
          <p className="mt-2 text-sm">
            Follow requests you send will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sentRequests.map((user) => (
            <UserRelationshipCard
              key={user.userId}
              {...user}
              relationshipStatus={RELATIONSHIP_STATUSES.PENDING_OUTGOING}
            />
          ))}
        </div>
      )}
    </section>
  );
}
