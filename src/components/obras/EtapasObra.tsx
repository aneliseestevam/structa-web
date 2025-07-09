'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, CheckCircle, Clock, Play, ImageIcon } from 'lucide-react';
import { Etapa } from '@/types';

interface EtapasObraProps {
  obraId: string;
  obraNome: string;
}

export default function EtapasObra({ obraId, obraNome }: EtapasObraProps) {
  const { 
    getEtapasByObra, 
    getProgressoObra, 
    getEtapasCompletadas, 
    getEtapasTotal,
    addEtapa, 
    updateEtapa, 
    deleteEtapa,
    createEtapasTemplate 
  } = useData();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState<Etapa | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    progresso: 0,
    dataInicio: '',
    dataFim: '',
    observacoes: '',
  });

  const etapas = getEtapasByObra(obraId);
  const progressoGeral = getProgressoObra(obraId);
  const etapasCompletadas = getEtapasCompletadas(obraId);
  const etapasTotal = getEtapasTotal(obraId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const etapaData = {
      ...formData,
      obraId,
      dataInicio: formData.dataInicio ? new Date(formData.dataInicio) : undefined,
      dataFim: formData.dataFim ? new Date(formData.dataFim) : undefined,
      fotos: [],
    };

    if (editingEtapa) {
      updateEtapa(editingEtapa.id, etapaData);
    } else {
      const newEtapa: Etapa = {
        id: Date.now().toString(),
        ...etapaData,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
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
      progresso: 0,
      dataInicio: '',
      dataFim: '',
      observacoes: '',
    });
    setEditingEtapa(null);
  };

  const handleCreateTemplate = async () => {
    if (confirm('Deseja criar etapas padrão para esta obra? Isso adicionará: Fundação, Estrutura, Alvenaria e Acabamento.')) {
      await createEtapasTemplate(obraId);
    }
  };

  const getStatusBadge = (progresso: number) => {
    if (progresso === 100) {
      return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Concluída</Badge>;
    } else if (progresso > 0) {
      return <Badge variant="secondary" className="gap-1"><Play className="h-3 w-3" />Em Andamento</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Não Iniciada</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Etapas da Obra</CardTitle>
            <CardDescription>
              {obraNome} • {etapasCompletadas} de {etapasTotal} etapas concluídas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {etapas.length === 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateTemplate}
              >
                <Plus className="h-4 w-4 mr-1" />
                Criar Padrão
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Etapa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEtapa ? 'Editar Etapa' : 'Nova Etapa'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEtapa ? 'Atualize as informações da etapa' : 'Adicione uma nova etapa à obra'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Etapa</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Fundação"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progresso">Progresso (%)</Label>
                      <Input
                        id="progresso"
                        type="number"
                        value={formData.progresso}
                        onChange={(e) => setFormData({ ...formData, progresso: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva a etapa..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={formData.dataInicio}
                        onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataFim">Data de Conclusão</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={formData.dataFim}
                        onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Observações adicionais..."
                      rows={2}
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
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Progresso Geral */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progresso Geral da Obra</span>
            <span className="text-sm font-semibold">{progressoGeral}%</span>
          </div>
          <Progress value={progressoGeral} className="h-2" />
        </div>

        {/* Lista de Etapas */}
        {etapas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Nenhuma etapa cadastrada</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione etapas para acompanhar o progresso da obra
            </p>
            <Button onClick={handleCreateTemplate} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Criar Etapas Padrão
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {etapas.map((etapa) => (
              <div key={etapa.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{etapa.nome}</h4>
                      {getStatusBadge(etapa.progresso)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {etapa.descricao}
                    </p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progresso: {etapa.progresso}%</span>
                    </div>
                    <Progress value={etapa.progresso} className="h-1 mb-2" />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
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
                </div>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {etapa.dataInicio && (
                      <span>Início: {formatDate(etapa.dataInicio)}</span>
                    )}
                    {etapa.dataFim && (
                      <span>Fim: {formatDate(etapa.dataFim)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>{etapa.fotos.length} fotos</span>
                  </div>
                </div>
                
                {etapa.observacoes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <strong>Observações:</strong> {etapa.observacoes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 