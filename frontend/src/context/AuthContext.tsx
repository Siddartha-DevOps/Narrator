import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import * as authApi from '../api/auth';

interface AuthContextValue {
  user: authApi.CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'narrator_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<authApi.CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await authApi.fetchCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const { accessToken } = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, accessToken);
    await loadUser();
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const { accessToken } = await authApi.register(email, password, fullName);
    localStorage.setItem(TOKEN_KEY, accessToken);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
