import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Storage key of the product image',
    example:
      'products/018f3c5e-7b3a-7abc-8def-1234567890ab/images/product-main.jpg',
  })
  @IsString({
    message: 'Image key must be a string.',
  })
  imageKey!: string;

  @ApiProperty({
    description: 'Whether this image is the primary product image',
    example: true,
  })
  @IsBoolean({
    message: 'Primary flag must be a boolean.',
  })
  isPrimary!: boolean;
}

export class UpdateProductImagesDto {
  @ApiProperty({
    description:
      'Product images to associate with the product. Exactly one image must be marked as primary.',
    type: [ProductImageDto],
    minItems: 1,
    maxItems: MAX_PRODUCT_IMAGES,
    example: [
      {
        imageKey:
          'products/018f3c5e-7b3a-7abc-8def-1234567890ab/images/product-main.jpg',
        isPrimary: true,
      },
      {
        imageKey:
          'products/018f3c5e-7b3a-7abc-8def-1234567890ab/images/product-side.jpg',
        isPrimary: false,
      },
    ],
  })
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
  images!: ProductImageDto[];
}
