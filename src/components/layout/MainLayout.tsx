'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { 
  BarChart3, 
  Building2, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Users, 
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  FileText
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useData, useDataWithNotifications } from '@/contexts/DataContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationPanel from '@/components/notifications/NotificationPanel';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout, isHydrated: authHydrated } = useAuth();
  const { isHydrated: dataHydrated } = useData();
  const { connectNotifications } = useDataWithNotifications();
  const { unreadCount, addNotification } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  // Conectar notificações quando os dados estiverem prontos
  useEffect(() => {
    if (authHydrated && dataHydrated) {
      connectNotifications(addNotification);
    }
  }, [authHydrated, dataHydrated, connectNotifications, addNotification]);

  // Se ainda não hidratou, mostrar loading
  if (!authHydrated || !dataHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700">Carregando Sistema Structa...</h2>
          <p className="text-gray-500 mt-2">Aguarde enquanto preparamos tudo para você</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Building2, label: 'Obras', path: '/obras' },
    { icon: ClipboardList, label: 'Etapas', path: '/etapas' },
    { icon: Package, label: 'Materiais', path: '/materiais' },
    { icon: Package, label: 'Estoque', path: '/estoque' },
    { icon: ShoppingCart, label: 'Compras', path: '/compras' },
    { icon: FileText, label: 'Relatórios', path: '/relatorios' },
    { icon: Users, label: 'Usuários', path: '/usuarios' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Structa</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNotifications}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-1 z-50">
                  <NotificationPanel onClose={() => setIsNotificationsOpen(false)} />
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <Avatar>
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-30
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:top-0 lg:h-screen lg:z-10
      `}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={pathname === item.path ? "default" : "ghost"}
              className="w-full justify-start space-x-3"
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 