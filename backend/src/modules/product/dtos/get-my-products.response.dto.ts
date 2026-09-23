import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, PublicCategory } from '@generated/prisma/enums';

export class ProductCategoryDto {
  @ApiProperty({
    description: 'Product category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  categoryId!: string;

  @ApiProperty({
    description: 'Product category name',
    example: 'Electronics',
  })
  name!: string;
}

export class GetMyProductsResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  productId!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Sony Alpha Camera',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'A mirrorless camera in excellent condition.',
  })
  description?: string;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 10,
    minimum: 0,
  })
  stockQuantity!: number;

  @ApiProperty({
    description: 'Current product status',
    enum: ProductStatus,
    example: ProductStatus.READY,
  })
  status!: ProductStatus;

  @ApiPropertyOptional({
    description: 'Product thumbnail URL',
    example: 'https://storage.example.com/products/660e8400/thumbnail.jpg',
  })
  thumbnail?: string;

  @ApiProperty({
    description: 'Public category of the product',
    enum: PublicCategory,
    example: PublicCategory.ELECTRONICS,
  })
  publicCategory!: PublicCategory;

  @ApiProperty({
    description: 'Product categories',
    type: [ProductCategoryDto],
  })
  categories!: ProductCategoryDto[];

  @ApiProperty({
    description: 'Product creation time',
    example: '2026-09-22T05:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Product last update time',
    example: '2026-09-22T06:00:00.000Z',
  })
  updatedAt!: Date;
}
