export const PROFILE_ROUTES = {
  OVERVIEW: ':userId',
  FOLLOWERS: ':userId/followers',
  FOLLOWING: ':userId/following',
  EDIT: ':userId/edit',
  ADDRESSES: ':userId/addresses',
} as const;

export const profilePaths = {
  overview: (userId: string) => `/profile/${userId}`,
  edit: (userId: string) => `/profile/${userId}/edit`,
  followers: (userId: string) => `/profile/${userId}/followers`,
  following: (userId: string) => `/profile/${userId}/following`,
  addresses: (userId: string) => `/profile/${userId}/addresses`,
} as const;
