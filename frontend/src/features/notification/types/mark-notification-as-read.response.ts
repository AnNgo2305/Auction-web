import type { ApiResponse } from '@/shared/types/response';
import type { NotificationDto } from '@/features/notification/types/notification.dto';

export type MarkNotificationAsReadResponse = ApiResponse<NotificationDto>;
