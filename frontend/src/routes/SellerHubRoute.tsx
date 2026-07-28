import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';
import { SellerHubLayout } from '@/features/seller-hub/layout/SellerHubLayout';
import { SELLER_HUB_ROUTES } from '@/features/seller-hub/constants/seller-hub.routes';
import { MyProductCategoriesPage } from '@/pages/seller-hub/MyProductCategoriesPage';
import { CreateProductPage } from '@/pages/seller-hub/CreateProductPage';
import { MyProductsPage } from '@/pages/seller-hub/MyProductsPage.tsx';

export default function SellerHubRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<SellerHubLayout />}>
          <Route
            path={SELLER_HUB_ROUTES.PRODUCTS}
            element={<MyProductsPage />}
          />
          <Route
            path={SELLER_HUB_ROUTES.PRODUCT_CATEGORIES}
            element={<MyProductCategoriesPage />}
          />
          <Route
            path={`${SELLER_HUB_ROUTES.PRODUCTS}/${SELLER_HUB_ROUTES.CREATE_PRODUCT}`}
            element={<CreateProductPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
