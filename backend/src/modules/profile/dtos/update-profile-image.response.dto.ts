import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileImageResponseDto {
  @ApiProperty({
    description: 'URL of the updated profile image',
    nullable: true,
  })
  profileImageUrl: string | null;
}
