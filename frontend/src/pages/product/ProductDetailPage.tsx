import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { useUser } from '@/shared/contexts/UserContext';
import { useGetProductById } from '@/features/product/hooks/product/useGetProductById';
import { PRODUCT_STATUSES, PUBLIC_CATEGORIES } from '@/shared/types/product';
import { updateProductBodySchema } from '@/features/product/schemas/product/update-product.schema';
import { ProductHeader } from '@/features/product/components/product-detail/ProductHeader';
import { ProductImageViewer } from '@/features/product/components/product-detail/ProductImageViewer';
import { ProductImageEditor } from '@/features/product/components/product-detail/ProductImageEditor';
import { ProductInformationCard } from '@/features/product/components/product-detail/ProductInformationCard';
import { ProductBasicInformationForm } from '@/features/product/components/product-detail/ProductInformationForm';
import { ProductDocument } from '@/features/product/components/product-detail/ProductDocument';
import { ProductComment } from '@/features/product/components/product-detail/ProductComment';

export function ProductDetailPage() {
  const { productId } = useParams();
  const { currentUser } = useUser();
  const {
    data: product,
    isLoading: isLoadingProduct,
    isError,
  } = useGetProductById(productId!);

  const [isEditingInformation, setIsEditingInformation] = useState(false);
  const [isEditingImages, setIsEditingImages] = useState(false);
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateProductBodySchema),
    defaultValues: {
      productId: '',
      name: '',
      description: '',
      stockQuantity: 0,
      status: PRODUCT_STATUSES.DRAFT,
      publicCategory: PUBLIC_CATEGORIES.OTHER,
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (!product) return;

    form.reset({
      productId: product.productId,
      name: product.name,
      description: product.description ?? '',
      stockQuantity: product.stockQuantity,
      status: product.status,
      publicCategory: product.publicCategory,
      categoryIds: product.categories.map((c) => c.categoryId),
    });
  }, [product, form]);

  if (isLoadingProduct) {
    return (
      <div className="container py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <ProductHeader
            name=""
            publicCategory={PUBLIC_CATEGORIES.OTHER}
            isOwner={false}
            isEditing={false}
            isLoading
          />

          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <ProductImageViewer images={[]} isOwner={false} isLoading />

            <ProductInformationCard
              name=""
              description=""
              stockQuantity={0}
              status={PRODUCT_STATUSES.DRAFT}
              publicCategory={PUBLIC_CATEGORIES.OTHER}
              sellerId=""
              sellerName=""
              createdAt=""
              updatedAt=""
              categories={[]}
              isLoading
            />
          </div>

          <ProductDocument
            productId=""
            documents={[]}
            isOwner={false}
            isEditing={false}
            isLoading
          />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12 text-center">
        <h2 className="text-2xl font-semibold">Product not found</h2>

        <p className="text-muted-foreground max-w-md">
          The product you're looking for doesn't exist or may have been removed.
        </p>
      </div>
    );
  }

  const isOwner = currentUser?.userId === product.seller.userId;

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <ProductHeader
          name={product.name}
          publicCategory={product.publicCategory}
          isOwner={isOwner}
          isEditing={isEditingInformation}
          onEnterEditMode={() => setIsEditingInformation(true)}
          onExitEditMode={() => setIsEditingInformation(false)}
        />

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          {isEditingImages ? (
            <ProductImageEditor
              productId={product.productId}
              images={product.images.map((image) => ({
                id: image.imageId,
                imageUrl: image.imageUrl,
                imageKey: image.imageKey,
                isPrimary: image.isPrimary,
                status: 'done',
                isNew: false,
              }))}
              onExitEditMode={() => setIsEditingImages(false)}
            />
          ) : (
            <ProductImageViewer
              images={product.images}
              isOwner={isOwner}
              onEnterEditMode={() => setIsEditingImages(true)}
            />
          )}

          {isEditingInformation ? (
            <ProductBasicInformationForm
              productId={product.productId}
              form={form}
              sellerId={product.seller.userId}
              sellerName={product.seller.username}
              createdAt={product.createdAt}
              updatedAt={product.updatedAt}
              onExitEditMode={() => setIsEditingInformation(false)}
            />
          ) : (
            <ProductInformationCard
              name={product.name}
              description={product.description}
              stockQuantity={product.stockQuantity}
              status={product.status}
              publicCategory={product.publicCategory}
              sellerId={product.seller.userId}
              sellerName={product.seller.username}
              createdAt={product.createdAt}
              updatedAt={product.updatedAt}
              categories={product.categories}
            />
          )}
        </div>
        <ProductDocument
          productId={product.productId}
          documents={product.documents.map((document) => ({
            id: document.documentId,
            url: document.documentUrl,
            documentKey: document.documentKey,
            originalName: document.documentName,
            status: 'done',
            isNew: false,
          }))}
          isOwner={isOwner}
          isEditing={isEditingDocuments}
          onEnterEditMode={() => setIsEditingDocuments(true)}
          onExitEditMode={() => setIsEditingDocuments(false)}
        />
        <ProductComment productId={product.productId} />
      </div>
    </div>
  );
}
