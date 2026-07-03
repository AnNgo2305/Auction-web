import { IsArray, IsString } from 'class-validator';

export class ConfirmUploadRequestDto {
  @IsArray()
  @IsString({ each: true })
  keys: string[];
}
