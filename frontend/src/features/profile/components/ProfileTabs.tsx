import { NavLink, useLocation, useParams } from 'react-router-dom';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import { type Role, ROLES } from '@/shared/types/user.ts';

interface ProfileTabsProps {
  isOwner: boolean;
  role: Role | undefined;
  isLoading: boolean;
}

export function ProfileTabs({ isOwner, role, isLoading }: ProfileTabsProps) {
  const { pathname } = useLocation();
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="border-b">
        <div className="flex gap-6 px-6 py-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    );
  }

  const currentTab = pathname.split('/').filter(Boolean)[2] ?? 'overview';
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      to: profilePaths.overview(userId),
    },
    {
      key: 'addresses',
      label: 'Addresses',
      to: profilePaths.addresses(userId),
    },
    ...(role === ROLES.SELLER
      ? [
          {
            key: 'followers',
            label: 'Followers',
            to: profilePaths.followers(userId),
          },
        ]
      : []),
    ...(role === ROLES.BIDDER
      ? [
          {
            key: 'following',
            label: 'Following',
            to: profilePaths.following(userId),
          },
        ]
      : []),
    ...(isOwner
      ? [
          {
            key: 'edit',
            label: 'Edit',
            to: profilePaths.edit(userId),
          },
        ]
      : []),
  ];

  return (
    <div className="border-b">
      <nav className="flex px-6">
        {tabs.map((tab) => {
          const active = currentTab === tab.key;

          return (
            <NavLink
              key={tab.key}
              to={tab.to}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
