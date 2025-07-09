'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

// Definição dos tipos de permissões
export type Permission = 
  | 'view_dashboard'
  | 'manage_obras'
  | 'view_obras'
  | 'manage_etapas'
  | 'view_etapas'
  | 'manage_materiais'
  | 'view_materiais'
  | 'manage_estoque'
  | 'view_estoque'
  | 'manage_compras'
  | 'view_compras'
  | 'manage_users'
  | 'view_users'
  | 'manage_settings'
  | 'view_settings'
  | 'export_data'
  | 'import_data'
  | 'view_reports'
  | 'manage_reports';

export type Role = 'admin' | 'manager' | 'engineer' | 'supervisor' | 'worker';

// Mapeamento de permissões por role
const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_obras',
    'view_obras',
    'manage_etapas',
    'view_etapas',
    'manage_materiais',
    'view_materiais',
    'manage_estoque',
    'view_estoque',
    'manage_compras',
    'view_compras',
    'manage_users',
    'view_users',
    'manage_settings',
    'view_settings',
    'export_data',
    'import_data',
    'view_reports',
    'manage_reports',
  ],
  manager: [
    'view_dashboard',
    'manage_obras',
    'view_obras',
    'manage_etapas',
    'view_etapas',
    'manage_materiais',
    'view_materiais',
    'manage_estoque',
    'view_estoque',
    'manage_compras',
    'view_compras',
    'view_users',
    'view_settings',
    'export_data',
    'view_reports',
    'manage_reports',
  ],
  engineer: [
    'view_dashboard',
    'manage_obras',
    'view_obras',
    'manage_etapas',
    'view_etapas',
    'view_materiais',
    'view_estoque',
    'view_compras',
    'view_settings',
    'view_reports',
  ],
  supervisor: [
    'view_dashboard',
    'view_obras',
    'manage_etapas',
    'view_etapas',
    'view_materiais',
    'view_estoque',
    'manage_compras',
    'view_compras',
    'view_settings',
    'view_reports',
  ],
  worker: [
    'view_dashboard',
    'view_obras',
    'view_etapas',
    'view_materiais',
    'view_estoque',
    'view_compras',
    'view_settings',
  ],
};

// Descrições dos roles
export const roleDescriptions: Record<Role, string> = {
  admin: 'Administrador - Acesso total ao sistema',
  manager: 'Gerente - Pode gerenciar obras e equipes',
  engineer: 'Engenheiro - Pode criar e gerenciar obras',
  supervisor: 'Supervisor - Pode gerenciar etapas e compras',
  worker: 'Funcionário - Apenas visualização',
};

// Cores dos roles para badges
export const roleColors: Record<Role, string> = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-purple-100 text-purple-800',
  engineer: 'bg-blue-100 text-blue-800',
  supervisor: 'bg-green-100 text-green-800',
  worker: 'bg-gray-100 text-gray-800',
};

interface PermissionsContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getUserRole: () => Role | null;
  getUserPermissions: () => Permission[];
  canAccess: (path: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const getUserRole = (): Role | null => {
    if (!user?.role) return null;
    return user.role as Role;
  };

  const getUserPermissions = (): Permission[] => {
    const role = getUserRole();
    if (!role) return [];
    return rolePermissions[role] || [];
  };

  const hasPermission = (permission: Permission): boolean => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  };

  const canAccess = (path: string): boolean => {
    const pathPermissions: Record<string, Permission[]> = {
      '/dashboard': ['view_dashboard'],
      '/obras': ['view_obras'],
      '/etapas': ['view_etapas'],
      '/materiais': ['view_materiais'],
      '/estoque': ['view_estoque'],
      '/compras': ['view_compras'],
      '/usuarios': ['manage_users'],
      '/configuracoes': ['view_settings'],
    };

    const requiredPermissions = pathPermissions[path];
    if (!requiredPermissions) return true; // Permitir acesso se não há permissões definidas

    return hasAnyPermission(requiredPermissions);
  };

  const value: PermissionsContextType = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole,
    getUserPermissions,
    canAccess,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Hook para verificar permissões específicas
export function usePermissionCheck(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

// Hook para verificar múltiplas permissões
export function usePermissionChecks(permissions: Permission[]): boolean[] {
  const { hasPermission } = usePermissions();
  return permissions.map(permission => hasPermission(permission));
}

// Component wrapper para renderização condicional baseada em permissões
interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({ 
  permission, 
  permissions, 
  requireAll = false, 
  fallback = null, 
  children 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Component para mostrar badge do role do usuário
export function UserRoleBadge() {
  const { getUserRole } = usePermissions();
  const role = getUserRole();
  
  if (!role) return null;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}>
      {roleDescriptions[role].split(' - ')[0]}
    </span>
  );
} 