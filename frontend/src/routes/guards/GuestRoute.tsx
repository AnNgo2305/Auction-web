import { Navigate } from 'react-router-dom';
import PublicLayout from '@/shared/layouts/PublicLayout';
import { useUser } from '@/shared/contexts/UserContext.tsx';

export default function GuestRoute() {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <PublicLayout />;
}
