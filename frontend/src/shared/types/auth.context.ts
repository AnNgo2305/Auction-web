export interface AuthContextValue {
  isLoading: boolean;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}
