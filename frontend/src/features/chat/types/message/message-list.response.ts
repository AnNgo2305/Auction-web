import type { ApiResponse } from '@/shared/types/response';
import type { MessageData } from './message';

export class GetMessagesData {
  messages!: MessageData[];

  nextCursor!: string | null;
}

export type MessageListResponse = ApiResponse<GetMessagesData>;
