export const UPDATE_PROFILE_ERROR_MESSAGES: Record<string, string> = {
  PROFILE_NOT_FOUND: 'We couldn’t find your profile. Please try again later.',
  DEFAULT:
    'Something went wrong while updating your profile. Please try again.',
} as const;

export const DELETE_COVER_IMAGE_ERROR_MESSAGES: Record<string, string> = {
  PROFILE_NOT_FOUND: 'We couldn’t find your profile. Please try again later.',
  DEFAULT:
    'Something went wrong while deleting your cover image. Please try again.',
} as const;

export const DELETE_PROFILE_IMAGE_ERROR_MESSAGES: Record<string, string> = {
  PROFILE_NOT_FOUND: 'We couldn’t find your profile. Please try again later.',
  DEFAULT:
    'Something went wrong while deleting your profile photo. Please try again.',
} as const;
