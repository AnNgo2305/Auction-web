import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Mail,
  Calendar,
  User,
  Phone,
  Cake,
  VenusAndMars,
  Edit,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { ProfileOutletContext } from '@/features/profile/types/profile/profile-outlet-context.ts';
import { profilePaths } from '@/features/profile/constants/profile.routes';

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
  const navigate = useNavigate();
  const { isOwner, profile, isInitialProfileLoading } = useOutletContext<ProfileOutletContext>();

  const handleEdit = () => {
    navigate(profilePaths.edit(profile.userId));
  };

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

  const joinDate = new Date(profile.createdAt).toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const items = [
    {
      icon: Mail,
      label: 'Email',
      value: profile.email,
    },
    profile.fullName && {
      icon: User,
      label: 'Full name',
      value: profile.fullName,
    },
    profile.phoneNumber && {
      icon: Phone,
      label: 'Phone number',
      value: profile.phoneNumber,
    },
    profile.dateOfBirth && {
      icon: Cake,
      label: 'Date of birth',
      value: new Date(profile.dateOfBirth).toLocaleDateString('vi-VN'),
    },
    profile.gender && {
      icon: VenusAndMars,
      label: 'Gender',
      value: GENDER_LABEL[profile.gender] ?? profile.gender,
    },
    {
      icon: Calendar,
      label: 'Member since',
      value: joinDate,
    },
  ].filter(Boolean) as ProfileItem[];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        {isOwner && (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
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
