import { Outlet, useLocation } from 'react-router-dom';
import PublicHeader from '@/shared/components/PublicHeader';
import Footer from '@/shared/components/Footer';
import AuthBanner from '@/shared/components/AuthBanner';
import { authPaths } from '@/features/auth/constants/auth.routes';

export default function PublicLayout() {
  const location = useLocation();

  const authPages = [
    authPaths.login(),
    authPaths.register(),
    authPaths.forgotPassword(),
    authPaths.verifyEmail(),
    authPaths.verifyResetPassword(),
    authPaths.resetPassword(),
  ];

  const isAuthPage = authPages.includes(location.pathname);

  const getTitle = () => {
    switch (location.pathname) {
      case authPaths.login():
        return 'Login';
      case authPaths.register():
        return 'Register';
      case authPaths.forgotPassword():
        return 'Forgot Password';
      case authPaths.verifyEmail():
        return 'Verify Email';
      case authPaths.verifyResetPassword():
        return 'Verify Reset Password';
      case authPaths.resetPassword():
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
