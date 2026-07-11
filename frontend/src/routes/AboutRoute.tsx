import { Route, Routes } from 'react-router-dom';
import { ABOUT_ROUTES } from '@/features/about/constants/about.routes';
import AboutPage from '@/pages/about/AboutPage';
import PublicRoute from '@/routes/guards/PublicRoute';

export default function AboutRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path={ABOUT_ROUTES.ABOUT} element={<AboutPage />} />
      </Route>
    </Routes>
  );
}
