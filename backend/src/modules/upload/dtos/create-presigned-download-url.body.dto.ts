import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreatePresignedDownloadUrlsRequestDto {
  @ApiProperty({
    description: 'Storage keys of the files to generate download URLs for',
    type: [String],
    example: [
      'users/550e8400-e29b-41d4-a716-446655440000/avatar/image.jpg',
      'products/660e8400-e29b-41d4-a716-446655440000/manual.pdf',
    ],
    minItems: 1,
  })
  @IsArray({ message: 'keys must be an array' })
  @ArrayNotEmpty({ message: 'keys must not be empty' })
  @IsString({ each: true, message: 'each key must be a string' })
  keys!: string[];
}
