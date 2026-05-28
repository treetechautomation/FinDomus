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

import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

type TrendPoint = {
  label: string;
  expenses: number;
  income: number;
  balance: number;
};

type Props = {
  data: TrendPoint[];
};

const chartConfig = {
  expenses: {
    label: 'Gastos',
    color: '#EF4444',
  },
  income: {
    label: 'Receitas',
    color: '#22C55E',
  },
  balance: {
    label: 'Saldo',
    color: '#00D0E6',
  },
} satisfies ChartConfig;

export function SpendingTrendChart({ data }: Props) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Tendência da Fatura</CardTitle>
        <CardDescription>
          Evolução diária de receitas, gastos e saldo no período atual
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <LineChart data={data} margin={{ left: 12, right: 12, top: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                Number(value).toLocaleString('pt-BR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                })
              }
            />

            <ChartTooltip
              cursor={false}
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

            <Line
              dataKey="expenses"
              type="monotone"
              stroke="var(--color-expenses)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              dataKey="income"
              type="monotone"
              stroke="var(--color-income)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              dataKey="balance"
              type="monotone"
              stroke="var(--color-balance)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
