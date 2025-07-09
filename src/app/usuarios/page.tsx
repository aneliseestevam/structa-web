'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { usePermissions, Role, roleDescriptions, roleColors } from '@/contexts/PermissionsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, User, Mail, Shield, AlertTriangle } from 'lucide-react';

// Tipo para usuário
interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Dados mock de usuários
const mockUsuarios: Usuario[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@constructa.com',
    role: 'admin',
    ativo: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@constructa.com',
    role: 'manager',
    ativo: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    email: 'pedro@constructa.com',
    role: 'engineer',
    ativo: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'ana@constructa.com',
    role: 'supervisor',
    ativo: false,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: '5',
    nome: 'Carlos Pereira',
    email: 'carlos@constructa.com',
    role: 'worker',
    ativo: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

export default function UsuariosPage() {
  const { hasPermission } = usePermissions();
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'worker' as Role,
    ativo: true,
  });

  // Verificar se o usuário tem permissão para acessar esta página
  if (!hasPermission('manage_users')) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Esta página é restrita a administradores. Entre em contato com seu supervisor se você acredita que deveria ter acesso.
              </p>
              <Button variant="outline" onClick={() => window.history.back()}>
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUsuario) {
      // Atualizar usuário existente
      setUsuarios(usuarios.map(user => 
        user.id === editingUsuario.id 
          ? { ...user, ...formData, updatedAt: new Date() }
          : user
      ));
    } else {
      // Criar novo usuário
      const newUsuario: Usuario = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUsuarios([...usuarios, newUsuario]);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsuarios(usuarios.filter(user => user.id !== id));
    }
  };

  const toggleUsuarioStatus = (id: string) => {
    setUsuarios(usuarios.map(user => 
      user.id === id 
        ? { ...user, ativo: !user.ativo, updatedAt: new Date() }
        : user
    ));
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      role: 'worker',
      ativo: true,
    });
    setEditingUsuario(null);
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: Role) => {
    return (
      <Badge className={roleColors[role]}>
        {roleDescriptions[role].split(' - ')[0]}
      </Badge>
    );
  };

  const getStatusBadge = (ativo: boolean) => {
    return (
      <Badge variant={ativo ? 'default' : 'secondary'}>
        {ativo ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários e suas permissões no sistema
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {editingUsuario 
                    ? 'Atualize as informações do usuário' 
                    : 'Cadastre um novo usuário no sistema'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ex: joao@constructa.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as Role })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="engineer">Engenheiro</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="worker">Funcionário</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {roleDescriptions[formData.role]}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="ativo">Usuário ativo</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUsuario ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alertas de Permissões */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Área Restrita</p>
                <p className="text-sm">
                  Esta página é acessível apenas por administradores. As alterações afetam o acesso ao sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>
              {filteredUsuarios.length} usuário(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {usuario.nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {usuario.email}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(usuario.ativo)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUsuarioStatus(usuario.id)}
                          className="h-6 px-2 text-xs"
                        >
                          {usuario.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(usuario.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(usuario.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 