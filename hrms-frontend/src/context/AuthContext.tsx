import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthResponse | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { usernameOrEmail: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isHr: boolean;
  isAdminOrHr: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const cached = localStorage.getItem('hrms_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hrms_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('hrms_user', JSON.stringify(profile));
        } catch {
          // Token might be invalid or expired
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (credentials: { usernameOrEmail: string; password: string }) => {
    const res = await api.login(credentials);
    setToken(res.token);
    setUser(res);
    localStorage.setItem('hrms_token', res.token);
    localStorage.setItem('hrms_user', JSON.stringify(res));
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setToken(res.token);
    setUser(res);
    localStorage.setItem('hrms_token', res.token);
    localStorage.setItem('hrms_user', JSON.stringify(res));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isHr = user?.role === 'ROLE_HR';
  const isAdminOrHr = isAdmin || isHr;
  const isManager = user?.role === 'ROLE_MANAGER';
  const isEmployee = user?.role === 'ROLE_EMPLOYEE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isHr,
        isAdminOrHr,
        isManager,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
