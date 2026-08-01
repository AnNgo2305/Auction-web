import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProductById } from '@/features/product/hooks/product/useGetProductById';
import { ProductHeader } from '@/features/product/components/product-detail/ProductHeader';
import { ProductImageViewer } from '@/features/product/components/product-detail/ProductImageViewer';
import { ProductImageEditor } from '@/features/product/components/product-detail/ProductImageEditor';
import { ProductInformationCard } from '@/features/product/components/product-detail/ProductInformationCard';
import { ProductDocument } from '@/features/product/components/product-detail/ProductDocument';
import { ProductComment } from '@/features/product/components/product-detail/ProductComment';
import { PRODUCT_STATUSES, PUBLIC_CATEGORIES } from '@/shared/types/product';
import { useUser } from '@/shared/contexts/UserContext.tsx';

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

  if (isLoadingProduct) {
    return (
      <div className="container space-y-6 py-6">
        <ProductHeader
          name=""
          publicCategory={PUBLIC_CATEGORIES.OTHER}
          isOwner={false}
          isEditing={false}
          isLoading={isLoadingProduct}
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
            isLoading={isLoadingProduct}
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

  const {
    productId: id,
    name,
    description,
    stockQuantity,
    status,
    publicCategory,
    seller,
    categories,
    images,
    documents,
    createdAt,
    updatedAt,
  } = product;

  const isOwner = currentUser?.userId === seller.userId

  return (
    <div className="container space-y-6 py-6">
      <ProductHeader
        name={name}
        publicCategory={publicCategory}
        isOwner={isOwner}
        isEditing={isEditingInformation}
        onEnterEditMode={() => setIsEditingInformation(true)}
        onExitEditMode={() => setIsEditingInformation(false)}
      />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {isEditingImages ? (
          <ProductImageEditor
            productId={id}
            images={images}
            onExitEditMode={() => setIsEditingImages(false)}
          />
        ) : (
          <ProductImageViewer
            images={images}
            isOwner={isOwner}
            onEnterEditMode={() => setIsEditingImages(true)}
          />
        )}

        <ProductInformationCard
          name={name}
          description={description}
          stockQuantity={stockQuantity}
          status={status}
          publicCategory={publicCategory}
          sellerId={seller.userId}
          sellerName={seller.username}
          createdAt={createdAt}
          updatedAt={updatedAt}
          categories={categories}
        />
      </div>

      <ProductDocument
        productId={id}
        documents={documents}
        isOwner={isOwner}
        isEditing={isEditingDocuments}
        onEnterEditMode={() => setIsEditingDocuments(true)}
        onExitEditMode={() => setIsEditingDocuments(false)}
      />
      <ProductComment productId={id} />
    </div>
  );
}
