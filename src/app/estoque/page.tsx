'use client';

import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, ArrowUp, ArrowDown, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { MovimentacaoEstoque } from '@/types';

export default function EstoquePage() {
  const { movimentacoes, materiais, obras, etapas, addMovimentacao, updateMovimentacao, deleteMovimentacao, updateMaterial } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [filtroMaterial, setFiltroMaterial] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState<MovimentacaoEstoque | null>(null);
  const [formData, setFormData] = useState({
    materialId: '',
    obraId: '',
    etapaId: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: 0,
    motivo: '',
    responsavel: '',
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const movimentacaoData = {
      ...formData,
      data: new Date(),
    };

    if (editingMovimentacao) {
      // Atualizar movimentação existente
      updateMovimentacao(editingMovimentacao.id, movimentacaoData);
    } else {
      // Criar nova movimentação
      const newMovimentacao: MovimentacaoEstoque = {
        id: Date.now().toString(),
        ...movimentacaoData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addMovimentacao(newMovimentacao);
      
      // Atualizar estoque do material
      const material = materiais.find(m => m.id === formData.materialId);
      if (material) {
        const novoEstoque = formData.tipo === 'entrada' 
          ? material.estoque + formData.quantidade
          : material.estoque - formData.quantidade;
        
        updateMaterial(formData.materialId, { estoque: novoEstoque });
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (movimentacao: MovimentacaoEstoque) => {
    setEditingMovimentacao(movimentacao);
    setFormData({
      materialId: movimentacao.materialId,
      obraId: movimentacao.obraId,
      etapaId: movimentacao.etapaId || '',
      tipo: movimentacao.tipo,
      quantidade: movimentacao.quantidade,
      motivo: movimentacao.motivo,
      responsavel: movimentacao.responsavel,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      deleteMovimentacao(id);
    }
  };

  const resetForm = () => {
    setFormData({
      materialId: '',
      obraId: '',
      etapaId: '',
      tipo: 'entrada',
      quantidade: 0,
      motivo: '',
      responsavel: '',
    });
    setEditingMovimentacao(null);
  };

  const getMaterialNome = (materialId: string) => {
    const material = materiais.find(m => m.id === materialId);
    return material ? material.nome : 'Material não encontrado';
  };

  const getObraNome = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra ? obra.nome : 'Obra não encontrada';
  };

  const getEtapaNome = (etapaId: string) => {
    const etapa = etapas.find(e => e.id === etapaId);
    return etapa ? etapa.nome : '';
  };

  const getTipoBadge = (tipo: 'entrada' | 'saida') => {
    return tipo === 'entrada' 
      ? <Badge variant="default" className="gap-1"><ArrowUp className="h-3 w-3" />Entrada</Badge>
      : <Badge variant="secondary" className="gap-1"><ArrowDown className="h-3 w-3" />Saída</Badge>;
  };

  const getEstoqueBadge = (estoque: number, estoqueMinimo: number) => {
    if (estoque === 0) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Esgotado</Badge>;
    } else if (estoque <= estoqueMinimo) {
      return <Badge variant="secondary" className="gap-1"><TrendingDown className="h-3 w-3" />Baixo</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1"><TrendingUp className="h-3 w-3" />Normal</Badge>;
    }
  };

  const filteredMovimentacoes = movimentacoes.filter(mov => {
    const material = materiais.find(m => m.id === mov.materialId);
    const obra = obras.find(o => o.id === mov.obraId);
    
    const matchesSearch = (material?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (obra?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mov.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mov.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filtroTipo === 'all' || mov.tipo === filtroTipo;
    const matchesMaterial = filtroMaterial === 'all' || mov.materialId === filtroMaterial;
    
    return matchesSearch && matchesTipo && matchesMaterial;
  });

  const materiaisComEstoqueBaixo = materiais.filter(m => m.estoque <= m.estoqueMinimo && m.estoque > 0);
  const materiaisEsgotados = materiais.filter(m => m.estoque === 0);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const stats = {
    totalMovimentacoes: movimentacoes.length,
    entradasMes: movimentacoes.filter(m => m.tipo === 'entrada' && 
      m.data.getMonth() === new Date().getMonth()).length,
    saidasMes: movimentacoes.filter(m => m.tipo === 'saida' && 
      m.data.getMonth() === new Date().getMonth()).length,
    alertas: materiaisComEstoqueBaixo.length + materiaisEsgotados.length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
            <p className="text-muted-foreground">
              Controle de movimentações e níveis de estoque
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMovimentacao ? 'Editar Movimentação' : 'Nova Movimentação'}
                </DialogTitle>
                <DialogDescription>
                  {editingMovimentacao 
                    ? 'Atualize as informações da movimentação' 
                    : 'Registre uma nova movimentação de estoque'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="materialId">Material</Label>
                    <Select
                      value={formData.materialId}
                      onValueChange={(value) => setFormData({ ...formData, materialId: value })}
                      required
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value as 'entrada' | 'saida' })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                    <Label htmlFor="etapaId">Etapa (Opcional)</Label>
                    <Select
                      value={formData.etapaId || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, etapaId: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma etapa</SelectItem>
                        {etapas.filter(e => e.obraId === formData.obraId).map(etapa => (
                          <SelectItem key={etapa.id} value={etapa.id}>
                            {etapa.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={formData.quantidade === 0 ? '' : formData.quantidade.toString()}
                      onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      required
                    />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo</Label>
                  <Textarea
                    id="motivo"
                    value={formData.motivo || ''}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Descreva o motivo da movimentação"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingMovimentacao ? 'Atualizar' : 'Registrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMovimentacoes}</div>
              <p className="text-xs text-muted-foreground">
                Total de movimentações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas (Mês)</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.entradasMes}</div>
              <p className="text-xs text-muted-foreground">
                Entradas este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saídas (Mês)</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.saidasMes}</div>
              <p className="text-xs text-muted-foreground">
                Saídas este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.alertas}</div>
              <p className="text-xs text-muted-foreground">
                Materiais com alerta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="movimentacoes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
            <TabsTrigger value="niveis">Níveis de Estoque</TabsTrigger>
          </TabsList>

          <TabsContent value="movimentacoes" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar movimentações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="filtroTipo">Tipo:</Label>
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="filtroMaterial">Material:</Label>
                    <Select value={filtroMaterial} onValueChange={setFiltroMaterial}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os materiais</SelectItem>
                        {materiais.map(material => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Movimentações */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Movimentações</CardTitle>
                <CardDescription>
                  {filteredMovimentacoes.length} movimentação(ões) encontrada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Obra</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovimentacoes.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {formatDate(mov.data)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getMaterialNome(mov.materialId)}</div>
                            <div className="text-sm text-muted-foreground">{mov.motivo}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTipoBadge(mov.tipo)}</TableCell>
                        <TableCell className="font-medium">{mov.quantidade.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>{getObraNome(mov.obraId)}</TableCell>
                        <TableCell>{getEtapaNome(mov.etapaId || '')}</TableCell>
                        <TableCell>{mov.responsavel}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(mov)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(mov.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredMovimentacoes.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Nenhuma movimentação encontrada</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filtroTipo !== 'all' || filtroMaterial !== 'all'
                        ? 'Tente ajustar os filtros de busca' 
                        : 'Comece registrando a primeira movimentação'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alertas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Estoque</CardTitle>
                <CardDescription>
                  Materiais que precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materiaisEsgotados.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-500 mb-2">Materiais Esgotados</h4>
                      <div className="space-y-2">
                        {materiaisEsgotados.map(material => (
                          <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                            <div>
                              <div className="font-medium">{material.nome}</div>
                              <div className="text-sm text-muted-foreground">
                                Fornecedor: {material.fornecedor}
                              </div>
                            </div>
                            <Badge variant="destructive">Esgotado</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {materiaisComEstoqueBaixo.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-500 mb-2">Estoque Baixo</h4>
                      <div className="space-y-2">
                        {materiaisComEstoqueBaixo.map(material => (
                          <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                            <div>
                              <div className="font-medium">{material.nome}</div>
                              <div className="text-sm text-muted-foreground">
                                Atual: {material.estoque} {material.unidade} | Mínimo: {material.estoqueMinimo} {material.unidade}
                              </div>
                            </div>
                            <Badge variant="secondary">Baixo</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {materiaisEsgotados.length === 0 && materiaisComEstoqueBaixo.length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">Todos os estoques normais</h3>
                      <p className="text-muted-foreground">
                        Não há alertas de estoque no momento
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="niveis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Níveis de Estoque</CardTitle>
                <CardDescription>
                  Visão geral dos estoques de todos os materiais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                      <TableHead>Estoque Mínimo</TableHead>
                      <TableHead>Valor em Estoque</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materiais.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{material.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {material.fornecedor}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {material.estoque.toLocaleString('pt-BR')} {material.unidade}
                          </div>
                        </TableCell>
                        <TableCell>
                          {material.estoqueMinimo.toLocaleString('pt-BR')} {material.unidade}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(material.estoque * material.preco)}
                        </TableCell>
                        <TableCell>
                          {getEstoqueBadge(material.estoque, material.estoqueMinimo)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 