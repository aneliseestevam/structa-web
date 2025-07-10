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
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Páginas que não precisam de autenticação
  const publicPages = ['/login', '/'];

  // Verificar hidratação e carregar dados do localStorage apenas no cliente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Marcar como hidratado
        setIsHydrated(true);

        // Verificar se há token no localStorage (apenas no cliente)
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
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Verificar autenticação e redirecionar apenas após a hidratação
  useEffect(() => {
    if (!isHydrated || isLoading) return;

    const isPublicPage = publicPages.includes(pathname);
    
    if (!isAuthenticated && !isPublicPage) {
      router.push('/login');
    }
  }, [isHydrated, isLoading, isAuthenticated, pathname, router, publicPages]);

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

      // Salvar no localStorage (apenas no cliente e se estiver hidratado)
      if (isHydrated) {
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
    // Limpar localStorage apenas se estiver hidratado
    if (isHydrated) {
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
        isHydrated,
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