'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import KPICards from '@/components/dashboard/KPICards';
import EvolutionChart from '@/components/charts/EvolutionChart';
import ExpenseChart from '@/components/charts/ExpenseChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/contexts/DataContext';
import { 
  DashboardKPIs, 
  EvolucaoObra, 
  GastosPorEtapa, 
  MaterialMaisConsumido 
} from '@/types';
import { 
  Building2, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';

export default function DashboardPage() {
  const { obras, etapas, materiais, compras, movimentacoes } = useData();
  const [selectedObraId, setSelectedObraId] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState(false);

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

  // KPIs baseados na obra selecionada
  const kpis = useMemo<DashboardKPIs>(() => {
    const data = filteredData;
    
    const totalObras = data.obras.length;
    const obrasEmAndamento = data.obras.filter(obra => obra.status === 'em-andamento').length;
    const obrasFinalizadas = data.obras.filter(obra => obra.status === 'finalizada').length;
    const gastoTotal = data.compras.reduce((sum, compra) => sum + compra.custoTotal, 0);
    const materiaisComEstoqueBaixo = data.materiais.filter(
      material => material.estoque < material.estoqueMinimo
    ).length;
    const etapasCompletadas = data.etapas.filter(etapa => etapa.progresso === 100).length;
    const etapasTotal = data.etapas.length;
    const progressoMedio = etapasTotal > 0 
      ? data.etapas.reduce((sum, etapa) => sum + etapa.progresso, 0) / etapasTotal 
      : 0;

    return {
      totalObras,
      obrasEmAndamento,
      obrasFinalizadas,
      gastoTotal,
      materiaisComEstoqueBaixo,
      etapasCompletadas,
      etapasTotal,
      progressoMedio,
    };
  }, [filteredData]);

  // Dados para evolução da obra
  const evolucaoData = useMemo<EvolucaoObra[]>(() => {
    if (selectedObraId === 'all') {
      // Dados agregados de todas as obras
      const dadosAgregados = obras.slice(0, 6).map((obra, index) => ({
        data: `${index + 1}/12`,
        progresso: Math.min((index + 1) * 15, 100),
        obra: obra.nome
      }));
      return dadosAgregados;
    } else {
      // Dados específicos da obra selecionada
      const obraAtual = obras.find(obra => obra.id === selectedObraId);
      if (!obraAtual) return [];

      const etapasObra = etapas.filter(etapa => etapa.obraId === selectedObraId);
      const dadosEvolucao = etapasObra.slice(0, 6).map((etapa, index) => ({
        data: `${index + 1}/12`,
        progresso: etapa.progresso,
        obra: etapa.nome
      }));
      return dadosEvolucao;
    }
  }, [selectedObraId, obras, etapas]);

  // Dados para gastos por etapa
  const gastosData = useMemo<GastosPorEtapa[]>(() => {
    const data = filteredData;
    
    if (selectedObraId === 'all') {
      // Gastos por categoria de materiais (agregado por obra)
      const gastosPorCategoria: Record<string, number> = {};
      
      data.obras.forEach(obra => {
        const comprasObra = data.compras.filter(compra => compra.obraId === obra.id);
        comprasObra.forEach(compra => {
          compra.itens?.forEach(item => {
            const material = data.materiais.find(m => m.id === item.materialId);
            const categoria = material?.categoria || 'Outros';
            gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + item.precoTotal;
          });
          
          // Se não houver itens, usar categoria padrão
          if (!compra.itens || compra.itens.length === 0) {
            gastosPorCategoria['Outros'] = (gastosPorCategoria['Outros'] || 0) + compra.custoTotal;
          }
        });
      });
      
      const gastosPorCategoriaArray = Object.entries(gastosPorCategoria).map(([categoria, valor]) => ({
        etapa: categoria,
        valor,
        obra: 'Todas as Obras'
      }));
      
      return gastosPorCategoriaArray;
          } else {
        // Gastos por etapa da obra específica
        const obraAtual = data.obras[0];
        if (!obraAtual) return [];

        const etapasObra = data.etapas;
        const gastosPorEtapa = etapasObra.map(etapa => {
          // Calcular gastos baseado nas movimentações de estoque da etapa
          const movimentacoesEtapa = data.movimentacoes.filter(
            mov => mov.etapaId === etapa.id && mov.tipo === 'saida'
          );
          
          const gastoEtapa = movimentacoesEtapa.reduce((sum, mov) => {
            const material = data.materiais.find(m => m.id === mov.materialId);
            return sum + (material ? material.preco * mov.quantidade : 0);
          }, 0);
          
          // Se não houver movimentações, simular baseado no progresso
          const gastoEstimado = gastoEtapa > 0 ? gastoEtapa : (etapa.progresso / 100) * 50000;
          
          return {
            etapa: etapa.nome,
            valor: gastoEstimado,
            obra: obraAtual.nome
          };
        });
        
        return gastosPorEtapa;
      }
  }, [filteredData, selectedObraId]);

  // Dados para materiais mais consumidos
  const materiaisData = useMemo<MaterialMaisConsumido[]>(() => {
    const data = filteredData;
    
    const consumoMateriais = data.movimentacoes
      .filter(mov => mov.tipo === 'saida')
      .reduce((acc, mov) => {
        const material = data.materiais.find(m => m.id === mov.materialId);
        if (material) {
          const key = material.nome;
          acc[key] = (acc[key] || 0) + mov.quantidade;
        }
        return acc;
      }, {} as Record<string, number>);

    const materiaisConsumidos = Object.entries(consumoMateriais)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([material, quantidade]) => {
        const materialInfo = data.materiais.find(m => m.nome === material);
        const valor = materialInfo ? quantidade * materialInfo.preco : 0;
        return {
          material,
          quantidade,
          valor
        };
      });

    return materiaisConsumidos;
  }, [filteredData]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  // Informações da obra selecionada
  const obraAtual = selectedObraId !== 'all' ? obras.find(obra => obra.id === selectedObraId) : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header com seletor de obra */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {selectedObraId === 'all' 
                ? 'Visão geral de todas as obras' 
                : `Análise detalhada da obra: ${obraAtual?.nome || 'Obra não encontrada'}`
              }
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
        {selectedObraId !== 'all' && obraAtual && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>{obraAtual.nome}</span>
                <Badge variant={obraAtual.status === 'em-andamento' ? 'default' : 'secondary'}>
                  {obraAtual.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Informações detalhadas da obra selecionada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Responsável</div>
                  <div className="font-medium">{obraAtual.responsavel}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Local</div>
                  <div className="font-medium">{obraAtual.local}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Progresso</div>
                  <div className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Progress value={kpis.progressoMedio} className="h-2 w-20" />
                      <span>{Math.round(kpis.progressoMedio)}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Prazo</div>
                  <div className="font-medium flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(obraAtual.dataPrevisao).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <KPICards kpis={kpis} isObraEspecifica={selectedObraId !== 'all'} />

        {/* Resumo Rápido - apenas para visão geral */}
        {selectedObraId === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Obras Ativas</p>
                    <p className="text-2xl font-bold">{kpis.obrasEmAndamento}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Obras Finalizadas</p>
                    <p className="text-2xl font-bold">{kpis.obrasFinalizadas}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Estoque Baixo</p>
                    <p className="text-2xl font-bold">{kpis.materiaisComEstoqueBaixo}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvolutionChart data={evolucaoData} />
          <ExpenseChart data={gastosData} />
        </div>

        {/* Materiais mais consumidos */}
        <Card>
          <CardHeader>
            <CardTitle>Materiais Mais Consumidos</CardTitle>
            <CardDescription>
              Top 5 materiais {selectedObraId === 'all' ? 'em todas as obras' : 'na obra selecionada'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {materiaisData.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium">{item.material}</span>
                      <div className="text-sm text-gray-600">Quantidade: {item.quantidade}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">{formatCurrency(item.valor)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 