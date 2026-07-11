import { useUser } from '@/shared/contexts/UserContext';
import PublicLayout from '@/shared/layouts/PublicLayout';
import AuthLayout from '@/shared/layouts/AuthLayout';

export default function PublicRoute() {
  const { isAuthenticated } = useUser();

  return isAuthenticated ? <AuthLayout /> : <PublicLayout />;
}
