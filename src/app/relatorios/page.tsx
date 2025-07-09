'use client';

import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  BarChart3, 
  DollarSign,
  Building2,
  Package,
  Calendar,
  CheckCircle
} from 'lucide-react';

// Serviços de relatórios
import { ReportService } from '@/services/reportService';

export default function RelatoriosPage() {
  const { obras, materiais, etapas, movimentacoes, compras } = useData();
  const { hasPermission } = usePermissions();
  const { addNotification } = useNotifications();
  const reportService = new ReportService();

  // Helper functions for notifications
  const showSuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message, autoClose: true });
  };

  const showError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message });
  };

  const [selectedObraId, setSelectedObraId] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Verificar permissão antes de usar hooks
  const hasViewReportsPermission = hasPermission('view_reports');

  // Dados filtrados por obra
  const filteredData = useMemo(() => {
    if (selectedObraId === 'all') {
      return {
        obras,
        etapas,
        materiais,
        movimentacoes,
        compras
      };
    }

    const obrasFiltradas = obras.filter(obra => obra.id === selectedObraId);
    const etapasFiltradas = etapas.filter(etapa => etapa.obraId === selectedObraId);
    const comprasFiltradas = compras.filter(compra => compra.obraId === selectedObraId);
    const movimentacoesFiltradas = movimentacoes.filter(mov => 
      etapasFiltradas.some(etapa => etapa.id === mov.etapaId)
    );

    return {
      obras: obrasFiltradas,
      etapas: etapasFiltradas,
      materiais,
      movimentacoes: movimentacoesFiltradas,
      compras: comprasFiltradas
    };
  }, [selectedObraId, obras, etapas, materiais, movimentacoes, compras]);

  // Estatísticas da obra selecionada
  const obraStats = useMemo(() => {
    const data = filteredData;
    
    const totalCustos = data.compras.reduce((sum, compra) => sum + compra.custoTotal, 0);
    const etapasCompletas = data.etapas.filter(etapa => etapa.progresso === 100).length;
    const progressoMedio = data.etapas.length > 0 
      ? data.etapas.reduce((sum, etapa) => sum + etapa.progresso, 0) / data.etapas.length 
      : 0;
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const movimentacoesRecentes = data.movimentacoes.filter(mov => mov.data >= thisMonth).length;
    
    const obraAtual = selectedObraId !== 'all' ? data.obras[0] : null;
    const statusObra = obraAtual?.status || 'N/A';
    const prazoObra = obraAtual?.dataPrevisao ? new Date(obraAtual.dataPrevisao) : null;
    const diasRestantes = prazoObra ? Math.ceil((prazoObra.getTime() - now.getTime()) / (1000 * 3600 * 24)) : null;

    return {
      totalObras: data.obras.length,
      totalEtapas: data.etapas.length,
      etapasCompletas,
      progressoMedio,
      totalCustos,
      movimentacoesRecentes,
      statusObra,
      diasRestantes,
      obraAtual
    };
  }, [filteredData, selectedObraId]);

  // Gráficos e dados específicos da obra
  const chartData = useMemo(() => {
    const data = filteredData;
    
    // Progresso por etapa
    const progressoEtapas = data.etapas.map(etapa => ({
      nome: etapa.nome,
      progresso: etapa.progresso,
      status: etapa.progresso === 100 ? 'finalizada' : etapa.progresso === 0 ? 'não iniciada' : 'em andamento'
    }));

    // Custos por categoria de materiais
    const custosPorCategoria = data.compras.reduce((acc, compra) => {
      // Para cada compra, analisar os itens e suas categorias
      compra.itens?.forEach(item => {
        const material = data.materiais.find(m => m.id === item.materialId);
        const categoria = material?.categoria || 'Outros';
        acc[categoria] = (acc[categoria] || 0) + item.precoTotal;
      });
      
      // Se não houver itens, usar uma categoria padrão baseada no fornecedor
      if (!compra.itens || compra.itens.length === 0) {
        const categoria = 'Outros';
        acc[categoria] = (acc[categoria] || 0) + compra.custoTotal;
      }
      
      return acc;
    }, {} as Record<string, number>);

    const custosChart = Object.entries(custosPorCategoria).map(([categoria, valor]) => ({
      categoria,
      valor
    }));

    // Consumo de materiais
    const consumoMateriais = data.movimentacoes
      .filter(mov => mov.tipo === 'saida')
      .reduce((acc, mov) => {
        const material = data.materiais.find(m => m.id === mov.materialId);
        if (material) {
          acc[material.nome] = (acc[material.nome] || 0) + mov.quantidade;
        }
        return acc;
      }, {} as Record<string, number>);

    const materiaisChart = Object.entries(consumoMateriais)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([material, quantidade]) => ({
        material,
        quantidade
      }));

    return {
      progressoEtapas,
      custosChart,
      materiaisChart
    };
  }, [filteredData]);

  const generateReport = async (type: string, format: 'pdf' | 'excel') => {
    setIsGenerating(true);
    
    try {
      const reportData = {
        type: type as 'custos' | 'progresso' | 'produtividade' | 'materiais' | 'estoque' | 'geral',
        filters: {
          obraId: selectedObraId === 'all' ? '' : selectedObraId,
          dataInicio: '',
          dataFim: '',
          status: '',
        },
        data: filteredData,
      };

      if (format === 'pdf') {
        await reportService.generatePDF(reportData);
      } else {
        await reportService.generateExcel(reportData);
      }

      const obraNome = selectedObraId === 'all' ? 'Todas as Obras' : obraStats.obraAtual?.nome || 'Obra Selecionada';
      showSuccess(
        'Relatório Gerado', 
        `Relatório ${type} de ${obraNome} foi gerado com sucesso`
      );
    } catch {
      showError('Erro', 'Falha ao gerar relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Verificar permissão de acesso
  if (!hasViewReportsPermission) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar os relatórios.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Relatórios</h1>
            <p className="text-muted-foreground">
              Visualize dados detalhados e gere relatórios por obra
            </p>
          </div>
          
          {/* Seletor de Obra */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Selecione uma obra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Todas as Obras</span>
                    </div>
                  </SelectItem>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id}>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4" />
                        <span>{obra.nome}</span>
                        <Badge variant={obra.status === 'em-andamento' ? 'default' : 'secondary'}>
                          {obra.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Informações da Obra Selecionada */}
        {selectedObraId !== 'all' && obraStats.obraAtual && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>{obraStats.obraAtual.nome}</span>
                <Badge variant={obraStats.obraAtual.status === 'em-andamento' ? 'default' : 'secondary'}>
                  {obraStats.obraAtual.status}
                </Badge>
              </CardTitle>
                             <CardDescription>
                 Informações detalhadas da obra selecionada
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                   <div className="text-sm text-gray-600">Responsável</div>
                   <div className="font-medium">{obraStats.obraAtual.responsavel}</div>
                 </div>
                 <div className="space-y-1">
                   <div className="text-sm text-gray-600">Localização</div>
                   <div className="font-medium">{obraStats.obraAtual.local}</div>
                 </div>
                 <div className="space-y-1">
                   <div className="text-sm text-gray-600">Prazo Final</div>
                   <div className="font-medium flex items-center space-x-2">
                     <Calendar className="w-4 h-4" />
                     <span>{new Date(obraStats.obraAtual.dataPrevisao).toLocaleDateString()}</span>
                     {obraStats.diasRestantes !== null && (
                       <Badge variant={obraStats.diasRestantes > 30 ? 'default' : 'destructive'}>
                         {obraStats.diasRestantes > 0 ? `${obraStats.diasRestantes} dias` : 'Atrasado'}
                       </Badge>
                     )}
                   </div>
                 </div>
               </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedObraId === 'all' ? 'Total de Obras' : 'Etapas Totais'}
                  </p>
                  <p className="text-2xl font-bold">
                    {selectedObraId === 'all' ? obraStats.totalObras : obraStats.totalEtapas}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progresso Médio</p>
                  <p className="text-2xl font-bold">{Math.round(obraStats.progressoMedio)}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2">
                <Progress value={obraStats.progressoMedio} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Custos Totais</p>
                  <p className="text-xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                    }).format(obraStats.totalCustos)}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Etapas Completas</p>
                  <p className="text-2xl font-bold">{obraStats.etapasCompletas}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Gráficos e Dados */}
        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">Progresso das Etapas</TabsTrigger>
            <TabsTrigger value="costs">Custos por Categoria</TabsTrigger>
            <TabsTrigger value="materials">Consumo de Materiais</TabsTrigger>
            <TabsTrigger value="reports">Gerar Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progresso das Etapas</CardTitle>
                <CardDescription>
                  Acompanhe o progresso de cada etapa {selectedObraId === 'all' ? 'de todas as obras' : 'da obra selecionada'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.progressoEtapas.map((etapa, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{etapa.nome}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={etapa.progresso === 100 ? 'default' : 'secondary'}>
                            {etapa.status}
                          </Badge>
                          <span className="text-sm text-gray-600">{etapa.progresso}%</span>
                        </div>
                      </div>
                      <Progress value={etapa.progresso} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="costs" className="space-y-4">
            <Card>
                             <CardHeader>
                 <CardTitle>Custos por Categoria de Materiais</CardTitle>
                 <CardDescription>
                   Distribuição de custos por categoria de materiais {selectedObraId === 'all' ? 'de todas as obras' : 'da obra selecionada'}
                 </CardDescription>
               </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.custosChart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{item.categoria}</span>
                      </div>
                      <span className="text-lg font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 0,
                        }).format(item.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consumo de Materiais</CardTitle>
                <CardDescription>
                  Top 10 materiais mais consumidos {selectedObraId === 'all' ? 'em todas as obras' : 'na obra selecionada'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.materiaisChart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">{item.material}</span>
                      </div>
                      <span className="text-lg font-semibold">{item.quantidade}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Relatórios</CardTitle>
                <CardDescription>
                  Gere relatórios em PDF ou Excel {selectedObraId === 'all' ? 'de todas as obras' : 'da obra selecionada'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => generateReport('geral', 'pdf')}
                    disabled={isGenerating}
                    className="flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Relatório Geral (PDF)</span>
                  </Button>
                  <Button
                    onClick={() => generateReport('geral', 'excel')}
                    disabled={isGenerating}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Relatório Geral (Excel)</span>
                  </Button>
                  <Button
                    onClick={() => generateReport('custos', 'pdf')}
                    disabled={isGenerating}
                    className="flex items-center space-x-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Relatório de Custos (PDF)</span>
                  </Button>
                  <Button
                    onClick={() => generateReport('progresso', 'pdf')}
                    disabled={isGenerating}
                    className="flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Relatório de Progresso (PDF)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 