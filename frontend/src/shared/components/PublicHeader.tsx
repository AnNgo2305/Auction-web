import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import logo from '@/assets/images/bid-market.png';
import { authPaths } from '@/features/auth/constants/auth.routes';
import { aboutPaths } from '@/features/about/constants/about.routes';

export default function PublicHeader() {
  const location = useLocation();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-(--footer)/90 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Bid Market"
              className="h-10 w-auto object-contain"
            />
            <span className="text-lg font-bold tracking-wide">BidMarket</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to={aboutPaths.about()}
              className={cn(
                'relative rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
                location.pathname === '/about'
                  ? 'text-white'
                  : 'text-white/80 hover:text-white',
              )}
            >
              About
              <span
                className={cn(
                  'absolute -bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-white transition-all duration-300',
                  location.pathname === '/about'
                    ? 'w-full'
                    : 'group-hover:w-full',
                )}
              />
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={authPaths.login()}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
              location.pathname === authPaths.login()
                ? 'bg-white text-black shadow-sm'
                : 'text-white/80 hover:bg-white/15 hover:text-white',
            )}
          >
            Login
          </Link>
          <Link
            to={authPaths.register()}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
              location.pathname === authPaths.register()
                ? 'bg-white text-black shadow-sm'
                : 'text-white/80 hover:bg-white/15 hover:text-white',
            )}
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
