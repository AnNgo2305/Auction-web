export enum UserRole {
  ADMIN = 'ADMIN',
  BIDDER = 'BIDDER',
  SELLER = 'SELLER',
}

export interface CurrentUser {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
}
