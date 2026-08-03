import { create } from 'zustand';
import type { ProductImageItem } from '@/features/seller-hub/components/create-product/ProductImageUploader';
import type { ProductDocumentItem } from '@/features/seller-hub/components/create-product/ProductDocumentUploader';
import  { PRODUCT_STATUSES, type ProductStatus, type PublicCategory } from '@/shared/types/product.ts';

interface ProductDraft {
  name: string;
  description: string;
  stockQuantity: number;
  status: ProductStatus;
  publicCategory: PublicCategory | undefined;
  categoryIds: string[];
  images: ProductImageItem[];
  documents: ProductDocumentItem[];
}

interface ProductStoreState {
  product: ProductDraft;
}

interface ProductStoreActions {
  updateBasicInformation: (
    values: Partial<
      Pick<
        ProductDraft,
        'name' | 'description' | 'stockQuantity' | 'status' | 'publicCategory'
      >
    >,
  ) => void;
  resetProduct: () => void;
  setCategories: (categoryIds: string[]) => void;
  updateImages: (
    updater: (prev: ProductImageItem[]) => ProductImageItem[],
  ) => void;
  updateDocuments: (
    updater: (prev: ProductDocumentItem[]) => ProductDocumentItem[],
  ) => void;
}

type ProductStore = ProductStoreState & ProductStoreActions;

export const useProductStore = create<ProductStore>((set) => ({
  product: {
    name: '',
    description: '',
    stockQuantity: 0,
    status: PRODUCT_STATUSES.READY,
    publicCategory: undefined,
    categoryIds: [],
    images: [],
    documents: [],
  },

  updateBasicInformation: (values) =>
    set((state) => ({
      product: {
        ...state.product,
        ...values,
      },
    })),

  resetProduct: () =>
    set({
      product: {
        name: '',
        description: '',
        stockQuantity: 0,
        status: PRODUCT_STATUSES.READY,
        publicCategory: undefined,
        categoryIds: [],
        images: [],
        documents: [],
      },
    }),

  setCategories: (categoryIds) =>
    set((state) => ({
      product: {
        ...state.product,
        categoryIds,
      },
    })),

  updateImages: (updater) =>
    set((state) => ({
      product: {
        ...state.product,
        images: updater(state.product.images),
      },
    })),

  updateDocuments: (updater) =>
    set((state) => ({
      product: {
        ...state.product,
        documents: updater(state.product.documents),
      },
    })),
}));
