import { Outlet, useLocation } from 'react-router-dom';
import PublicHeader from '@/shared/components/PublicHeader';
import Footer from '@/shared/components/Footer';
import AuthBanner from '@/shared/components/AuthBanner';
import { AUTH_ROUTES, type AuthRoute } from '@/features/auth/constants/auth.routes.ts';

export default function PublicLayout() {
  const location = useLocation();

  const authPages = Object.values(AUTH_ROUTES);

  const isAuthPage = authPages.includes(location.pathname as AuthRoute);

  const getTitle = () => {
    switch (location.pathname) {
      case AUTH_ROUTES.LOGIN:
        return 'Login';
      case AUTH_ROUTES.REGISTER:
        return 'Register';
      case AUTH_ROUTES.FORGOT_PASSWORD:
        return 'Forgot Password';
      case AUTH_ROUTES.VERIFY_EMAIL:
        return 'Verify Email';
      case AUTH_ROUTES.VERIFY_RESET_PASSWORD:
        return 'Verify Reset Password';
      case AUTH_ROUTES.RESET_PASSWORD:
        return 'Reset Password';
      default:
        return '';
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      {isAuthPage && <AuthBanner title={getTitle()} />}

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
