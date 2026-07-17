import { Ban } from 'lucide-react';
import { UserRelationshipCard } from '@/features/setting/components/UserRelationshipCard';
import { useGetBlockedUsers } from '@/features/setting/hooks/relationship/useGetBlockedUsers';
import { RELATIONSHIP_STATUSES } from '@/shared/types/relationship';
import { Skeleton } from '@/shared/ui/skeleton';

export function BlockedUsersManagementPage() {
  const { data, isLoading } = useGetBlockedUsers();

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
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
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const blockedUsers = data?.blockedUsers ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blocked Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage users you've blocked from following you.
        </p>
      </div>
      {blockedUsers.length === 0 ? (
        <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center">
          <Ban className="mx-auto mb-4 h-10 w-10 opacity-50" />
          <h2 className="text-foreground text-lg font-medium">
            No blocked users
          </h2>
          <p className="mt-2 text-sm">Users you block will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blockedUsers.map((user) => (
            <UserRelationshipCard
              key={user.userId}
              {...user}
              relationshipStatus={RELATIONSHIP_STATUSES.BLOCKING}
            />
          ))}
        </div>
      )}
    </section>
  );
}
