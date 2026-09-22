import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_DEMO_USER: User = {
  id: 'demo-student-1',
  email: 'student@skillforge.ai',
  fullName: 'Ruthra Kumar',
  role: 'STUDENT',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('skillforge_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {}
    }
    const token = localStorage.getItem('skillforge_access_token');
    return token ? DEFAULT_DEMO_USER : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('skillforge_access_token') || 'demo-token';
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('skillforge_access_token');
      const storedUserStr = localStorage.getItem('skillforge_user');

      if (storedToken) {
        try {
          const res: any = await apiClient.get('/auth/me');
          if (res && res.data) {
            setUser(res.data);
            setToken(storedToken);
            localStorage.setItem('skillforge_user', JSON.stringify(res.data));
          }
        } catch (err) {
          if (storedUserStr) {
            try {
              setUser(JSON.parse(storedUserStr));
            } catch (e) {
              setUser(DEFAULT_DEMO_USER);
            }
          } else {
            setUser(DEFAULT_DEMO_USER);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    const validToken = accessToken || 'demo-access-token';
    const validRefreshToken = refreshToken || 'demo-refresh-token';
    localStorage.setItem('skillforge_access_token', validToken);
    localStorage.setItem('skillforge_refresh_token', validRefreshToken);
    localStorage.setItem('skillforge_user', JSON.stringify(userData));
    setToken(validToken);
    setUser(userData);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('skillforge_refresh_token');
    if (refreshToken && !refreshToken.startsWith('demo-')) {
      apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('skillforge_access_token');
    localStorage.removeItem('skillforge_refresh_token');
    localStorage.removeItem('skillforge_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('skillforge_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        updateUser,
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
