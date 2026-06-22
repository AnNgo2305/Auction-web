import type { ApiResponse } from '@/shared/types/response.ts';

export class RegisterData {
  userId!: string;

  email!: string;

  message!: string;
}

export type RegisterResponse = ApiResponse<RegisterData>;
