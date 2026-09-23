import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResultDto {
  @ApiProperty({
    description: 'Presigned URL used to upload the file',
    example: 'https://storage.example.com/presigned-upload-url',
  })
  uploadUrl!: string;
  @ApiProperty({
    description: 'Storage key of the uploaded file',
    example: 'users/550e8400-e29b-41d4-a716-446655440000/avatar/image.jpg',
  })
  key!: string;
}

export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'Presigned upload URLs and their corresponding storage keys',
    type: [PresignedUrlResultDto],
  })
  urls: PresignedUrlResultDto[];
}
