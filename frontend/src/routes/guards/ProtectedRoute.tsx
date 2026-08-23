import { useUser } from '@/shared/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import { authPaths } from '@/features/auth/constants/auth.routes';
import AuthLayout from '@/shared/layouts/AuthLayout';
import { useEffect } from 'react';
import {
  connectPresenceSocket,
  disconnectPresenceSocket,
} from '@/features/presence/presence-socket.service';

export default function ProtectedRoute() {
  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    connectPresenceSocket();

    return () => {
      disconnectPresenceSocket();
    };
  }, [isAuthenticated]);

  // Protected pages require authentication.
  // Redirect unauthenticated users to the login page.
  if (!isAuthenticated) {
    return <Navigate to={authPaths.login()} replace />;
  }

  return <AuthLayout />;
}
