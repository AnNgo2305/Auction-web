import { useOutletContext } from 'react-router-dom';
import { UserAddressList } from '@/features/profile/components/UserAddressList';
import { useGetAddresses } from '@/features/profile/hooks/address/useGetAddresses';
import type { ProfileOutletContext } from '@/features/profile/types/profile/profile-outlet-context';

export function ProfileAddressesPage() {
  const { profile, isOwner, isInitialProfileLoading } =
    useOutletContext<ProfileOutletContext>();

  const userId = profile?.userId ?? '';

  const { data: addresses, isLoading } = useGetAddresses(userId);

  return (
    <UserAddressList
      userId={userId}
      addresses={addresses ?? []}
      isInitialLoading={isInitialProfileLoading || isLoading}
      isOwner={isOwner}
    />
  );
}
