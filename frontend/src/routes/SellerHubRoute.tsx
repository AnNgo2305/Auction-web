import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';
import { SellerHubLayout } from '@/features/seller-hub/layout/SellerHubLayout';
import { SELLER_HUB_ROUTES } from '@/features/seller-hub/constants/seller-hub.routes';
import { MyProductCategoriesPage } from '@/pages/seller-hub/MyProductCategoriesPage';
import { CreateProductPage } from '@/pages/seller-hub/CreateProductPage';
import { MyProductsPage } from '@/pages/seller-hub/MyProductsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { MyAuctionsPage } from '@/pages/seller-hub/MyAuctionsPage';
import { CreateAuctionPage } from '@/pages/seller-hub/CreateAuctionPage';
import { ROLES } from '@/shared/types/user';

export default function SellerHubRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SELLER]} />}>
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
          <Route
            path={SELLER_HUB_ROUTES.AUCTIONS}
            element={<MyAuctionsPage />}
          />
          <Route
            path={`${SELLER_HUB_ROUTES.AUCTIONS}/${SELLER_HUB_ROUTES.CREATE_AUCTION}`}
            element={<CreateAuctionPage />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
