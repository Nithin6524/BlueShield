'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, UserResponse } from '@/services/authService';

interface AuthContextType {
  isAuthModalOpen: boolean;
  openAuthModal: (redirectUrl?: string) => void;
  closeAuthModal: () => void;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  redirectUrl: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const router = useRouter();

  const openAuthModal = (redirectUrl?: string) => {
    setIsAuthModalOpen(true);
    setRedirectUrl(redirectUrl || null);
  };
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setRedirectUrl(null);
    router.push('/');
  };

  const isAuthenticated = !!user;

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getStoredToken();
        if (token && !authService.isTokenExpired()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      authService.setTokens(response);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      closeAuthModal();
      
      // Redirect to the intended URL if available
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      await authService.register({ email, username, password });
      // After successful registration, switch to login
      closeAuthModal();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      authService.clearTokens();
      router.push('/');
    }
  };

  const value = {
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    redirectUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
