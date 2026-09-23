import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
export class ConfirmUploadRequestDto {
  @ApiProperty({
    description: 'Storage keys of the uploaded files to confirm',
    type: [String],
    example: [
      'users/550e8400-e29b-41d4-a716-446655440000/avatar/image.jpg',
      'products/660e8400-e29b-41d4-a716-446655440000/manual.pdf',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  keys!: string[];
}
