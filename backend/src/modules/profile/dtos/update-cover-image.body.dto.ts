import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCoverImageDto {
  @IsString()
  @IsNotEmpty()
  imageKey!: string;
}
