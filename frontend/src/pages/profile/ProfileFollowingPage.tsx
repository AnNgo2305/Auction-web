import { Navigate, useOutletContext } from 'react-router-dom';
import type { ProfileOutletContext } from '@/features/profile/types/profile/profile-outlet-context';
import { UserPreviewList } from '@/features/profile/components/UserPreviewList';
import { useGetFollowing } from '@/features/profile/hooks/relationship/useGetFollowing';
import { ROLES } from '@/shared/types/user.ts';

export function ProfileFollowingPage() {
  const { profile, isInitialProfileLoading } =
    useOutletContext<ProfileOutletContext>();

  const {
    data,
    isLoading: isInitialFollowingLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFollowing(profile?.userId);

  const isLoading = isInitialProfileLoading || isInitialFollowingLoading;

  if (!isInitialProfileLoading && profile?.role !== ROLES.BIDDER) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <UserPreviewList
      ownerUserId={profile?.userId}
      users={data?.sellers ?? []}
      isInitialLoading={isLoading}
      columns={2}
      onLoadMore={() => {
        void fetchNextPage();
      }}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
