import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class CreatePresignedDownloadUrlsRequestDto {
  @IsArray({
    message: 'keys must be an array',
  })
  @ArrayNotEmpty({
    message: 'keys must not be empty',
  })
  @IsString({
    each: true,
    message: 'each key must be a string',
  })
  keys: string[];
}
