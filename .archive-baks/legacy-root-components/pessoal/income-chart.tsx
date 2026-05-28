'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';

const COLORS = [
  '#22C55E',
  '#00D0E6',
  '#3B82F6',
  '#A855F7',
  '#F59E0B',
  '#EF4444',
];

export function IncomeChart({ data }: { data: any[] }) {
  const chartConfig: ChartConfig = {
    value: { label: 'Receita' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas por Origem</CardTitle>
      </CardHeader>

      <CardContent className="flex justify-center">
        <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[420px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: any) =>
                    Number(value).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })
                  }
                />
              }
            />

            <Pie data={data} dataKey="value" nameKey="name" outerRadius={120}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
