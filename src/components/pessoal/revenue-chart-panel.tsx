'use client';

import { useEffect, useState } from 'react';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PieChart, Pie, Cell } from 'recharts';

type Props = {
  data: any[];
};

const DEFAULT_COLORS = [
  '#22C55E',
  '#00D0E6',
  '#3B82F6',
  '#A855F7',
  '#F59E0B',
  '#EF4444',
];

const STORAGE_KEY = 'revenueTypeColors';

export function RevenueChartPanel({ data }: Props) {
  const [colors, setColors] = useState<Record<string, string>>({});

  const rows = data
    .map((item) => ({
      name: String(item.name || item.category || 'Receita'),
      value: Number(item.value || 0),
    }))
    .filter((item) => item.value > 0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setColors(JSON.parse(saved));
    } catch {
      setColors({});
    }
  }, []);

  function getColor(name: string, index: number) {
    return colors[name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  }

  function updateColor(name: string, color: string) {
    const next = {
      ...colors,
      [name]: color,
    };

    setColors(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const chartConfig: ChartConfig = {
    value: { label: 'Receita' },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Receitas por Tipo</CardTitle>
          <CardDescription>
            Distribuição entre recebimentos e serviços prestados.
          </CardDescription>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Editar cores
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar cores das receitas</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {rows.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>

                  <input
                    type="color"
                    value={getColor(item.name, index)}
                    onChange={(event) =>
                      updateColor(item.name, event.target.value)
                    }
                    className="h-9 w-14 cursor-pointer rounded-md border bg-background"
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        <ChartContainer config={chartConfig} className="h-[320px] w-full max-w-[480px]">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: any, name: any) => [
                    Number(value).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }),
                    String(name || 'Categoria'),
                  ]}
                />
              }
            />

            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius={90}
              outerRadius={140}
            >
              {rows.map((entry, index) => (
                <Cell key={entry.name} fill={getColor(entry.name, index)} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="w-full space-y-2">
          {rows.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg border bg-card/40 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getColor(item.name, index) }}
                />
                {item.name}
              </span>

              <strong>
                {Number(item.value).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
