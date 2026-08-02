import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthRoutes from '@/routes/AuthRoute';
import AboutRoutes from '@/routes/AboutRoute';
import ProfileRoutes from '@/routes/ProfileRoute';
import SettingRoutes from '@/routes/SettingRoute';
import SellerHubRoutes from '@/routes/SellerHubRoute';
import ProductRoutes from '@/routes/ProductRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/about/*" element={<AboutRoutes />} />
        <Route path="/profile/*" element={<ProfileRoutes />} />
        <Route path="/setting/*" element={<SettingRoutes />} />
        <Route path="/sellerhub/*" element={<SellerHubRoutes />} />
        <Route path="products/*" element={<ProductRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
