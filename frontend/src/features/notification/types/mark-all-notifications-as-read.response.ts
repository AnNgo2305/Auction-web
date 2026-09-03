import type { ApiResponse } from '@/shared/types/response';

export class MarkAllNotificationsAsReadData {
  count!: number;
}

export type MarkAllNotificationsAsReadResponse =
  ApiResponse<MarkAllNotificationsAsReadData>;
