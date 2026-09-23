import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicCategory } from '@generated/prisma/enums';

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

export class GetProductsResponseDto {
  @ApiProperty({
    description: 'Seller ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  sellerId!: string;

  @ApiProperty({
    description: 'Seller username',
    example: 'nguyenvana',
  })
  sellerName!: string;

  @ApiProperty({
    description: 'Product ID',
    example: '770e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  productId!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Sony Alpha Camera',
  })
  name!: string;

  @ApiProperty({
    description: 'Public category of the product',
    enum: PublicCategory,
    example: PublicCategory.ELECTRONICS,
  })
  publicCategory!: PublicCategory;

  @ApiPropertyOptional({
    description: 'Product thumbnail URL',
    example: 'https://storage.example.com/products/camera/thumbnail.jpg',
  })
  thumbnail?: string;

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
}
