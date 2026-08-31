import { Route, Routes } from 'react-router-dom';
import PublicRoute from '@/routes/guards/PublicRoute';
import { PRODUCT_ROUTES } from '@/features/product/constants/product.routes';
import { ProductsPage } from '@/pages/product/ProductsPage';
import { ProductDetailPage } from '@/pages/product/ProductDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage.tsx';

export default function ProductRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route index element={<ProductsPage />} />
        <Route path={PRODUCT_ROUTES.DETAIL} element={<ProductDetailPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
