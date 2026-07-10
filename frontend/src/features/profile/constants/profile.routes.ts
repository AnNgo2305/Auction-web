export const PROFILE_ROUTES = {
  OVERVIEW: '/profile/:userId',
  FOLLOWERS: '/profile/:userId/followers',
  FOLLOWING: '/profile/:userId/following',
  EDIT: '/profile/:userId/edit',
} as const;

export const profilePaths = {
  overview: (userId: string) => `/profile/${userId}`,
  edit: (userId: string) => `/profile/${userId}/edit`,
  followers: (userId: string) => `/profile/${userId}/followers`,
  following: (userId: string) => `/profile/${userId}/following`,
} as const;
