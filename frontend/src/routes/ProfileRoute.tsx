import { Route, Routes } from 'react-router-dom';
import { PROFILE_ROUTES } from '@/features/profile/constants/profile.routes';
import { ProfileLayout } from '@/features/profile/layout/ProfileLayout';
import { ProfileOverviewPage } from '@/pages/profile/ProfileOverviewPage';
import { ProfileFollowersPage } from '@/pages/profile/ProfileFollowersPage';
import { ProfileFollowingPage } from '@/pages/profile/ProfileFollowingPage';
import { EditProfilePage } from '@/pages/profile/EditProfilePage';

import PublicRoute from '@/routes/guards/PublicRoute';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';

export default function ProfileRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<ProfileLayout />}>
          <Route
            path={PROFILE_ROUTES.OVERVIEW}
            element={<ProfileOverviewPage />}
          />
          <Route
            path={PROFILE_ROUTES.FOLLOWERS}
            element={<ProfileFollowersPage />}
          />
          <Route
            path={PROFILE_ROUTES.FOLLOWING}
            element={<ProfileFollowingPage />}
          />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<ProfileLayout />}>
          <Route
            path={PROFILE_ROUTES.EDIT}
            element={<EditProfilePage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
