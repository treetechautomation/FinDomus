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

const chartConfig = {
  value: {
    label: 'Valor',
  },
} satisfies ChartConfig;

type AllocationItem = {
  name: string;
  value: number;
  fill: string;
};

export function ConsolidatedBalance({ data = [] }: { data?: AllocationItem[] }) {
  const hasData = data.length > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Distribuição por Conta</CardTitle>
        <CardDescription>
          Distribuição real do saldo por tipo de conta.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center pb-0">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Cadastre contas e lançamentos para visualizar a distribuição.
          </div>
        )}
      </CardContent>

      {hasData && (
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground gap-4 flex-wrap">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              {entry.name}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
