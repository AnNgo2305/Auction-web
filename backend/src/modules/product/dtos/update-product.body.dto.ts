import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsUUID,
} from 'class-validator';
import { ProductStatus } from '@generated/prisma/enums';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsUUID()
  productId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @IsEnum(ProductStatus)
  status!: ProductStatus;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? (value as string[]) : [value as string];
  })
  categoryIds?: string[];
}
