import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  type ProductStatus,
  type PublicCategory,
  type ProductSortBy,
  type SortOrder,
  PRODUCT_STATUS_ACTIONS,
} from '@/shared/types/product';
import { MyProductsFilterForm } from '@/features/seller-hub/components/my-products/MyProductsFilterForm';
import { MyProductsAppliedFilterTags } from '@/features/seller-hub/components/my-products/MyProductsAppliedFilterTags';
import { MyProductsBulkActions } from '@/features/seller-hub/components/my-products/MyProductsBulkActions';
import { MyProductsDataTable } from '@/features/seller-hub/components/my-products/MyProductsDataTable';
import { MyProductsPagination } from '@/features/seller-hub/components/my-products/MyProductsPagination';
import { useGetMyProducts } from '@/features/seller-hub/hooks/product/useGetMyProducts';
import { useGetMyProductCategories } from '@/features/seller-hub/hooks/product-category/useGetMyproductCategory';
import { useUpdateProductsStatus } from '@/features/seller-hub/hooks/product/useUpdateProductsStatus.ts';
import { useDeleteProducts } from '@/features/seller-hub/hooks/product/useDeleteProducts';
import { useDeleteProduct } from '@/features/seller-hub/hooks/product/useDeleteProduct';
import { useUpdateProductStatus } from '@/features/seller-hub/hooks/product/useUpdateProductStatus';
import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
import { sellerHubPaths } from '@/features/seller-hub/constants/seller-hub.routes.ts';
import { Plus } from 'lucide-react';

type ProductFilters = {
  keyword: string;
  status?: ProductStatus;
  publicCategory?: PublicCategory;
  dateRange?: DateRange;
  selectedCategoryIds: string[];
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
};

const DEFAULT_FILTERS: ProductFilters = {
  keyword: '',
  status: undefined,
  publicCategory: undefined,
  dateRange: undefined,
  selectedCategoryIds: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function MyProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ProductFilters>(DEFAULT_FILTERS);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const { data: categories = [] } = useGetMyProductCategories();

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading: isGetsMyProductsLoading,
  } = useGetMyProducts({
    limit,
    keyword: appliedFilters.keyword,
    status: appliedFilters.status,
    publicCategory: appliedFilters.publicCategory,
    createdAtFrom: appliedFilters.dateRange?.from,
    createdAtTo: appliedFilters.dateRange?.to,
    categoryIds: appliedFilters.selectedCategoryIds,
    sortBy: appliedFilters.sortBy,
    sortOrder: appliedFilters.sortOrder,
  });

  const products = data?.pages.flatMap((page) => page.data.data) ?? [];
  const visibleProducts = data?.pages[page - 1]?.data.data ?? [];

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
    setIsSelectAll(false);
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedProductIds(ids);
  };

  const { mutate: updateProductsStatus, isPending: isUpdatingProductsStatus } =
    useUpdateProductsStatus(handleClearSelection);
  const { mutate: deleteProducts, isPending: isDeletingProducts } =
    useDeleteProducts();
  const { mutate: deleteProduct, isPending: isDeletingProduct } =
    useDeleteProduct();
  const { mutate: updateProductStatus, isPending: isUpdatingProductStatus } =
    useUpdateProductStatus();

  const selectedProducts = products?.filter((product) =>
    selectedProductIds.includes(product.productId),
  );

  const handlePublishProducts = (productIds: string[]) => {
    updateProductsStatus({
      body: { productIds },
      action: PRODUCT_STATUS_ACTIONS.PUBLISH,
    });
  };

  const handleRestoreProducts = (productIds: string[]) => {
    updateProductsStatus({
      body: { productIds },
      action: PRODUCT_STATUS_ACTIONS.RESTORE,
    });
  };

  const handleArchiveProducts = (productIds: string[]) => {
    updateProductsStatus({
      body: { productIds },
      action: PRODUCT_STATUS_ACTIONS.REMOVE,
    });
  };

  const handleDeleteProducts = (productIds: string[]) => {
    deleteProducts(productIds, {
      onSuccess: () => {
        handleClearSelection();
      },
    });
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
  };

  const handlePublishProduct = (productId: string) => {
    updateProductStatus({
      productId,
      action: PRODUCT_STATUS_ACTIONS.PUBLISH,
    });
  };

  const handleArchiveProduct = (productId: string) => {
    updateProductStatus({
      productId,
      action: PRODUCT_STATUS_ACTIONS.REMOVE,
    });
  };

  const handleRestoreProduct = (productId: string) => {
    updateProductStatus({
      productId,
      action: PRODUCT_STATUS_ACTIONS.RESTORE,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">Manage your products.</p>
        </div>
        <Button asChild>
          <Link to={sellerHubPaths.createProduct()}>
            <Plus className="mr-2 size-4" />
            Create Product
          </Link>
        </Button>
      </div>
      <MyProductsFilterForm
        filters={filters}
        onFilterChange={(key, value) => {
          setFilters((prev) => ({
            ...prev,
            [key]: value,
          }));
        }}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
      <MyProductsAppliedFilterTags
        keyword={filters.keyword}
        status={filters.status}
        publicCategory={filters.publicCategory}
        dateRange={filters.dateRange}
        selectedCategoryIds={filters.selectedCategoryIds}
        categories={categories}
        onClearFilters={handleClearFilters}
      />
      {selectedProductIds.length > 0 && (
        <MyProductsBulkActions
          selectedProducts={selectedProducts}
          isActionLoading={isDeletingProducts || isUpdatingProductsStatus}
          onClearSelection={handleClearSelection}
          onDelete={handleDeleteProducts}
          onPublish={handlePublishProducts}
          onArchive={handleArchiveProducts}
          onRestore={handleRestoreProducts}
        />
      )}
      <MyProductsDataTable
        products={products}
        visibleProducts={visibleProducts}
        isActionLoading={isDeletingProduct || isUpdatingProductStatus}
        isLoading={isGetsMyProductsLoading}
        selectedProductIds={selectedProductIds}
        isSelectAll={isSelectAll}
        onSelectAllChange={setIsSelectAll}
        onSelectionProductChange={handleSelectionChange}
        onDelete={handleDeleteProduct}
        onPublish={handlePublishProduct}
        onArchive={handleArchiveProduct}
        onRestore={handleRestoreProduct}
      />
      {products.length > 0 && (
        <MyProductsPagination
          page={page}
          limit={limit}
          loadedPageCount={data?.pages.length ?? 1}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onPreviousPage={() => {
            setPage((prev) => Math.max(prev - 1, 1));
          }}
          onNextPage={async (): Promise<void> => {
            await fetchNextPage();
            setPage((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
