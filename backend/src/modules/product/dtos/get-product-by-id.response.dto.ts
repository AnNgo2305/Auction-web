import type { ProductStatus, PublicCategory } from '@generated/prisma/enums';

export class ProductImageDto {
  imageId!: string;

  imageUrl!: string;

  isPrimary!: boolean;

  imageKey!: string;
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

  documentKey!: string;
}

export class GetProductByIdResponseDto {
  productId!: string;

  name!: string;

  description?: string;

  stockQuantity!: number;

  status!: ProductStatus;

  publicCategory!: PublicCategory;

  seller!: UserResponseDto;

  createdAt!: Date;

  updatedAt!: Date;

  categories!: ProductCategoryDto[];

  images!: ProductImageDto[];

  documents!: ProductDocumentDto[];
}
