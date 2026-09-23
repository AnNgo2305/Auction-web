import { ApiProperty } from '@nestjs/swagger';
import { NotificationType, Prisma } from '@generated/prisma/client';

export class NotificationDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  notificationId!: string;

  @ApiProperty({
    description: 'ID of the user receiving the notification',
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  recipientId!: string;

  @ApiProperty({
    description: 'ID of the user who triggered the notification',
    example: '770e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    nullable: true,
  })
  actorId!: string | null;

  @ApiProperty({
    description: 'Number of actors associated with the notification',
    example: 3,
  })
  actorCount!: number;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.MESSAGE,
  })
  type!: NotificationType;

  @ApiProperty({
    description: 'ID of the entity related to the notification',
    example: '880e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  entityId!: string;

  @ApiProperty({
    description: 'Type of the entity related to the notification',
    example: 'PRODUCT',
  })
  entityType!: string;

  @ApiProperty({
    description: 'Additional notification metadata',
    nullable: true,
    example: {
      actors: [
        {
          userId: '770e8400-e29b-41d4-a716-446655440000',
          username: 'nguyenvana',
          fullName: 'Nguyen Van A',
          profileImageUrl: 'https://example.com/avatar.jpg',
        },
      ],
    },
  })
  metadata!: Prisma.InputJsonValue | null;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  isRead!: boolean;

  @ApiProperty({
    description: 'Notification creation time',
    example: '2026-09-22T05:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Time when the notification was read',
    example: '2026-09-22T06:00:00.000Z',
    nullable: true,
  })
  readAt!: Date | null;
}
