import { useOutletContext } from 'react-router-dom';
import type { ProfileOutletContext } from '@/features/profile/types/profile/profile-outlet-context';
import { UserPreviewList } from '@/features/profile/components/UserPreviewList';
import { useGetFollowers } from '@/features/profile/hooks/relationship/useGetFollowers';

export function ProfileFollowersPage() {
  const { profile } = useOutletContext<ProfileOutletContext>();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetFollowers(profile.userId);

  return (
    <UserPreviewList
      users={data?.bidders ?? []}
      isInitialLoading={isLoading}
      columns={2}
      onLoadMore={() => fetchNextPage()}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}