import { useOutletContext } from 'react-router-dom';
import type { ProfileOutletContext } from '@/features/profile/types/profile/profile-outlet-context';
import { UserPreviewList } from '@/features/profile/components/UserPreviewList';
import { useGetFollowers } from '@/features/profile/hooks/relationship/useGetFollowers';

export function ProfileFollowersPage() {
  const { profile, isInitialProfileLoading } = useOutletContext<ProfileOutletContext>();

  const { data, isLoading: isInitialFollowerLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetFollowers(profile?.userId);

  const isLoading = isInitialProfileLoading || isInitialFollowerLoading;

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