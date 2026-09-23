import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, PublicCategory } from '@generated/prisma/enums';

export class ProductImageDto {
  @ApiProperty({
    description: 'Product image ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  imageId!: string;

  @ApiProperty({
    description: 'Public URL of the product image',
    example: 'https://storage.example.com/products/660e8400/image.jpg',
  })
  imageUrl!: string;

  @ApiProperty({
    description: 'Whether this is the primary product image',
    example: true,
  })
  isPrimary!: boolean;

  @ApiProperty({
    description: 'Storage key of the product image',
    example:
      'users/550e8400-e29b-41d4-a716-446655440000/products/660e8400-e29b-41d4-a716-446655440000/image.jpg',
  })
  imageKey!: string;
}

export class ProductCategoryDto {
  @ApiProperty({
    description: 'Product category ID',
    example: '770e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  categoryId!: string;

  @ApiProperty({
    description: 'Product category name',
    example: 'Electronics',
  })
  name!: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '880e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    description: 'Username',
    example: 'nguyenvana',
  })
  username!: string;
}

export class ProductDocumentDto {
  @ApiProperty({
    description: 'Product document ID',
    example: '990e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  documentId!: string;

  @ApiProperty({
    description: 'Display name of the product document',
    example: 'User Manual.pdf',
  })
  documentName!: string;

  @ApiProperty({
    description: 'Public URL of the product document',
    example: 'https://storage.example.com/products/660e8400/manual.pdf',
  })
  documentUrl!: string;

  @ApiProperty({
    description: 'Storage key of the product document',
    example:
      'users/550e8400-e29b-41d4-a716-446655440000/products/660e8400-e29b-41d4-a716-446655440000/manual.pdf',
  })
  documentKey!: string;
}

export class GetProductByIdResponseDto {
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

  @ApiProperty({
    description: 'Public category of the product',
    enum: PublicCategory,
    example: PublicCategory.ELECTRONICS,
  })
  publicCategory!: PublicCategory;

  @ApiProperty({
    description: 'Seller information',
    type: UserResponseDto,
  })
  seller!: UserResponseDto;

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

  @ApiProperty({
    description: 'Product categories',
    type: [ProductCategoryDto],
  })
  categories!: ProductCategoryDto[];

  @ApiProperty({
    description: 'Product images',
    type: [ProductImageDto],
  })
  images!: ProductImageDto[];

  @ApiProperty({
    description: 'Product documents',
    type: [ProductDocumentDto],
  })
  documents!: ProductDocumentDto[];
}
