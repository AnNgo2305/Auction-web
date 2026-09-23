import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmUploadItemDto {
  @ApiProperty({
    description: 'Storage key of the uploaded file',
    example: 'users/550e8400-e29b-41d4-a716-446655440000/avatar/image.jpg',
  })
  key!: string;

  @ApiProperty({
    description: 'Whether the file exists in storage',
    example: true,
  })
  exists!: boolean;

  @ApiPropertyOptional({
    description: 'Size of the uploaded file in bytes',
    example: 245760,
  })
  size?: number;

  @ApiPropertyOptional({
    description: 'Public URL of the uploaded file',
    example: 'https://storage.example.com/users/.../avatar/image.jpg',
  })
  url?: string;
}

export class ConfirmUploadResponseDto {
  @ApiProperty({
    description: 'Confirmation results for the uploaded files',
    type: [ConfirmUploadItemDto],
  })
  files!: ConfirmUploadItemDto[];
}
