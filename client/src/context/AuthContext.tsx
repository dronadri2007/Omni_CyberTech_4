import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { apiService, tokenStore } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// One-click demo sign-in so judges never hit a login wall. Matches server/src/services/authService.ts.
const DEMO_EMAIL = 'sarah.vance@factcheck.org';
const DEMO_PASSWORD = 'veriframe-demo';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (tokenStore.get()) {
          const { user: me } = await apiService.me();
          setUser(me);
        } else {
          // Auto-provision the demo session.
          const { user: me } = await apiService.login(DEMO_EMAIL, DEMO_PASSWORD);
          setUser(me);
        }
      } catch {
        tokenStore.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const { user: me } = await apiService.login(email, password);
      setUser(me);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const { user: me } = await apiService.register(name, email, password);
      setUser(me);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
