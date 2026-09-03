import type { ApiResponse } from '@/shared/types/response';

export class GetUnreadCountData {
  unreadCount!: number;
}

export type GetUnreadCountResponse = ApiResponse<GetUnreadCountData>;
