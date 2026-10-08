import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthRoutes from '@/routes/AuthRoute';
import AboutRoutes from '@/routes/AboutRoute';
import ProfileRoutes from '@/routes/ProfileRoute';
import SettingRoutes from '@/routes/SettingRoute';
import SellerHubRoutes from '@/routes/SellerHubRoute';
import ProductRoutes from '@/routes/ProductRoute';
import ChatRoutes from '@/routes/ChatRoute';
import AuctionRoutes from '@/routes/AuctionRoute';
import OrderRoutes from '@/routes/OrderRoute';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auctions" replace />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/about/*" element={<AboutRoutes />} />
        <Route path="/profile/*" element={<ProfileRoutes />} />
        <Route path="/setting/*" element={<SettingRoutes />} />
        <Route path="/sellerhub/*" element={<SellerHubRoutes />} />
        <Route path="/products/*" element={<ProductRoutes />} />
        <Route path="/auctions/*" element={<AuctionRoutes />} />
        <Route path="/chat/*" element={<ChatRoutes />} />
        <Route path="/orders/*" element={<OrderRoutes />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
