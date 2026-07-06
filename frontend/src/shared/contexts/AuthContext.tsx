import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useUser } from '@/shared/contexts/UserContext';
import type { AuthContextValue } from '@/shared/types/auth.context.ts';
import * as authApi from '@/shared/api/auth';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { clearCurrentUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const executeLogout = useCallback(
    async (action: () => Promise<unknown>, successMessage: string) => {
      try {
        setIsLoading(true);

        await action();

        clearCurrentUser();

        toast.success(successMessage);
      } catch (error) {
        toast.error('Logout failed');

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearCurrentUser],
  );

  const logout = useCallback(async () => {
    await executeLogout(authApi.logout, 'Logout successfully');
  }, [executeLogout]);

  const logoutAll = useCallback(async () => {
    await executeLogout(
      authApi.logoutAll,
      'Logged out from all devices successfully',
    );
  }, [executeLogout]);


  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      logout,
      logoutAll,
    }),
    [
      isLoading,
      logout,
      logoutAll],
  );

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
