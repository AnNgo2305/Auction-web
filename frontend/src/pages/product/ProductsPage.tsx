import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '@/features/product/components/product-gallery/ProductCard';
import { ProductsFilterForm } from '@/features/product/components/product-gallery/ProductsFilterForm';
import { ProductsAppliedFilterTags } from '@/features/product/components/product-gallery/ProductsAppliedFilterTags';
import { ProductsPagination } from '@/features/product/components/product-gallery/ProductsPagination';
import {
  type PublicCategory,
  type PublicProductSortBy,
  type PublicProductStatus,
  type SortOrder,
} from '@/shared/types/product';

import { useGetProducts } from '@/features/product/hooks/product/useGetProducts';
import { profilePaths } from '@/features/profile/constants/profile.routes.ts';
import { productPaths } from '@/features/product/constants/product.routes.ts';

export function ProductsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    keyword: '',
    status: undefined as PublicProductStatus | undefined,
    publicCategory: undefined as PublicCategory | undefined,
    sortBy: 'createdAt' as PublicProductSortBy,
    sortOrder: 'desc' as SortOrder,
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetProducts({
      ...appliedFilters,
      limit,
    });

  const pages = data?.pages ?? [];
  const products = pages[page - 1]?.data.data ?? [];

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      keyword: '',
      status: undefined,
      publicCategory: undefined,
      sortBy: 'createdAt' as PublicProductSortBy,
      sortOrder: 'desc' as SortOrder,
    };

    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  return (
    <div className="container space-y-6 py-6">
      <ProductsFilterForm
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <ProductsAppliedFilterTags
        {...appliedFilters}
        onClearFilters={handleClearFilters}
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            productId={product.productId}
            sellerId={product.sellerId}
            sellerName={product.sellerName}
            name={product.name}
            publicCategory={product.publicCategory}
            thumbnail={product.thumbnail}
            categories={product.categories}
            createdAt={product.createdAt}
            onViewDetails={(id) => navigate(productPaths.detail(id))}
            onViewSeller={(id) => navigate(profilePaths.overview(id))}
          />
        ))}
      </div>

      <ProductsPagination
        page={page}
        loadedPageCount={pages.length}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        limit={limit}
        onPageChange={setPage}
        onPreviousPage={() => setPage((prev) => prev - 1)}
        onNextPage={async () => {
          if (page < pages.length) {
            setPage((prev) => prev + 1);
            return;
          }

          if (hasNextPage) {
            await fetchNextPage();
            setPage((prev) => prev + 1);
          }
        }}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />
    </div>
  );
}
