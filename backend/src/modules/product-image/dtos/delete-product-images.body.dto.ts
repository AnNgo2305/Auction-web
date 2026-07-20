import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class DeleteProductImagesDto {
  @IsArray({
    message: 'Image IDs must be an array.',
  })
  @ArrayMinSize(1, {
    message: 'At least one image ID is required.',
  })
  @IsString({
    each: true,
    message: 'Each image ID must be a string.',
  })
  imageIds: string[];
}
