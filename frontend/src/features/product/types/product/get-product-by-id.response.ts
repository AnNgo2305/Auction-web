import type { ApiResponse } from '@/shared/types/response.ts';
import type { ProductStatus, PublicCategory } from '@/shared/types/product.ts';

export class UserData {
  userId!: string;

  username!: string;
}

export class ProductCategoryData {
  categoryId!: string;

  name!: string;
}

export class ProductImageData {
  imageId!: string;

  imageUrl!: string;

  isPrimary!: boolean;

  imageKey!: string;
}

export class ProductDocumentData {
  documentId!: string;

  documentName!: string;

  documentUrl!: string;

  documentKey!: string;
}

export class ProductData {
  productId!: string;

  name!: string;

  description!: string | null;

  stockQuantity!: number;

  status!: ProductStatus;

  publicCategory!: PublicCategory;

  seller!: UserData;

  createdAt!: string;

  updatedAt!: string;

  categories!: ProductCategoryData[];

  images!: ProductImageData[];

  documents!: ProductDocumentData[];
}

export type GetProductByIdResponse = ApiResponse<ProductData>;
