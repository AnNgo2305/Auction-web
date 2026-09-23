import { ApiProperty } from '@nestjs/swagger';

export class CreatePresignedDownloadUrlsResponseDto {
  @ApiProperty({
    description: 'Mapping of file keys to their presigned download URLs',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: {
      'users/550e8400-e29b-41d4-a716-446655440000/avatar/image.jpg':
        'https://storage.example.com/presigned-download-url',
      'products/660e8400-e29b-41d4-a716-446655440000/manual.pdf':
        'https://storage.example.com/presigned-download-url',
    },
  })
  urls: Record<string, string>;
}
