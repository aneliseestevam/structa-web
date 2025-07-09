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
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Material } from '@/types';

const categorias = [
  'Cimento e Argamassa',
  'Estrutura Metálica',
  'Madeira',
  'Hidráulica',
  'Elétrica',
  'Acabamento',
  'Cobertura',
  'Ferramentas',
  'Outros'
];

export default function MateriaisPage() {
  const { materiais, addMaterial, updateMaterial, deleteMaterial } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroEstoque, setFiltroEstoque] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    unidade: '',
    fornecedor: '',
    preco: 0,
    categoria: '',
    estoque: 0,
    estoqueMinimo: 0,
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaterial) {
      // Atualizar material existente
      updateMaterial(editingMaterial.id, formData);
    } else {
      // Criar novo material
      const newMaterial: Material = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addMaterial(newMaterial);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      nome: material.nome,
      unidade: material.unidade,
      fornecedor: material.fornecedor,
      preco: material.preco,
      categoria: material.categoria,
      estoque: material.estoque,
      estoqueMinimo: material.estoqueMinimo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      deleteMaterial(id);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      unidade: '',
      fornecedor: '',
      preco: 0,
      categoria: '',
      estoque: 0,
      estoqueMinimo: 0,
    });
    setEditingMaterial(null);
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

  const filteredMateriais = materiais.filter(material => {
    const matchesSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = filtroCategoria === 'all' || material.categoria === filtroCategoria;
    
    const matchesEstoque = filtroEstoque === 'all' || 
                          (filtroEstoque === 'baixo' && material.estoque <= material.estoqueMinimo) ||
                          (filtroEstoque === 'normal' && material.estoque > material.estoqueMinimo) ||
                          (filtroEstoque === 'esgotado' && material.estoque === 0);
    
    return matchesSearch && matchesCategoria && matchesEstoque;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const stats = {
    total: materiais.length,
    baixoEstoque: materiais.filter(m => m.estoque <= m.estoqueMinimo && m.estoque > 0).length,
    esgotados: materiais.filter(m => m.estoque === 0).length,
    valorTotal: materiais.reduce((total, m) => total + (m.preco * m.estoque), 0),
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Materiais</h1>
            <p className="text-muted-foreground">
              Catálogo de materiais, preços e fornecedores
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMaterial ? 'Editar Material' : 'Novo Material'}
                </DialogTitle>
                <DialogDescription>
                  {editingMaterial 
                    ? 'Atualize as informações do material' 
                    : 'Cadastre um novo material no catálogo'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Material</Label>
                                      <Input
                    id="nome"
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Cimento CP-II-Z-32"
                    required
                  />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select
                      value={formData.unidade}
                      onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Quilograma (kg)</SelectItem>
                        <SelectItem value="m">Metro (m)</SelectItem>
                        <SelectItem value="m²">Metro quadrado (m²)</SelectItem>
                        <SelectItem value="m³">Metro cúbico (m³)</SelectItem>
                        <SelectItem value="sc">Saco (sc)</SelectItem>
                        <SelectItem value="gl">Galão (gl)</SelectItem>
                        <SelectItem value="lt">Litro (lt)</SelectItem>
                        <SelectItem value="un">Unidade (un)</SelectItem>
                        <SelectItem value="mil">Milheiro (mil)</SelectItem>
                        <SelectItem value="cx">Caixa (cx)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      value={formData.fornecedor || ''}
                      onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                      placeholder="Nome do fornecedor"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(categoria => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço Unitário (R$)</Label>
                                      <Input
                    id="preco"
                    type="number"
                    value={formData.preco || ''}
                    onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estoque">Estoque Atual</Label>
                                      <Input
                    id="estoque"
                    type="number"
                    value={formData.estoque || ''}
                    onChange={(e) => setFormData({ ...formData, estoque: Number(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    required
                  />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                                      <Input
                    id="estoqueMinimo"
                    type="number"
                    value={formData.estoqueMinimo || ''}
                    onChange={(e) => setFormData({ ...formData, estoqueMinimo: Number(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    required
                  />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingMaterial ? 'Atualizar' : 'Criar'}
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
              <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Materiais cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.baixoEstoque}</div>
              <p className="text-xs text-muted-foreground">
                Materiais com estoque baixo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esgotados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.esgotados}</div>
              <p className="text-xs text-muted-foreground">
                Materiais esgotados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.valorTotal)}</div>
              <p className="text-xs text-muted-foreground">
                Valor total em estoque
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
                  placeholder="Buscar materiais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="filtroCategoria">Categoria:</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="filtroEstoque">Estoque:</Label>
                <Select value={filtroEstoque} onValueChange={setFiltroEstoque}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="normal">Estoque Normal</SelectItem>
                    <SelectItem value="baixo">Estoque Baixo</SelectItem>
                    <SelectItem value="esgotado">Esgotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Materiais */}
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Materiais</CardTitle>
            <CardDescription>
              {filteredMateriais.length} material(is) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMateriais.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{material.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          Unidade: {material.unidade}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{material.fornecedor}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{material.categoria}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(material.preco)}</div>
                      <div className="text-sm text-muted-foreground">
                        por {material.unidade}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{material.estoque.toLocaleString('pt-BR')}</div>
                      <div className="text-sm text-muted-foreground">
                        Mín: {material.estoqueMinimo.toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getEstoqueBadge(material.estoque, material.estoqueMinimo)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredMateriais.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Nenhum material encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filtroCategoria !== 'all' || filtroEstoque !== 'all'
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece criando o primeiro material do catálogo'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 