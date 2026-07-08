import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
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
import { useNavigate } from 'react-router-dom';
import type { Gender } from '@/features/profile/types/profile.type';

interface ProfileInfoCardProps {
  email: string;
  createdAt: string | Date;
  fullName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | Date | null;
  gender: Gender | null;
  isOwner: boolean;
}

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

export function ProfileInfoCard(props: ProfileInfoCardProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  const joinDate = new Date(props.createdAt).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const items = [
    {
      icon: Mail,
      label: "Email",
      value: props.email,
    },
    props.fullName && {
      icon: User,
      label: "Full name",
      value: props.fullName,
    },
    props.phoneNumber && {
      icon: Phone,
      label: "Phone number",
      value: props.phoneNumber,
    },
    props.dateOfBirth && {
      icon: Cake,
      label: "Date of birth",
      value: new Date(props.dateOfBirth).toLocaleDateString("vi-VN"),
    },
    props.gender && {
      icon: VenusAndMars,
      label: "Gender",
      value: GENDER_LABEL[props.gender] ?? props.gender,
    },
    {
      icon: Calendar,
      label: "Member since",
      value: joinDate,
    },
  ].filter(Boolean) as ProfileItem[];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        {props.isOwner && (
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
