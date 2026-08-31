import { useUser } from '@/shared/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import { authPaths } from '@/features/auth/constants/auth.routes';
import AuthLayout from '@/shared/layouts/AuthLayout';
import type { Role } from '@/shared/types/user';

type ProtectedRouteProps = {
  allowedRoles?: readonly Role[];
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useUser();

  // Protected pages require authentication.
  // Redirect unauthenticated users to the login page.
  if (!isAuthenticated) {
    return <Navigate to={authPaths.login()} replace />;
  }

  // If roles are specified, the user must have one of them.
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/403" replace />;
  }

  return <AuthLayout />;
}
