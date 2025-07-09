'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, ShoppingCart, Clock, CheckCircle, FileText, DollarSign } from 'lucide-react';
import { Compra, CompraItem } from '@/types';

export default function ComprasPage() {
  const { compras, materiais, obras, addCompra, updateCompra, deleteCompra } = useData();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroObra, setFiltroObra] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null);
  const [itemsTemp, setItemsTemp] = useState<Array<Omit<CompraItem, 'id' | 'compraId'> & { tempId?: string }>>([]);
  const [formData, setFormData] = useState({
    obraId: '',
    fornecedor: '',
    dataCompra: '',
    notaFiscal: '',
    status: 'pendente' as Compra['status'],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const compraId = editingCompra?.id || `compra_${Date.now()}`;
    
    const compraData = {
      ...formData,
      dataCompra: new Date(formData.dataCompra),
      custoTotal: itemsTemp.reduce((total, item) => total + (item.precoTotal || 0), 0),
      itens: itemsTemp.map((item, index) => ({
        materialId: item.materialId,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        precoTotal: item.precoTotal,
        id: `${compraId}_item_${index}`,
        compraId: compraId,
      })),
    };

    if (editingCompra) {
      // Atualizar compra existente
      updateCompra(editingCompra.id, compraData);
    } else {
      // Criar nova compra
      const newCompra: Compra = {
        id: compraId,
        ...compraData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addCompra(newCompra);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (compra: Compra) => {
    setEditingCompra(compra);
    setFormData({
      obraId: compra.obraId || '',
      fornecedor: compra.fornecedor || '',
      dataCompra: compra.dataCompra.toISOString().split('T')[0] || '',
      notaFiscal: compra.notaFiscal || '',
      status: compra.status || 'pendente',
    });
    setItemsTemp(compra.itens.map(item => ({
      materialId: item.materialId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      precoTotal: item.precoTotal,
      tempId: `temp_${Date.now()}_${Math.random()}`,
    })) || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta compra?')) {
      deleteCompra(id);
    }
  };

  const handleStatusChange = (compraId: string, newStatus: Compra['status']) => {
    updateCompra(compraId, { status: newStatus });
  };

  const addItem = () => {
    const newItem = {
      materialId: '',
      quantidade: 0,
      precoUnitario: 0,
      precoTotal: 0,
      tempId: `temp_${Date.now()}_${Math.random()}`,
    };
    setItemsTemp([...itemsTemp, newItem]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...itemsTemp];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantidade' || field === 'precoUnitario') {
      const quantidade = newItems[index].quantidade || 0;
      const precoUnitario = newItems[index].precoUnitario || 0;
      newItems[index].precoTotal = quantidade * precoUnitario;
    }
    
    setItemsTemp(newItems);
  };

  const removeItem = (index: number) => {
    setItemsTemp(itemsTemp.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      obraId: '',
      fornecedor: '',
      dataCompra: '',
      notaFiscal: '',
      status: 'pendente',
    });
    setItemsTemp([]);
    setEditingCompra(null);
  };

  const getObraNome = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra ? obra.nome : 'Obra não encontrada';
  };

  const getStatusBadge = (status: Compra['status']) => {
    const statusConfig = {
      'pendente': { variant: 'secondary' as const, label: 'Pendente', icon: Clock },
      'aprovada': { variant: 'default' as const, label: 'Aprovada', icon: CheckCircle },
      'entregue': { variant: 'outline' as const, label: 'Entregue', icon: CheckCircle },
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredCompras = compras.filter(compra => {
    const matchesSearch = compra.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getObraNome(compra.obraId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (compra.notaFiscal || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filtroStatus === 'all' || compra.status === filtroStatus;
    const matchesObra = filtroObra === 'all' || compra.obraId === filtroObra;
    
    return matchesSearch && matchesStatus && matchesObra;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const stats = {
    totalCompras: compras.length,
    pendentes: compras.filter(c => c.status === 'pendente').length,
    aprovadas: compras.filter(c => c.status === 'aprovada').length,
    entregues: compras.filter(c => c.status === 'entregue').length,
    valorTotal: compras.reduce((total, c) => total + c.custoTotal, 0),
  };

  // Não renderizar até que o componente seja montado no cliente
  if (!mounted) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
            <p className="text-muted-foreground">
              Gestão de pedidos, cotações e aprovações
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCompra ? 'Editar Compra' : 'Nova Compra'}
                </DialogTitle>
                <DialogDescription>
                  {editingCompra 
                    ? 'Atualize as informações da compra' 
                    : 'Registre uma nova compra de materiais'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="obraId">Obra</Label>
                    <Select
                      value={formData.obraId}
                      onValueChange={(value) => setFormData({ ...formData, obraId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a obra" />
                      </SelectTrigger>
                      <SelectContent>
                        {obras.map(obra => (
                          <SelectItem key={obra.id} value={obra.id}>
                            {obra.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      value={formData.fornecedor}
                      onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                      placeholder="Nome do fornecedor"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataCompra">Data da Compra</Label>
                    <Input
                      id="dataCompra"
                      type="date"
                      value={formData.dataCompra}
                      onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notaFiscal">Nota Fiscal</Label>
                    <Input
                      id="notaFiscal"
                      value={formData.notaFiscal}
                      onChange={(e) => setFormData({ ...formData, notaFiscal: e.target.value })}
                      placeholder="Número da NF"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as Compra['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="aprovada">Aprovada</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Itens da Compra */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Itens da Compra</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {itemsTemp.map((item, index) => (
                      <div key={item.tempId || `item_${index}`} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-600">Item {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-slate-700">Material</Label>
                            <Select
                              value={item.materialId}
                              onValueChange={(value) => updateItem(index, 'materialId', value)}
                              required
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione o material" />
                              </SelectTrigger>
                              <SelectContent>
                                {materiais.map(material => (
                                  <SelectItem key={material.id} value={material.id}>
                                    {material.nome} ({material.unidade})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-700">Quantidade</Label>
                            <Input
                              type="number"
                              value={item.quantidade === 0 ? '' : item.quantidade.toString()}
                              onChange={(e) => updateItem(index, 'quantidade', e.target.value === '' ? 0 : Number(e.target.value))}
                              min="0"
                              step="0.01"
                              placeholder="0"
                              className="mt-1"
                              required
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-700">Preço Unit.</Label>
                            <Input
                              type="number"
                              value={item.precoUnitario === 0 ? '' : item.precoUnitario.toString()}
                              onChange={(e) => updateItem(index, 'precoUnitario', e.target.value === '' ? 0 : Number(e.target.value))}
                              min="0"
                              step="0.01"
                              placeholder="0,00"
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-3 pt-3 border-t border-slate-200">
                          <div className="text-right">
                            <span className="text-sm text-slate-600">Total do item:</span>
                            <div className="text-lg font-semibold text-slate-900">
                              {formatCurrency(item.precoTotal || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {itemsTemp.length > 0 && (
                    <div className="flex justify-end pt-3 border-t">
                      <div className="text-lg font-semibold">
                        Total: {formatCurrency(itemsTemp.reduce((total, item) => total + (item.precoTotal || 0), 0))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={itemsTemp.length === 0}>
                    {editingCompra ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompras}</div>
              <p className="text-xs text-muted-foreground">
                Compras registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.pendentes}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.aprovadas}</div>
              <p className="text-xs text-muted-foreground">
                Compras aprovadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregues</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.entregues}</div>
              <p className="text-xs text-muted-foreground">
                Compras entregues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.valorTotal)}</div>
              <p className="text-xs text-muted-foreground">
                Valor total das compras
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar compras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="filtroStatus">Status:</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="filtroObra">Obra:</Label>
                <Select value={filtroObra} onValueChange={setFiltroObra}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as obras</SelectItem>
                    {obras.map(obra => (
                      <SelectItem key={obra.id} value={obra.id}>
                        {obra.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Compras */}
        <Card>
          <CardHeader>
            <CardTitle>Compras Registradas</CardTitle>
            <CardDescription>
              {filteredCompras.length} compra(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nota Fiscal</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>
                      {formatDate(compra.dataCompra)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{compra.fornecedor}</div>
                      <div className="text-sm text-muted-foreground">
                        {compra.itens.length} item(ns)
                      </div>
                    </TableCell>
                    <TableCell>
                      {getObraNome(compra.obraId)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(compra.custoTotal)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(compra.status)}
                        {compra.status === 'pendente' && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(compra.id, 'aprovada')}
                            >
                              Aprovar
                            </Button>
                          </div>
                        )}
                        {compra.status === 'aprovada' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(compra.id, 'entregue')}
                          >
                            Marcar Entregue
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {compra.notaFiscal ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{compra.notaFiscal}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(compra)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(compra.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCompras.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma compra encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filtroStatus !== 'all' || filtroObra !== 'all'
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece registrando a primeira compra'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 