import type { ProductStatus } from '@generated/prisma/enums';

export class ProductImageDto {
  imageId!: string;

  imageUrl!: string;

  isPrimary!: boolean;
}

export class ProductCategoryDto {
  categoryId!: string;

  name!: string;
}

export class UserResponseDto {
  userId!: string;

  username!: string;
}

export class ProductDocumentDto {
  documentId!: string;

  documentName!: string;

  documentUrl!: string;
}

export class GetProductResponseDto {
  productId!: string;

  name!: string;

  description?: string;

  stockQuantity!: number;

  status!: ProductStatus;

  seller!: UserResponseDto;

  createdAt!: Date;

  updatedAt!: Date;

  categories!: ProductCategoryDto[];

  images!: ProductImageDto[];

  documents!: ProductDocumentDto[];
}
