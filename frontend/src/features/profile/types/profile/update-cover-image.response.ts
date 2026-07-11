import type { ApiResponse } from '@/shared/types/response';

export class UpdateCoverImageData {
  coverImageUrl!: string;
}

export type UpdateCoverImageResponse = ApiResponse<UpdateCoverImageData>;
