'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
  balance: {
    label: 'Saldo Projetado',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

type CashflowItem = {
  label?: string;
  type?: string;
  amount?: number;
  date: string;
  projectedBalance: number;
};

export function CashflowChart({ data }: { data: CashflowItem[] }) {
  const formatted = data.map((item) => ({
    ...item,
    date: item.date.slice(5), // MM-DD
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção de Caixa</CardTitle>
        <CardDescription>Evolução do saldo ao longo dos dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <LineChart data={formatted}>
  <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) =>
                `R$ ${Number(value) / 1000}k`
              }
            />
            <ChartTooltip
  content={({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const item = payload[0].payload;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md text-xs">
        <div className="font-semibold">{item.date}</div>
        <div>Saldo: {item.projectedBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
        {item.type !== 'current' && (
          <>
            <div className="mt-1 text-muted-foreground">{item.label}</div>
            <div className="text-red-500">
              -{item.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </>
        )}
      </div>
    );
  }}
/>
            <Line
              type="monotone"
              dataKey="projectedBalance"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
