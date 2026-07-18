import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  History,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '@/assets/images/bid-market.png';
import defaultAvatar from '@/assets/images/default-avatar.jpg';
import { aboutPaths } from '@/features/about/constants/about.routes';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useUser } from '@/shared/contexts/UserContext';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/shared/contexts/AuthContext';
import { authPaths } from '@/features/auth/constants/auth.routes';
import { Badge } from '@/shared/ui/badge'
import { settingsPaths } from '@/features/setting/constants/setting.routes.ts';

export default function AuthHeader() {
  const location = useLocation();
  const { currentUser } = useUser();
  const {logout, logoutAll, isLoading} = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate(authPaths.login());
  };

  const handleLogoutAll = async () => {
    await logoutAll();
    navigate(authPaths.login());
  };

  return (
    <header className="border-b border-white/10 bg-(--footer)/90 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="BidMarket"
              className="h-10 w-auto object-contain"
            />
            <span className="text-lg font-bold tracking-wide">BidMarket</span>
          </Link>
          <nav>
            <Link
              to={aboutPaths.about()}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === aboutPaths.about()
                  ? 'text-white'
                  : 'text-white/80 hover:text-white',
              )}
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20">
            <MessageCircle className="h-5 w-5" />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20">
            <Heart className="h-5 w-5" />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20">
            <Bell className="h-5 w-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-white/10">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={currentUser.profileImageUrl ?? defaultAvatar}
                  />
                  <AvatarFallback>
                    {currentUser.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="max-w-28 truncate text-sm font-semibold">
                      {currentUser.username}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'h-5 rounded-full border-0 px-2 text-[10px] font-semibold',
                        currentUser.role === 'SELLER'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-sky-600 text-white hover:bg-sky-700',
                      )}
                    >
                      {currentUser.role}
                    </Badge>
                  </div>
                  <span className="max-w-40 truncate text-xs text-white/70">
                    {currentUser.email}
                  </span>
                </div>
                <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link
                  to={profilePaths.overview(currentUser.userId)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/my-activity" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>My Activity</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={settingsPaths.password()} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogout}
                disabled={isLoading}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleLogoutAll}
                disabled={isLoading}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout All Devices</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
