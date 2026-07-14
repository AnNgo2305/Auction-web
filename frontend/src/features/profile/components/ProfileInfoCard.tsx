import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Mail, Calendar, User, Phone, Cake, VenusAndMars, Edit, Info } from 'lucide-react';
import type { ElementType } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { ProfileOutletContext } from '@/features/profile/types/profile/profile-outlet-context';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';

const GENDER_LABEL: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

type ProfileItem = {
  icon: ElementType;
  label: string;
  value: string;
};

export function ProfileInfoCard() {
  const { isOwner, profile, isInitialProfileLoading } = useOutletContext<ProfileOutletContext>();

  const navigate = useNavigate();

  if (isInitialProfileLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-28" />
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />

              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const handleEdit = () => {
    navigate(profilePaths.edit(profile.userId));
  };

  const items: ProfileItem[] = [
    {
      icon: Mail,
      label: 'Email',
      value: profile.email ?? '...',
    },
    {
      icon: Calendar,
      label: 'Member since',
      value: profile.createdAt ? formatIsoToDate(profile.createdAt) : '...',
    },
    {
      icon: User,
      label: 'Full name',
      value: profile.fullName ?? '...',
    },
    {
      icon: Phone,
      label: 'Phone number',
      value: profile.phoneNumber ?? '...',
    },
    {
      icon: Cake,
      label: 'Date of birth',
      value: profile.dateOfBirth ? formatIsoToDate(profile.dateOfBirth) : '...',
    },
    {
      icon: VenusAndMars,
      label: 'Gender',
      value: profile.gender
        ? (GENDER_LABEL[profile.gender] ?? profile.gender)
        : '...',
    },
  ];

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-bold tracking-wide uppercase">
          <Info className="text-primary h-5 w-5" />
          <span>About</span>
        </CardTitle>
        {isOwner && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="absolute top-1/2 right-6 -translate-y-1/2"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Edit profile</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <item.icon className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">
                {item.label}
              </span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
