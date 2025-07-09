'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GastosPorEtapa } from '@/types';

interface ExpenseChartProps {
  data: GastosPorEtapa[];
}

export default function ExpenseChart({ data }: ExpenseChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Etapa</CardTitle>
        <CardDescription>
          Distribuição de custos por etapa das obras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="etapa" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              labelFormatter={(value) => `Etapa: ${value}`}
              formatter={(value) => [formatCurrency(Number(value)), 'Gasto']}
            />
            <Bar 
              dataKey="valor" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              animationDuration={0}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 