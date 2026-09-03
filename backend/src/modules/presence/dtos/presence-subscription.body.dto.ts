import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class PresenceSubscriptionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsUUID(undefined, {
    each: true,
    message: 'Each user ID must be a valid UUID',
  })
  userIds: string[];
}
