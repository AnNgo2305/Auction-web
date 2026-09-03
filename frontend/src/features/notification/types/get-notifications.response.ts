import type { ApiResponse } from '@/shared/types/response';
import type { NotificationDto } from '@/features/notification/types/notification.dto';

export class GetNotificationsData {
  notifications!: NotificationDto[];
  nextCursor!: string | null;
}

export type GetNotificationsResponse = ApiResponse<GetNotificationsData>;
