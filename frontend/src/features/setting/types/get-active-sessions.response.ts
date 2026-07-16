import type { ApiResponse } from '@/shared/types/response';

export class ActiveSessionData {
  id: string;

  provider: string;

  deviceId: string | null;

  ip: string | null;

  userAgent: string | null;

  createdAt: string;

  lastUsedAt: string;

  expiresAt: string;
}

export type GetActiveSessionsResponse = ApiResponse<ActiveSessionData[]>;
