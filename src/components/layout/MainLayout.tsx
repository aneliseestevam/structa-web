'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Package2, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Bell,
  Home,
  FileText,
  Layers,
  Truck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataWithNotifications } from '@/contexts/DataContext';
import { useNotifications } from '@/contexts/NotificationsContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const { connectNotifications } = useDataWithNotifications();
  const { notifications, unreadCount, addNotification } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  // Conectar os contextos
  useEffect(() => {
    connectNotifications(addNotification);
  }, [connectNotifications, addNotification]);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Building2, label: 'Obras', path: '/obras' },
    { icon: Layers, label: 'Etapas', path: '/etapas' },
    { icon: Package2, label: 'Materiais', path: '/materiais' },
    { icon: Truck, label: 'Estoque', path: '/estoque' },
    { icon: ShoppingCart, label: 'Compras', path: '/compras' },
    { icon: FileText, label: 'Relatórios', path: '/relatorios' },
    { icon: Users, label: 'Usuários', path: '/usuarios' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const isActiveItem = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Structa</h1>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={isActiveItem(item.path) ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActiveItem(item.path) 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => router.push(item.path)}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {menuItems.find(item => item.path === pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Avatar>
                  <AvatarFallback>
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 