import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('veriframe_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default demo session for immediate usage
    return {
      id: 'usr-demo-001',
      name: 'Dr. Sarah Vance',
      email: 'sarah.vance@factcheck.org',
      role: 'fact_checker'
    };
  });

  const login = (email: string, role: string = 'analyst') => {
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: role as any,
      token: 'demo_token_123'
    };
    setUser(newUser);
    localStorage.setItem('veriframe_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('veriframe_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
