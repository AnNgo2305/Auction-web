import { ApiProperty } from '@nestjs/swagger';

export class ActiveSessionResponseDto {
  @ApiProperty({
    description: 'Refresh token session ID',
    example: 'clx123abc456',
  })
  id: string;

  @ApiProperty({
    description: 'Authentication provider',
    example: 'password',
  })
  provider: string;

  @ApiProperty({
    description: 'Device identifier',
    example: 'device-abc-123',
    nullable: true,
  })
  deviceId: string | null;

  @ApiProperty({
    description: 'IP address of the session',
    example: '192.168.1.10',
    nullable: true,
  })
  ip: string | null;

  @ApiProperty({
    description: 'User agent of the session',
    example: 'Mozilla/5.0',
    nullable: true,
  })
  userAgent: string | null;

  @ApiProperty({
    description: 'Time when the session was created',
    example: '2026-09-21T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Time when the session was last used',
    example: '2026-09-21T12:30:00.000Z',
  })
  lastUsedAt: Date;

  @ApiProperty({
    description: 'Time when the session expires',
    example: '2026-10-21T10:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Whether this is the current session',
    example: true,
  })
  isCurrent: boolean;
}
