import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteProductCategoriesBodyDto {
  @IsArray({ message: 'Category IDs must be an array' })
  @ArrayNotEmpty({ message: 'Category IDs cannot be empty' })
  @IsUUID('4', {
    each: true,
    message: 'Each category ID must be a valid UUID',
  })
  categoryIds: string[];
}
