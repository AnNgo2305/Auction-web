import type { ApiResponse } from '@/shared/types/response';

export class UpdateProfileImageData {
  profileImageUrl!: string;
}

export type UpdateProfileImageResponse = ApiResponse<UpdateProfileImageData>;
