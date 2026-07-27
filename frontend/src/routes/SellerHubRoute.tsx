import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';
import { SellerHubLayout } from '@/features/seller-hub/layout/SellerHubLayout';
import { SELLER_HUB_ROUTES } from '@/features/seller-hub/constants/seller-hub.routes';
import { MyProductCategoriesPage } from '@/pages/seller-hub/MyProductCategoriesPage';

export default function SellerHubRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<SellerHubLayout />}>
          <Route
            path={SELLER_HUB_ROUTES.PRODUCT_CATEGORIES}
            element={<MyProductCategoriesPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
