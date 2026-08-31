import { Route, Routes } from 'react-router-dom';
import { PROFILE_ROUTES } from '@/features/profile/constants/profile.routes';
import { ProfileLayout } from '@/features/profile/layout/ProfileLayout';
import { ProfileOverviewPage } from '@/pages/profile/ProfileOverviewPage';
import { ProfileFollowersPage } from '@/pages/profile/ProfileFollowersPage';
import { ProfileFollowingPage } from '@/pages/profile/ProfileFollowingPage';
import { EditProfilePage } from '@/pages/profile/EditProfilePage';
import { ProfileAddressesPage } from '@/pages/profile/ProfileAddressPage';
import PublicRoute from '@/routes/guards/PublicRoute';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROLES } from '@/shared/types/user';

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
          <Route
            path={PROFILE_ROUTES.ADDRESSES}
            element={<ProfileAddressesPage />}
          />
        </Route>
      </Route>
      <Route
        element={<ProtectedRoute allowedRoles={[ROLES.SELLER, ROLES.BIDDER]} />}
      >
        <Route element={<ProfileLayout />}>
          <Route path={PROFILE_ROUTES.EDIT} element={<EditProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
