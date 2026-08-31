import { Route, Routes } from 'react-router-dom';
import { ABOUT_ROUTES } from '@/features/about/constants/about.routes';
import AboutPage from '@/pages/about/AboutPage';
import PublicRoute from '@/routes/guards/PublicRoute';
import { NotFoundPage } from '@/pages/NotFoundPage.tsx';

export default function AboutRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path={ABOUT_ROUTES.ABOUT} element={<AboutPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
