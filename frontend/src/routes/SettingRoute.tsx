import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';
import { SettingLayout } from '@/features/setting/layout/SettingLayout';
import { SETTING_ROUTES } from '@/features/setting/constants/setting.routes';
import { ChangePasswordPage } from '@/pages/setting/ChangePasswordPage';
import { SessionControlPage } from '@/pages/setting/SessionControlPage';
import { NotificationSettingPage } from '@/pages/setting/NotificationSettingPage';
import { PendingRequestsManagementPage } from '@/pages/setting/PendingRequestsManagementPage';
import { SentRequestsManagementPage } from '@/pages/setting/SentRequestsManagementPage';
import { BlockedUsersManagementPage } from '@/pages/setting/BlockedUsersManagementPage';

export default function SettingRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<SettingLayout />}>
          <Route
            path={SETTING_ROUTES.PASSWORD}
            element={<ChangePasswordPage />}
          />
          <Route
            path={SETTING_ROUTES.SESSIONS}
            element={<SessionControlPage />} />
          <Route
            path={SETTING_ROUTES.NOTIFICATIONS}
            element={<NotificationSettingPage />}
          />
          <Route
            path={SETTING_ROUTES.PENDING_REQUESTS}
            element={<PendingRequestsManagementPage />}
          />
          <Route
            path={SETTING_ROUTES.SENT_REQUESTS}
            element={<SentRequestsManagementPage />}
          />
          <Route
            path={SETTING_ROUTES.BLOCKED_USERS}
            element={<BlockedUsersManagementPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
