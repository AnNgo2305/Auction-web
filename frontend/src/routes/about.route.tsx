import { Route, Routes } from 'react-router-dom';
import PublicLayout from '@/shared/layouts/PublicLayout';
import { ABOUT_ROUTES } from '@/features/about/constants/about.routes';
import AboutPage from '@/pages/about/AboutPage';

export default function AboutRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ABOUT_ROUTES.ABOUT} element={<AboutPage />} />
      </Route>
    </Routes>
  );
}
