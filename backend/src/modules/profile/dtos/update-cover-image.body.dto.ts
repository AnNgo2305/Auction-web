import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCoverImageDto {
  @ApiProperty({
    description: 'Storage key of the cover image',
    example: 'users/550e8400-e29b-41d4-a716-446655440000/cover.jpg',
  })
  @IsString()
  @IsNotEmpty()
  imageKey!: string;
}
