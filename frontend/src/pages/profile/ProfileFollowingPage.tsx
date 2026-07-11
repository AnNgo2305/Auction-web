import { useOutletContext } from 'react-router-dom';
import type { ProfileOutletContext } from '@/features/profile/types/profile/profile-outlet-context';
import { UserPreviewList } from '@/features/profile/components/UserPreviewList';
import { useGetFollowing } from '@/features/profile/hooks/relationship/useGetFollowing';

export function ProfileFollowingPage() {
  const { profile } = useOutletContext<ProfileOutletContext>();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetFollowing(profile.userId);

  return (
    <UserPreviewList
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
