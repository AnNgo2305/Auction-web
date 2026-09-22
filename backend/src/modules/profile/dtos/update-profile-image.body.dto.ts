import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileImageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Storage key of the profile image',
    example: 'users/550e8400-e29b-41d4-a716-446655440000/avatar.jpg',
  })
  imageKey!: string;
}
