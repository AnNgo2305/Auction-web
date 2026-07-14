import { useUser } from '@/shared/contexts/UserContext';
import PublicLayout from '@/shared/layouts/PublicLayout';
import AuthLayout from '@/shared/layouts/AuthLayout';
import { Navigate, useLocation } from 'react-router-dom';

export default function PublicRoute() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useUser();

  // Auth pages (e.g. /auth/login, /auth/register) should only be accessible
  // to unauthenticated users. Redirect authenticated users to the home page.
  const isAuthRoute = pathname.startsWith('/auth');
  if (isAuthenticated && isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  // Public pages are accessible to everyone. Render a different layout
  // depending on the user's authentication state.
  return isAuthenticated ? <AuthLayout /> : <PublicLayout />;
}
