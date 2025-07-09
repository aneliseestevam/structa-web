'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { PermissionGate } from '@/contexts/PermissionsContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Building2, Calendar, DollarSign, MapPin, ChevronUp, ChevronDown, User } from 'lucide-react';
import { Obra } from '@/types';
import EtapasObra from '@/components/obras/EtapasObra';

export default function ObrasPage() {
  const { obras, addObra, updateObra, deleteObra, getProgressoObra, createEtapasTemplate } = useData();
  const { addNotification } = useNotifications();
  
  // Helper functions for notifications
  const showSuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message, autoClose: true });
  };

  const showError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message });
  };

  const [searchTerm, setSearchTerm] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [expandedObra, setExpandedObra] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    dataInicio: '',
    dataPrevisao: '',
    responsavel: '',
    orcamento: 0,
    status: 'planejada' as Obra['status'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const obraData = {
        ...formData,
        dataInicio: new Date(formData.dataInicio),
        dataPrevisao: new Date(formData.dataPrevisao),
      };

      if (editingObra) {
        // Atualizar obra existente
        updateObra(editingObra.id, obraData);
        showSuccess('Obra Atualizada', 'As informações da obra foram atualizadas com sucesso');
      } else {
        // Criar nova obra
        const newObra: Obra = {
          id: Date.now().toString(),
          ...obraData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addObra(newObra);
        
        // Criar etapas padrão automaticamente
        await createEtapasTemplate(newObra.id);
        
        showSuccess('Obra Criada', 'Nova obra criada com sucesso e etapas padrão adicionadas');
      }

      resetForm();
      setIsDialogOpen(false);
    } catch {
      showError('Erro', 'Ocorreu um erro ao salvar a obra. Tente novamente.');
    }
  };

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra);
    setFormData({
      nome: obra.nome,
      local: obra.local,
      dataInicio: obra.dataInicio.toISOString().split('T')[0],
      dataPrevisao: obra.dataPrevisao.toISOString().split('T')[0],
      responsavel: obra.responsavel,
      status: obra.status,
      orcamento: obra.orcamento || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const obra = obras.find(o => o.id === id);
    if (confirm('Tem certeza que deseja excluir esta obra?')) {
      try {
        deleteObra(id);
        showSuccess('Obra Excluída', `A obra "${obra?.nome}" foi excluída com sucesso!`);
      } catch {
        showError('Erro', 'Falha ao excluir obra. Tente novamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      local: '',
      dataInicio: '',
      dataPrevisao: '',
      responsavel: '',
      status: 'planejada',
      orcamento: 0,
    });
    setEditingObra(null);
  };

  const toggleExpandObra = (obraId: string) => {
    setExpandedObra(expandedObra === obraId ? null : obraId);
  };

  const filteredObras = obras.filter(obra =>
    obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Obra['status']) => {
    const statusConfig = {
      'planejada': { variant: 'secondary' as const, label: 'Planejada' },
      'em-andamento': { variant: 'default' as const, label: 'Em Andamento' },
      'finalizada': { variant: 'outline' as const, label: 'Finalizada' },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
            <h1 className="text-3xl font-bold tracking-tight">Obras</h1>
            <p className="text-muted-foreground">
              Gerencie todas as obras em andamento
            </p>
          </div>
          
          <PermissionGate permission="manage_obras">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Obra
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingObra ? 'Editar Obra' : 'Nova Obra'}
                </DialogTitle>
                <DialogDescription>
                  {editingObra 
                    ? 'Atualize as informações da obra' 
                    : 'Cadastre uma nova obra no sistema'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Obra</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Residencial Alpha"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={formData.local || ''}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    placeholder="Ex: Bairro Centro, Cidade A"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio || ''}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataPrevisao">Previsão de Término</Label>
                    <Input
                      id="dataPrevisao"
                      type="date"
                      value={formData.dataPrevisao || ''}
                      onChange={(e) => setFormData({ ...formData, dataPrevisao: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel || ''}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do responsável"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Obra['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejada">Planejada</SelectItem>
                      <SelectItem value="em-andamento">Em Andamento</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orcamento">Orçamento (R$)</Label>
                  <Input
                    id="orcamento"
                    type="number"
                    value={formData.orcamento || ''}
                    onChange={(e) => setFormData({ ...formData, orcamento: Number(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingObra ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </PermissionGate>
        </div>

        {/* Busca e Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar obras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Obras */}
        <Card>
          <CardHeader>
            <CardTitle>Obras Cadastradas</CardTitle>
            <CardDescription>
              {filteredObras.length} obra(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Previsão</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObras.map((obra) => (
                    <React.Fragment key={obra.id}>
                      <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => toggleExpandObra(obra.id)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {obra.nome}
                            {expandedObra === obra.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {obra.local}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {obra.responsavel}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(obra.status)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{getProgressoObra(obra.id)}%</span>
                            </div>
                            <Progress value={getProgressoObra(obra.id)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(obra.dataPrevisao)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {obra.orcamento ? formatCurrency(obra.orcamento) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <PermissionGate permission="manage_obras">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(obra);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </PermissionGate>
                            <PermissionGate permission="manage_obras">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(obra.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedObra === obra.id && (
                        <TableRow>
                          <TableCell colSpan={8} className="p-0">
                            <div className="p-4 bg-gray-50 border-t">
                              <EtapasObra obraId={obra.id} obraNome={obra.nome} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredObras.map((obra) => (
                <Card key={obra.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">{obra.nome}</h3>
                    </div>
                    {getStatusBadge(obra.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Local:</span>
                      <span>{obra.local}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Responsável:</span>
                      <span>{obra.responsavel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Previsão:</span>
                      <span>{formatDate(obra.dataPrevisao)}</span>
                    </div>
                    {obra.orcamento && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Orçamento:</span>
                        <span className="font-medium">{formatCurrency(obra.orcamento)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm font-semibold">{getProgressoObra(obra.id)}%</span>
                    </div>
                    <Progress value={getProgressoObra(obra.id)} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpandObra(obra.id)}
                      className="flex-1"
                    >
                      {expandedObra === obra.id ? (
                        <ChevronUp className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      )}
                      Etapas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(obra)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(obra.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                  
                  {/* Etapas expandidas */}
                  {expandedObra === obra.id && (
                    <div className="mt-4 border-t pt-4">
                      <EtapasObra obraId={obra.id} obraNome={obra.nome} />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filteredObras.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma obra encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando sua primeira obra'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 