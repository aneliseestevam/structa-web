'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, CheckCircle, Clock, Play, ImageIcon, FileText } from 'lucide-react';
import { Etapa } from '@/types';

export default function EtapasPage() {
  const { etapas, obras, addEtapa, updateEtapa, deleteEtapa } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroObra, setFiltroObra] = useState<string>('all');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState<Etapa | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    obraId: '',
    progresso: 0,
    dataInicio: '',
    dataFim: '',
    observacoes: '',
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const etapaData = {
      ...formData,
      dataInicio: formData.dataInicio ? new Date(formData.dataInicio) : undefined,
      dataFim: formData.dataFim ? new Date(formData.dataFim) : undefined,
      fotos: [],
    };

    if (editingEtapa) {
      // Atualizar etapa existente
      updateEtapa(editingEtapa.id, etapaData);
    } else {
      // Criar nova etapa
      const newEtapa: Etapa = {
        id: Date.now().toString(),
        ...etapaData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addEtapa(newEtapa);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (etapa: Etapa) => {
    setEditingEtapa(etapa);
    setFormData({
      nome: etapa.nome,
      descricao: etapa.descricao,
      obraId: etapa.obraId,
      progresso: etapa.progresso,
      dataInicio: etapa.dataInicio ? etapa.dataInicio.toISOString().split('T')[0] : '',
      dataFim: etapa.dataFim ? etapa.dataFim.toISOString().split('T')[0] : '',
      observacoes: etapa.observacoes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta etapa?')) {
      deleteEtapa(id);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      obraId: '',
      progresso: 0,
      dataInicio: '',
      dataFim: '',
      observacoes: '',
    });
    setEditingEtapa(null);
  };

  const getObraNome = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra ? obra.nome : 'Obra não encontrada';
  };

  const getStatusBadge = (progresso: number) => {
    if (progresso === 0) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Não Iniciada</Badge>;
    } else if (progresso < 100) {
      return <Badge variant="default" className="gap-1"><Play className="h-3 w-3" />Em Andamento</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1"><CheckCircle className="h-3 w-3" />Concluída</Badge>;
    }
  };

  const filteredEtapas = etapas.filter(etapa => {
    const matchesSearch = etapa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         etapa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getObraNome(etapa.obraId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesObra = filtroObra === 'all' || etapa.obraId === filtroObra;
    
    const matchesStatus = filtroStatus === 'all' || 
                         (filtroStatus === 'nao-iniciada' && etapa.progresso === 0) ||
                         (filtroStatus === 'em-andamento' && etapa.progresso > 0 && etapa.progresso < 100) ||
                         (filtroStatus === 'concluida' && etapa.progresso === 100);
    
    return matchesSearch && matchesObra && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Etapas</h1>
            <p className="text-muted-foreground">
              Gerencie as etapas de todas as obras
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Etapa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEtapa ? 'Editar Etapa' : 'Nova Etapa'}
                </DialogTitle>
                <DialogDescription>
                  {editingEtapa 
                    ? 'Atualize as informações da etapa' 
                    : 'Cadastre uma nova etapa para uma obra'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Etapa</Label>
                                      <Input
                    id="nome"
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Fundação"
                    required
                  />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="obraId">Obra</Label>
                    <Select
                      value={formData.obraId}
                      onValueChange={(value) => setFormData({ ...formData, obraId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma obra" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva os detalhes da etapa"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="progresso">Progresso (%)</Label>
                                      <Input
                    id="progresso"
                    type="number"
                    value={formData.progresso || ''}
                    onChange={(e) => setFormData({ ...formData, progresso: Number(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio || ''}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Conclusão</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim || ''}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações adicionais sobre a etapa"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingEtapa ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar etapas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
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

              <div className="flex items-center space-x-2">
                <Label htmlFor="filtroStatus">Status:</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="nao-iniciada">Não Iniciada</SelectItem>
                    <SelectItem value="em-andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Etapas */}
        <Card>
          <CardHeader>
            <CardTitle>Etapas Cadastradas</CardTitle>
            <CardDescription>
              {filteredEtapas.length} etapa(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Datas</TableHead>
                  <TableHead>Fotos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEtapas.map((etapa) => (
                  <TableRow key={etapa.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{etapa.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {etapa.descricao}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getObraNome(etapa.obraId)}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(etapa.progresso)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{etapa.progresso}%</span>
                        </div>
                        <Progress value={etapa.progresso} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {etapa.dataInicio && (
                          <div>Início: {formatDate(etapa.dataInicio)}</div>
                        )}
                        {etapa.dataFim && (
                          <div>Fim: {formatDate(etapa.dataFim)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{etapa.fotos.length}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(etapa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(etapa.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredEtapas.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma etapa encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filtroObra !== 'all' || filtroStatus !== 'all' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece criando a primeira etapa de uma obra'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 