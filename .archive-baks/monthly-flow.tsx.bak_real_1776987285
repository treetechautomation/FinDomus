'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  income: {
    label: 'Receitas',
    color: 'hsl(var(--chart-2))',
  },
  expenses: {
    label: 'Despesas',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

type MonthlyFlowItem = {
  month: string;
  income: number;
  expenses: number;
};

export function MonthlyFlow({ data }: { data: MonthlyFlowItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo Mensal</CardTitle>
        <CardDescription>Receitas e despesas reais dos últimos 6 meses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickFormatter={(value) => `R$ ${Number(value) / 1000}k`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
