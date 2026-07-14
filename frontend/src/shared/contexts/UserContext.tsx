import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext, useEffect,
  useMemo,
  useState,
} from 'react';
import type { UserContextValue } from '@/shared/types/user.context';
import type { CurrentUser } from '@/shared/types/current-user';
import { getMe } from '@/shared/api/me';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/shared/types/user.ts';

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const clearCurrentUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await getMe();
        if (response.data) {
          setCurrentUser(response.data);
        } else {
          clearCurrentUser();
        }
      } catch {
        clearCurrentUser();
      } finally {
        setIsInitializing(false);
      }
    };

    void loadCurrentUser();
  }, [setCurrentUser, clearCurrentUser, setIsInitializing]);

  const isCurrentUser = useCallback(
    (userId: string) => {
      return currentUser?.userId === userId;
    },
    [currentUser],
  );

  const hasRole = useCallback(
    (...roles: Role[]) => {
      return currentUser ? roles.includes(currentUser.role) : false;
    },
    [currentUser],
  );

  const updateProfileImageUrl = useCallback((profileImageUrl: string | null) => {
    setCurrentUser((prev) => {
      if (!prev) {
        return null;
      }
      return {
        ...prev,
        profileImageUrl,
      };
    });
  }, []);

  const updateCoverImageUrl = useCallback((coverImageUrl: string | null) => {
    setCurrentUser((prev) => {
      if (!prev) {
        return null;
      }

      return {
        ...prev,
        coverImageUrl,
      };
    });
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      setCurrentUser,
      clearCurrentUser,
      isCurrentUser,
      updateProfileImageUrl,
      updateCoverImageUrl,
      hasRole,
    }),
    [
      currentUser,
      setCurrentUser,
      clearCurrentUser,
      isCurrentUser,
      updateProfileImageUrl,
      updateCoverImageUrl,
      hasRole,
    ],
  );

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }

  return context;
}


