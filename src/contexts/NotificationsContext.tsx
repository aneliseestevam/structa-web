'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Tipos de notificação
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  autoClose?: boolean;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  requestPermission: () => Promise<boolean>;
  sendBrowserNotification: (title: string, message: string, icon?: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setBrowserPermission] = useState<NotificationPermission>('default');
  const [, setIsInitialized] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setHasShownWelcome] = useState(false);

  // Verificar permissão para notificações do navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
    setIsInitialized(true);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    setBrowserPermission(permission);
    return permission === 'granted';
  }, []);

  const sendBrowserNotification = useCallback((title: string, message: string, icon?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body: message,
      icon: icon || '/favicon.ico',
      tag: 'structa-notification',
      requireInteraction: false,
    });

    // Auto-close após 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Verificação de segurança para evitar null/undefined
    if (!notification || typeof notification !== 'object') {
      console.error('Invalid notification object:', notification);
      return;
    }

    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-close se especificado (verificação segura)
    if (notification.autoClose === true) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration || 5000);
    }

    // Enviar notificação do navegador para casos importantes
    if (notification.type === 'error' || notification.type === 'warning') {
      sendBrowserNotification(notification.title || 'Notificação', notification.message || '');
    }
  }, [sendBrowserNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Contagem de não lidas
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Notificações automáticas desabilitadas temporariamente para evitar loops
  // useEffect(() => {
  //   if (!isInitialized) return;

  //   const checkAndNotify = () => {
  //     // Verificar com o estado atual das notificações ao invés de dependência
  //     setNotifications(currentNotifications => {
  //       // Simular verificação de estoque baixo
  //       const hasLowStockItems = Math.random() < 0.1; // 10% chance para demonstração
        
  //       if (hasLowStockItems) {
  //         const existingLowStock = currentNotifications.find(n => 
  //           n.title.includes('Estoque Baixo') && !n.read
  //         );

  //         if (!existingLowStock) {
  //           const newNotification: Notification = {
  //             id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
  //             timestamp: new Date(),
  //             read: false,
  //             type: 'warning',
  //             title: 'Estoque Baixo',
  //             message: 'Alguns materiais estão com estoque abaixo do mínimo',
  //             actions: [
  //               {
  //                 label: 'Ver Estoque',
  //                 action: () => window.location.href = '/estoque'
  //               }
  //             ]
  //           };
  //           return [newNotification, ...currentNotifications];
  //         }
  //       }

  //       // Simular verificação de prazos próximos
  //       const hasUpcomingDeadlines = Math.random() < 0.05; // 5% chance para demonstração
        
  //       if (hasUpcomingDeadlines) {
  //         const existingDeadline = currentNotifications.find(n => 
  //           n.title.includes('Prazo Próximo') && !n.read
  //         );

  //         if (!existingDeadline) {
  //           const newNotification: Notification = {
  //             id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
  //             timestamp: new Date(),
  //             read: false,
  //             type: 'warning',
  //             title: 'Prazo Próximo',
  //             message: 'Algumas obras têm prazos próximos ao vencimento',
  //             actions: [
  //               {
  //                 label: 'Ver Obras',
  //                 action: () => window.location.href = '/obras'
  //               }
  //             ]
  //           };
  //           return [newNotification, ...currentNotifications];
  //         }
  //       }

  //       return currentNotifications; // Retorna o mesmo estado se não houver mudanças
  //     });
  //   };

  //   // Executar verificação inicial após 5 segundos para evitar conflicts
  //   const initialTimer = setTimeout(checkAndNotify, 5000);

  //   // Executar verificação a cada 60 segundos (reduzindo a frequência)
  //   const interval = setInterval(checkAndNotify, 60000);

  //   return () => {
  //     clearTimeout(initialTimer);
  //     clearInterval(interval);
  //   };
  // }, [isInitialized]); // Removido 'addNotification' e 'notifications' das dependências

  // Notificação de boas-vindas (agora disparada pela página de login)
  // useEffect(() => {
  //   if (!isInitialized || !isAuthenticated || hasShownWelcome) return;

  //   // Verificar se a autenticação é recente (última sessão)
  //   const isRecentLogin = !sessionStorage.getItem('structa_previous_session');

  //   if (isRecentLogin && user) {
  //     const timer = setTimeout(() => {
  //       addNotification({
  //         type: 'success',
  //         title: 'Bem-vindo!',
  //         message: `Olá, ${user.name}! Sistema Structa carregado com sucesso`,
  //         autoClose: true,
  //         duration: 5000
  //       });
        
  //       setHasShownWelcome(true);
  //       sessionStorage.setItem('structa_previous_session', 'true');
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [isInitialized, isAuthenticated, addNotification, user, hasShownWelcome]);

  // Resetar estado da sessão quando o usuário faz logout
  useEffect(() => {
    if (!isAuthenticated) {
      setHasShownWelcome(false);
      sessionStorage.removeItem('structa_previous_session');
    }
  }, [isAuthenticated]);

  const value = useMemo<NotificationsContextType>(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    requestPermission,
    sendBrowserNotification,
  }), [
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    requestPermission,
    sendBrowserNotification,
  ]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
} 