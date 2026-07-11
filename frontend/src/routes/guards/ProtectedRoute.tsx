import { useUser } from '@/shared/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import { AUTH_ROUTES } from '@/features/auth/constants/auth.routes';
import AuthLayout from '@/shared/layouts/AuthLayout';

export default function ProtectedRoute() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  }

  return <AuthLayout />;
}
