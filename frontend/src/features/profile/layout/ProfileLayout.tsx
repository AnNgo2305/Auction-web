import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { DeleteImageDialog } from '@/features/profile/components/DeleteImageConfirmDialog';
import { UploadImageDialog } from '@/features/profile/components/UploadImageDialog';
import { ProfileCoverImage } from '@/features/profile/components/ProfileCoverImage';
import { ProfileAvatarImage } from '@/features/profile/components/ProfileAvatarImage';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { useGetProfile } from '@/features/profile/hooks/profile/useGetProfile';
import { useUser } from '@/shared/contexts/UserContext';
import { ProfileTabs } from '@/features/profile/components/ProfileTabs';
import { useUpdateProfileImage } from '@/features/profile/hooks/profile/useUpdateProfileImage';
import { useUpdateCoverImage } from '@/features/profile/hooks/profile/useUpdateCoverImage';
import { uploadToS3 } from '@/shared/utils/upload-files-s3';
import { toast } from 'sonner';
import { IMAGE_TYPES, type ImageType } from '@/shared/types/user.ts';
import { UPLOAD_PURPOSES } from '@/shared/types/upload.ts';

export function ProfileLayout() {
  const { userId } = useParams<{ userId: string }>();
  const [uploadAvatarImageDialogOpen, setUploadAvatarImageDialogOpen] =
    useState(false);
  const [uploadCoverImageDialogOpen, setUploadCoverImageDialogOpen] =
    useState(false);
  const [deleteAvatarImageDialogOpen, setDeleteAvatarImageDialogOpen] =
    useState(false);
  const [deleteCoverImageDialogOpen, setDeleteCoverImageDialogOpen] =
    useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [isCoverSaving, setIsCoverSaving] = useState(false);

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const { isCurrentUser, updateProfileImageUrl, updateCoverImageUrl } = useUser();

  const {
    data: profile,
    isLoading: isInitialProfileLoading,
    isFetching: isProfileRefreshing,
    isError,
    error,
  } = useGetProfile(userId ?? '');

  const updateProfileImageMutation = useUpdateProfileImage(userId ?? '', (res) => {
    updateProfileImageUrl(res.data.profileImageUrl);
    toast.success(res.message);
  });

  const updateCoverImageMutation = useUpdateCoverImage(userId ?? '', (res) => {
    updateCoverImageUrl(res.data.coverImageUrl);
    toast.success(res.message);
  });

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="bg-muted/30 rounded-xl border px-8 py-6 shadow-sm">
          <h2 className="text-center text-lg font-medium">
            {error?.message ?? 'Profile not found'}
          </h2>
        </div>
      </div>
    );
  }

  const isOwner = profile ? isCurrentUser(profile.userId) : false;
  const isOnline = false;

  const handleDeleteImage = (type: ImageType) => {
    if (type === IMAGE_TYPES.AVATAR) {
      setDeleteAvatarImageDialogOpen(false);
    } else {
      setDeleteCoverImageDialogOpen(false);
    }
  };

  const handleSaveAvatarImage = async (file: File) => {
    setIsAvatarSaving(true);
    try {
      const [uploadedFile] = await uploadToS3([file], UPLOAD_PURPOSES.AVATAR);
      if (uploadedFile) {
        await updateProfileImageMutation.mutateAsync({
          imageKey: uploadedFile.key,
        });
      }
    } catch {
      toast.error('Failed to upload profile photo.');
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const handleSaveCoverImage = async (file: File) => {
    setIsCoverSaving(true);
    try {
      const [uploadedFile] = await uploadToS3([file], UPLOAD_PURPOSES.COVER);
      if (uploadedFile) {
        await updateCoverImageMutation.mutateAsync({
          imageKey: uploadedFile.key,
        });
      }
    } catch {
      toast.error('Failed to upload cover photo.');
    } finally {
      setIsCoverSaving(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-9/12 space-y-6">
      <ProfileCoverImage
        coverImageUrl={profile?.coverImageUrl}
        isOwner={isOwner}
        isInitialProfileLoading={isInitialProfileLoading}
        isProfileRefreshing={isProfileRefreshing}
        isSaving={isCoverSaving}
        setUploadCoverImageDialogOpen={setUploadCoverImageDialogOpen}
        setDeleteCoverImageDialogOpen={setDeleteCoverImageDialogOpen}
      />
      <div className="-mt-20 px-10">
        <div className="flex items-center gap-5">
          <ProfileAvatarImage
            avatarImageUrl={profile?.profileImageUrl}
            isOwner={isOwner}
            isOnline={isOnline}
            isInitialProfileLoading={isInitialProfileLoading}
            isProfileRefreshing={isProfileRefreshing}
            isSaving={isAvatarSaving}
            setUploadAvatarImageDialogOpen={setUploadAvatarImageDialogOpen}
            setDeleteAvatarImageDialogOpen={setDeleteAvatarImageDialogOpen}
          />
          <div className="flex-1 pt-22">
            <ProfileHeader
              userId={profile?.userId}
              username={profile?.username}
              fullName={profile?.fullName}
              bio={profile?.bio}
              role={profile?.role}
              followerCount={profile?.followerCount}
              followingCount={profile?.followingCount}
              mutualFollowedSellerCount={profile?.mutualFollowedSellerCount}
              relationshipStatus={profile?.relationship.status}
              isInitialProfileLoading={isInitialProfileLoading}
            />
          </div>
        </div>
      </div>
      <ProfileTabs
        isOwner={isOwner}
        role={profile?.role}
        isLoading={isInitialProfileLoading}
      />
      <div className="px-6 pb-8">
        <Outlet
          context={{
            profile,
            isOwner,
            isInitialProfileLoading,
            isProfileRefreshing,
          }}
        />
      </div>
      <UploadImageDialog
        open={uploadAvatarImageDialogOpen}
        cropType="avatar"
        title="Upload profile photo"
        description="Choose a square image to use as your profile photo."
        selectedFile={selectedAvatarFile}
        onOpenChange={setUploadAvatarImageDialogOpen}
        onFileChange={setSelectedAvatarFile}
        onSave={handleSaveAvatarImage}
      />
      <UploadImageDialog
        open={uploadCoverImageDialogOpen}
        cropType="cover"
        title="Upload cover photo"
        description="Choose a wide image for your profile cover. It will be cropped to fit the banner area."
        selectedFile={selectedCoverFile}
        onOpenChange={setUploadCoverImageDialogOpen}
        onFileChange={setSelectedCoverFile}
        onSave={handleSaveCoverImage}
      />
      <DeleteImageDialog
        open={deleteAvatarImageDialogOpen}
        type={IMAGE_TYPES.AVATAR}
        onOpenChange={setDeleteAvatarImageDialogOpen}
        onDeleteImage={handleDeleteImage}
      />
      <DeleteImageDialog
        open={deleteCoverImageDialogOpen}
        type={IMAGE_TYPES.COVER}
        onOpenChange={setDeleteCoverImageDialogOpen}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
}
