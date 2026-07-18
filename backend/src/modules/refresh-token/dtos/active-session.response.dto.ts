export class ActiveSessionResponseDto {
  id: string;

  provider: string;

  deviceId: string | null;

  ip: string | null;

  userAgent: string | null;

  createdAt: Date;

  lastUsedAt: Date;

  expiresAt: Date;

  isCurrent: boolean;
}
