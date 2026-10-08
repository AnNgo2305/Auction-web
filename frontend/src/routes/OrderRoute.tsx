import { Routes, Route } from 'react-router-dom';
import { ORDER_ROUTES } from '@/features/order/constant/order.routes.ts';
import { OrderPage } from '@/pages/order/OrderPage';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';
import { NotFoundPage } from '@/pages/NotFoundPage.tsx';

export default function OrderRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path={ORDER_ROUTES.LIST} element={<OrderPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
