import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MAX_PRODUCT_IMAGES } from '@modules/product/product.constant';

export class ProductImageDto {
  @IsString({
    message: 'Image key must be a string.',
  })
  imageKey: string;

  @IsBoolean({
    message: 'Primary flag must be a boolean.',
  })
  isPrimary: boolean;
}

export class UpdateProductImagesDto {
  @IsArray({
    message: 'Images must be an array.',
  })
  @ArrayMinSize(1, {
    message: 'At least one image is required.',
  })
  @ArrayMaxSize(MAX_PRODUCT_IMAGES, {
    message: `A product can have at most ${MAX_PRODUCT_IMAGES} images.`,
  })
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images: ProductImageDto[];
}
