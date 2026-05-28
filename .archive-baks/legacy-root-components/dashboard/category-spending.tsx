'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
const categorySpending: any[] = [];

const chartConfig = {
  spent: {
    label: 'Gasto',
  },
  Alimentação: {
    label: 'Alimentação',
  },
  Transporte: {
    label: 'Transporte',
  },
  Moradia: {
    label: 'Moradia',
  },
  Lazer: {
    label: 'Lazer',
  },
  Outros: {
    label: 'Outros',
  },
} satisfies ChartConfig;

export function CategorySpending() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Resumo por Categoria</CardTitle>
        <CardDescription>
          Distribuição de despesas do mês por categoria.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={categorySpending}
              dataKey="spent"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              {categorySpending.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground gap-4 flex-wrap">
        {categorySpending.map((entry) => (
          <div key={entry.category} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            {entry.category}
          </div>
        ))}
      </div>
    </Card>
  );
}
