import type { ApiResponse } from '@/shared/types/response';

export class UpdateProfileData {
  fullName!: string | null;

  phoneNumber!: string | null;

  bio!: string | null;

  dateOfBirth!: string | null;

  gender!: string | null;
}

export type UpdateProfileResponse = ApiResponse<UpdateProfileData>;
