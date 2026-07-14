export const IMAGE_TYPES = {
  AVATAR: 'AVATAR',
  COVER: 'COVER',
} as const;

export type ImageType = (typeof IMAGE_TYPES)[keyof typeof IMAGE_TYPES];

export const GENDERS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type Gender = (typeof GENDERS)[keyof typeof GENDERS];

export const ROLES = {
  SELLER: 'SELLER',
  BIDDER: 'BIDDER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
