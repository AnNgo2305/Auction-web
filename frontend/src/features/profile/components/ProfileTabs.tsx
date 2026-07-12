import { NavLink, useLocation, useParams } from 'react-router-dom';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import type { Role } from '@/features/profile/types/profile/profile.type.ts';

interface ProfileTabsProps {
  isOwner: boolean;
  role: Role | undefined;
}

export function ProfileTabs({ isOwner, role }: ProfileTabsProps) {
  const { pathname } = useLocation();
  const { userId } = useParams<{ userId: string }>();

  if (!userId) {
    return null;
  }

  const currentTab = pathname.split('/').filter(Boolean)[2] ?? 'overview';
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      to: profilePaths.overview(userId),
    },
    ...(role === 'SELLER'
      ? [
          {
            key: 'followers',
            label: 'Followers',
            to: profilePaths.followers(userId),
          },
        ]
      : []),
    ...(role === 'BIDDER'
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
