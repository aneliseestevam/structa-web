'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthUser, LoginCredentials } from '@/types';

interface AuthContextData {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Páginas que não precisam de autenticação
  const publicPages = ['/login', '/'];

  useEffect(() => {
    // Verificar se há token no localStorage ao inicializar (apenas no cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@structa:token');
      const userData = localStorage.getItem('@structa:user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser({ ...parsedUser, token });
        } catch (error) {
          // Se houver erro ao parsear, limpar dados inválidos
          console.error('Erro ao parsear dados do usuário:', error);
          localStorage.removeItem('@structa:token');
          localStorage.removeItem('@structa:user');
        }
      }
    }

    setIsLoading(false);
  }, []);

  // Verificar autenticação e redirecionar se necessário
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicPages.includes(pathname)) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Simular chamada à API - em produção, fazer a chamada real
      // const response = await authService.login(credentials);
      
      // Mock de resposta da API para desenvolvimento
      const mockUser: AuthUser = {
        id: '1',
        name: 'Admin Usuario',
        email: credentials.email,
        role: 'admin',
        token: 'mock-jwt-token-123456789'
      };

      // Salvar no localStorage (apenas no cliente)
      if (typeof window !== 'undefined') {
        localStorage.setItem('@structa:token', mockUser.token);
        localStorage.setItem('@structa:user', JSON.stringify({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }));
      }

      setUser(mockUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@structa:token');
      localStorage.removeItem('@structa:user');
    }
    setUser(null);
    // Redirecionar para login após logout
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 