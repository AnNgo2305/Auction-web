import { useOutletContext } from 'react-router-dom';
import type { ProfileOutletContext } from '@/features/profile/types/profile/profile-outlet-context';
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export function ProfileOverviewPage() {
  const { isInitialProfileLoading } = useOutletContext<ProfileOutletContext>();

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-6">
        <ProfileInfoCard />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Posts & Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            {isInitialProfileLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
            ) : (
              <div className="text-muted-foreground flex h-64 items-center justify-center rounded-lg border border-dashed">
                Auction posts will be displayed here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
