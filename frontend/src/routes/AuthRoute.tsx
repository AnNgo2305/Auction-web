import { Routes, Route } from 'react-router-dom';
import { AUTH_ROUTES } from '@/features/auth/constants/auth.routes.ts';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import VerifyResetPasswordPage from '@/pages/auth/VerifyResetPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import GuestRoute from '@/routes/guards/GuestRoute';

export default function AuthRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path={AUTH_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={AUTH_ROUTES.REGISTER} element={<RegisterPage />} />
        <Route
          path={AUTH_ROUTES.FORGOT_PASSWORD}
          element={<ForgotPasswordPage />}
        />
        <Route path={AUTH_ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route
          path={AUTH_ROUTES.VERIFY_RESET_PASSWORD}
          element={<VerifyResetPasswordPage />}
        />
        <Route
          path={AUTH_ROUTES.RESET_PASSWORD}
          element={<ResetPasswordPage />}
        />
      </Route>
    </Routes>
  );
}
