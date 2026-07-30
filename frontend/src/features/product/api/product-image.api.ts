import { api } from '@/shared/api/axios';
import type { UpdateProductImagesBody } from '@/features/product/schemas/product-image/update-product-images.schema';
import type { DeleteProductImagesBody } from '@/features/product/schemas/product-image/delete-product-images.schema';
import type { UpdateProductImagesResponse } from '@/features/product/types/product-image/update-product-images.response';
import type { DeleteProductImageResponse } from '@/features/product/types/product-image/delete-product-image.response';
import type { DeleteProductImagesResponse } from '@/features/product/types/product-image/delete-product-images.response';
import type { SetPrimaryProductImageResponse } from '@/features/product/types/product-image/set-primary-product-image.response';

const PRODUCT_IMAGE_API_PREFIX = '/product-images';

export const productImageApi = {
  updateProductImages: async (
    productId: string,
    body: UpdateProductImagesBody,
  ): Promise<UpdateProductImagesResponse> => {
    const res = await api.put<UpdateProductImagesResponse>(
      `${PRODUCT_IMAGE_API_PREFIX}/${productId}/images`,
      body,
    );

    return res.data;
  },

  deleteProductImage: async (
    productId: string,
    imageId: string,
  ): Promise<DeleteProductImageResponse> => {
    const res = await api.delete<DeleteProductImageResponse>(
      `${PRODUCT_IMAGE_API_PREFIX}/${productId}/images/${imageId}`,
    );

    return res.data;
  },

  deleteProductImages: async (
    productId: string,
    body: DeleteProductImagesBody,
  ): Promise<DeleteProductImagesResponse> => {
    const res = await api.delete<DeleteProductImagesResponse>(
      `${PRODUCT_IMAGE_API_PREFIX}/${productId}/images`,
      {
        data: body,
      },
    );

    return res.data;
  },

  setPrimaryImage: async (
    productId: string,
    imageId: string,
  ): Promise<SetPrimaryProductImageResponse> => {
    const res = await api.patch<SetPrimaryProductImageResponse>(
      `${PRODUCT_IMAGE_API_PREFIX}/${productId}/images/${imageId}/primary`,
    );

    return res.data;
  },
};
