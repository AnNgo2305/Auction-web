import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ProductStatusBulkActionDto {
  @Type(() => String)
  @IsArray({
    message: 'Product IDs must be an array.',
  })
  @ArrayNotEmpty({
    message: 'Product IDs must not be empty.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Each product ID must be a valid UUID.',
  })
  productIds!: string[];
}
