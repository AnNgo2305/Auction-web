import { NotificationDto } from '@modules/notification/dtos/notification.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetNotificationsResponseDto {
  @ApiProperty({
    description: 'List of notifications for the current user',
    type: [NotificationDto],
  })
  notifications: NotificationDto[];

  @ApiProperty({
    description:
      'Cursor used to retrieve the next page. Null when there are no more notifications.',
    nullable: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  nextCursor: string | null;
}
