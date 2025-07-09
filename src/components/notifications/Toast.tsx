'use client';

import React, { useCallback } from 'react';
import { useNotifications, NotificationType } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Toast() {
  const { notifications, removeNotification } = useNotifications();

  // Mostrar apenas notificações com autoClose (máximo 3)
  const toastNotifications = notifications.filter(n => n.autoClose).slice(0, 3);

  const getToastIcon = (type: NotificationType) => {
    const iconProps = { className: 'h-5 w-5' };
    
    switch (type) {
      case 'error':
        return <AlertCircle {...iconProps} className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle {...iconProps} className="h-5 w-5 text-green-500" />;
      case 'info':
      default:
        return <Info {...iconProps} className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastStyles = (type: NotificationType) => {
    const baseStyles = "relative flex items-start p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const handleClose = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  if (toastNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toastNotifications.map((notification) => (
        <div
          key={notification.id}
          className={getToastStyles(notification.type)}
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0">
              {getToastIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">
                {notification.title}
              </p>
              <p className="text-sm mt-1 opacity-90">
                {notification.message}
              </p>
              {notification.actions && (
                <div className="flex space-x-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        action.action();
                        handleClose(notification.id);
                      }}
                      className="text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleClose(notification.id)}
            className="absolute top-2 right-2 p-1 h-6 w-6 hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 