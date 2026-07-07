import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { ProfileAvatarImage } from '@/features/profile/components/ProfileAvatarImage';
import { ProfileCoverImage } from '@/features/profile/components/ProfileCoverImage';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';
import { UploadImageDialog } from '@/features/profile/components/UploadImageDialog';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  // TODO: Replace with real API
  // const { data: profile, isLoading } = useGetProfileQuery(userId!);

  const isLoading = false;

  const profile = {
    email: 'john@example.com',
    username: 'john_doe',
    fullName: 'John Doe',
    phoneNumber: '0123456789',
    bio: 'Fullstack Developer | Coffee Lover ☕',
    profileImageUrl: null,
    coverImageUrl: null,
    createdAt: new Date(),
    dateOfBirth: new Date('2000-01-01'),
    gender: 'MALE',
    role: 'SELLER',
    followerCount: 128,
    followingCount: 76,
    mutualFollowedSellerCount: 5,
    relationship: {
      status: 'NOT_FOLLOWING',
    },
  };

  // TODO: Replace with real logic
  const isOwner = false;
  const isOnline = true;

  // Upload dialogs
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);

  // Selected files
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="relative">
          <ProfileCoverImage
            coverImageUrl={profile.coverImageUrl}
            isOwner={isOwner}
            isLoading={isLoading}
            onUpload={() => setCoverDialogOpen(true)}
            onDelete={() => {}}
          />

          <div className="px-8">
            <div className="-mt-16 flex items-end gap-6">
              <ProfileAvatarImage
                avatarImageUrl={profile.profileImageUrl}
                isOwner={isOwner}
                isOnline={isOnline}
                isLoading={isLoading}
                onUpload={() => setAvatarDialogOpen(true)}
                onDelete={() => {}}
              />

              <div className="flex-1 pb-2">
                <ProfileHeader
                  username={profile.username}
                  fullName={profile.fullName}
                  bio={profile.bio}
                  role={profile.role}
                  followerCount={profile.followerCount}
                  followingCount={profile.followingCount}
                  mutualFollowedSellerCount={profile.mutualFollowedSellerCount}
                  relationship={profile.relationship}
                  isOwner={isOwner}
                />
              </div>
            </div>
          </div>
        </div>

        <ProfileInfoCard
          email={profile.email}
          createdAt={profile.createdAt}
          fullName={profile.fullName}
          phoneNumber={profile.phoneNumber}
          dateOfBirth={profile.dateOfBirth}
          gender={profile.gender}
          isOwner={isOwner}
        />
      </div>

      {/* Avatar Upload Dialog */}
      <UploadImageDialog
        open={avatarDialogOpen}
        cropType="avatar"
        title="Update profile photo"
        description="Upload and crop your new profile photo."
        selectedFile={avatarFile}
        onOpenChange={setAvatarDialogOpen}
        onFileChange={setAvatarFile}
        onSave={(file) => {
          console.log('Avatar:', file);
        }}
      />

      {/* Cover Upload Dialog */}
      <UploadImageDialog
        open={coverDialogOpen}
        cropType="cover"
        title="Update cover photo"
        description="Upload and crop your new cover photo."
        selectedFile={coverFile}
        onOpenChange={setCoverDialogOpen}
        onFileChange={setCoverFile}
        onSave={(file) => {
          console.log('Cover:', file);
        }}
      />
    </>
  );
}
