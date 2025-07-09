'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EvolucaoObra } from '@/types';

interface EvolutionChartProps {
  data: EvolucaoObra[];
}

export default function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução das Obras</CardTitle>
        <CardDescription>
          Progresso das obras ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="data" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              labelFormatter={(value) => `Data: ${value}`}
              formatter={(value) => [`${value}%`, 'Progresso']}
            />
            <Line 
              type="monotone" 
              dataKey="progresso" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', strokeWidth: 2 }}
              animationDuration={0}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 