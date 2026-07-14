import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthRoutes from '@/routes/AuthRoute';
import AboutRoutes from '@/routes/AboutRoute';
import ProfileRoutes from '@/routes/ProfileRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/about/*" element={<AboutRoutes />} />
        <Route path="/profile/*" element={<ProfileRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
