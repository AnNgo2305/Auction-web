import { ApiProperty } from '@nestjs/swagger';

export class ProductCategoryDto {
  @ApiProperty({
    description: 'Product category ID',
    example: '018f3c5e-7b3a-7abc-8def-1234567890ab',
  })
  categoryId!: string;

  @ApiProperty({
    description: 'Product category name',
    example: 'Electronics',
  })
  name!: string;

  @ApiProperty({
    description: 'Category color in hexadecimal format',
    example: '#3B82F6',
  })
  color!: string;
}

export class GetMyProductCategoriesResponseDto {
  @ApiProperty({
    description:
      'List of product categories created by the authenticated seller',
    type: [ProductCategoryDto],
  })
  categories!: ProductCategoryDto[];
}
