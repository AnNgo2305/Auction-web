import { Route, Routes } from 'react-router-dom';
import { paymentPaths } from '@/features/payment/constants/payment.routes';
import { PaymentPage } from '@/pages/payment/PaymentPage';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function PaymentRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path={paymentPaths.list()} element={<PaymentPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
