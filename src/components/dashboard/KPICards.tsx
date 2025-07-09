'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DashboardKPIs } from '@/types';

interface KPICardsProps {
  kpis: DashboardKPIs;
  isObraEspecifica?: boolean;
}

export default function KPICards({ kpis, isObraEspecifica = false }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // KPIs para obra específica
  const kpiDataObraEspecifica = [
    {
      title: 'Total de Etapas',
      value: kpis.etapasTotal,
      description: 'Etapas da obra',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Etapas em Andamento',
      value: kpis.etapasTotal - kpis.etapasCompletadas,
      description: 'Etapas ativas',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Etapas Concluídas',
      value: kpis.etapasCompletadas,
      description: 'Etapas finalizadas',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Gasto da Obra',
      value: formatCurrency(kpis.gastoTotal),
      description: 'Investimento na obra',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // KPIs para visão geral (todas as obras)
  const kpiDataGeral = [
    {
      title: 'Total de Obras',
      value: kpis.totalObras,
      description: 'Obras cadastradas',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Obras em Andamento',
      value: kpis.obrasEmAndamento,
      description: 'Atualmente ativas',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Obras Finalizadas',
      value: kpis.obrasFinalizadas,
      description: 'Concluídas com sucesso',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Gasto Total',
      value: formatCurrency(kpis.gastoTotal),
      description: 'Investimento total',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const kpiData = isObraEspecifica ? kpiDataObraEspecifica : kpiDataGeral;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {/* Card de Progresso das Etapas */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progresso das Etapas
          </CardTitle>
          <CardDescription>
            {kpis.etapasCompletadas} de {kpis.etapasTotal} etapas concluídas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={kpis.progressoMedio} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso médio: {kpis.progressoMedio.toFixed(1)}%</span>
              <span>{kpis.etapasCompletadas}/{kpis.etapasTotal}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Alertas de Estoque */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Estoque
          </CardTitle>
          <CardDescription>
            Materiais com estoque baixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-red-600">
              {kpis.materiaisComEstoqueBaixo}
            </div>
            <Badge variant={kpis.materiaisComEstoqueBaixo > 0 ? 'destructive' : 'secondary'}>
              {kpis.materiaisComEstoqueBaixo > 0 ? 'Atenção' : 'OK'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {kpis.materiaisComEstoqueBaixo > 0 
              ? 'Reposição necessária' 
              : 'Todos os materiais com estoque adequado'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 