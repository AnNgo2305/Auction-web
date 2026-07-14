import { useUser } from '@/shared/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import { authPaths } from '@/features/auth/constants/auth.routes';
import AuthLayout from '@/shared/layouts/AuthLayout';

export default function ProtectedRoute() {
  const { isAuthenticated } = useUser();

  // Protected pages require authentication.
  // Redirect unauthenticated users to the login page.
  if (!isAuthenticated) {
    return <Navigate to={authPaths.login()} replace />;
  }

  return <AuthLayout />;
}
