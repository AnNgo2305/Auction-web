import { ApiProperty } from '@nestjs/swagger';

export class UpdateCoverImageResponseDto {
  @ApiProperty({
    description: 'URL of the updated cover image',
    nullable: true,
  })
  coverImageUrl!: string | null;
}
