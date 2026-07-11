import { Outlet } from 'react-router-dom';
import AuthHeader from '@/shared/components/AuthHeader';
import Footer from '@/shared/components/Footer';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
