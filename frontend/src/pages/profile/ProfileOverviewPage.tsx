import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';

export function ProfileOverviewPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-6">
        <ProfileInfoCard />
      </div>
      <div className="space-y-6">
      </div>
    </div>
  );
}
