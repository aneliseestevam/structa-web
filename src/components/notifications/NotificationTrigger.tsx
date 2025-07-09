'use client';

import React from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

export default function NotificationTrigger() {
  const { addNotification } = useNotifications();

  const showSuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message, autoClose: true });
  };

  const showError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message });
  };

  const showWarning = (title: string, message: string) => {
    addNotification({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message: string) => {
    addNotification({ type: 'info', title, message, autoClose: true });
  };

  const handleTestSuccess = () => {
    showSuccess('Operação Realizada', 'Obra criada com sucesso!');
  };

  const handleTestError = () => {
    showError('Erro no Sistema', 'Falha ao conectar com o servidor. Tente novamente.');
  };

  const handleTestWarning = () => {
    showWarning('Estoque Baixo', 'Cimento CP-II está com apenas 5 unidades restantes.');
  };

  const handleTestInfo = () => {
    showInfo('Informação', 'Nova atualização disponível para o sistema.');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Testar Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleTestSuccess} 
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <CheckCircle className="h-4 w-4 text-green-500" />
          Sucesso
        </Button>
        
        <Button 
          onClick={handleTestError} 
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <AlertCircle className="h-4 w-4 text-red-500" />
          Erro
        </Button>
        
        <Button 
          onClick={handleTestWarning} 
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Aviso
        </Button>
        
        <Button 
          onClick={handleTestInfo} 
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <Info className="h-4 w-4 text-blue-500" />
          Informação
        </Button>
      </CardContent>
    </Card>
  );
} 