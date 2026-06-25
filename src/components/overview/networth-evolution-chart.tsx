'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
  ChartConfig,
} from '@/components/ui/chart';
import { formatCurrency } from '@/core/finance/formatters';

const chartConfig = {
  netWorth: {
    label: 'Patrimônio Líquido',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type NetWorthHistoryItem = {
  monthKey: string;
  label: string;
  netWorth: number;
  assets: number;
  liabilities: number;
};

export function NetworthEvolutionChart({ data }: { data: NetWorthHistoryItem[] }) {
  const hasData = data && data.length > 0;

  return (
    <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.02)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-base">
          📈 EVOLUÇÃO PATRIMONIAL
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Histórico temporal consolidado do seu patrimônio líquido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="netWorthGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-800/50" />
              <XAxis 
                dataKey="label" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
                tick={{ fill: '#71717a', fontSize: 11 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickFormatter={(value) =>
                  `R$ ${Number(value) / 1000}k`
                }
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl text-xs space-y-2 text-zinc-300 backdrop-blur-md">
                      <div className="font-bold text-white border-b border-slate-800 pb-1">{item.label}</div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-8">
                          <span className="text-zinc-400">Ativos:</span>
                          <span className="font-semibold text-emerald-450">{formatCurrency(item.assets)}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="text-zinc-400">Passivos:</span>
                          <span className="font-semibold text-rose-450">{formatCurrency(item.liabilities)}</span>
                        </div>
                        <div className="flex justify-between gap-8 border-t border-slate-800 pt-1 font-bold text-white">
                          <span className="text-cyan-400">Patrimônio Líquido:</span>
                          <span className="text-cyan-400">{formatCurrency(item.netWorth)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#netWorthGlow)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Sem dados históricos de fechamentos suficientes. Feche competências mensais para visualizar a evolução patrimonial.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
