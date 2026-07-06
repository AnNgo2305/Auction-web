import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { UserContextValue } from '@/shared/types/user.context.ts';
import { type CurrentUser, UserRole } from '@/shared/types/current-user.ts';

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const clearCurrentUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const isCurrentUser = useCallback(
    (userId: string) => {
      return currentUser?.userId === userId;
    },
    [currentUser],
  );

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
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


