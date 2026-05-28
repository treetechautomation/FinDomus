'use client';

import { useMemo, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Calculator, ShieldAlert, Target, TrendingUp } from 'lucide-react';

import { simulateCompound, generateChartData } from '@/core/finance/million';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const aportes = [50, 100, 200, 300, 400, 500, 1000, 2000, 3000, 5000, 10000];
const anos = [10, 15, 20, 25, 30, 35, 40];

function brl(value: number) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function onlyNumber(value: string) {
  return Number(value.replace(/\D/g, '')) / 100;
}

function percentMonthlyFromAnnual(annual: number) {
  return (Math.pow(1 + annual / 100, 1 / 12) - 1) * 100;
}

function WealthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border bg-background/95 p-4 text-xs shadow-xl">
      <div className="mb-3 text-base font-bold">Em {label} anos</div>
      <div className="space-y-1">
        {payload.map((item: any) => (
          <div key={item.dataKey} className="flex gap-2">
            <span style={{ color: item.color }} className="font-bold">
              {brl(Number(item.dataKey))}:
            </span>
            <span className="font-semibold">{brl(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrimeiroMilhaoPage() {
  const [initialInput, setInitialInput] = useState('1000000');
  const [targetInput, setTargetInput] = useState('100000000');
  const [rateInput, setRateInput] = useState('8');

  const [calculated, setCalculated] = useState({
    initial: 10000,
    target: 1000000,
    rate: 8,
  });

  const initial = onlyNumber(initialInput);
  const target = onlyNumber(targetInput);
  const rate = Number(rateInput.replace(',', '.')) || 0;
  const monthlyRate = percentMonthlyFromAnnual(rate);

  const chartData = useMemo(
    () =>
      generateChartData({
        initial: calculated.initial,
        rate: calculated.rate / 100,
      }),
    [calculated]
  );

  const bestAffordableScenario = useMemo(() => {
    for (const aporte of aportes) {
      for (const ano of anos) {
        const total = simulateCompound({
          initial: calculated.initial,
          monthly: aporte,
          rate: calculated.rate / 100,
          years: ano,
        });

        if (total >= calculated.target) {
          return { aporte, ano, total };
        }
      }
    }

    return null;
  }, [calculated]);

  function handleCalculate() {
    setCalculated({
      initial,
      target,
      rate,
    });
  }

  const colors = [
    '#22d3ee',
    '#5eead4',
    '#f5c16c',
    '#67e8f9',
    '#84cc16',
    '#fb923c',
    '#e11d48',
    '#a855f7',
    '#f59e0b',
    '#ec4899',
    '#ef4444',
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-muted-foreground">Investimentos › Calculadoras</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Primeiro Milhão</h1>
        <p className="text-muted-foreground">
          Simule quanto tempo seu patrimônio leva para atingir a meta desejada.
        </p>
      </div>

      <Card className="border-primary/20 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Parâmetros da simulação
          </CardTitle>
          <CardDescription>
            Modelo patrimonial com juros compostos. Use como referência estratégica, não como promessa de rentabilidade.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-primary">Rendimento anual</label>
            <div className="flex h-11 items-center rounded-md border bg-background">
              <span className="px-3 text-sm text-muted-foreground">%</span>
              <input
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full bg-transparent px-2 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-primary">Rendimento mensal</label>
            <div className="flex h-11 items-center rounded-md border bg-muted/40">
              <input
                value={monthlyRate.toFixed(2)}
                disabled
                className="w-full bg-transparent px-3 outline-none"
              />
              <span className="px-3 text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-primary">Valor inicial</label>
            <div className="flex h-11 items-center rounded-md border bg-background">
              <span className="px-3 text-sm text-muted-foreground">R$</span>
              <input
                value={brl(initial).replace('R$', '').trim()}
                onChange={(e) => setInitialInput(String(Math.round(onlyNumber(e.target.value) * 100)))}
                className="w-full bg-transparent px-2 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-primary">Valor desejado</label>
            <div className="flex h-11 items-center rounded-md border bg-background">
              <span className="px-3 text-sm text-muted-foreground">R$</span>
              <input
                value={brl(target).replace('R$', '').trim()}
                onChange={(e) => setTargetInput(String(Math.round(onlyNumber(e.target.value) * 100)))}
                className="w-full bg-transparent px-2 outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button onClick={handleCalculate} className="h-11 w-full">
              Calcular
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Meta patrimonial
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{brl(calculated.target)}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Patrimônio inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{brl(calculated.initial)}</CardContent>
        </Card>

        <Card className={bestAffordableScenario ? 'border-emerald-500/30' : 'border-destructive/40'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {bestAffordableScenario ? (
              <div>
                Com aportes de <b>{brl(bestAffordableScenario.aporte)}</b>, a meta pode ser atingida em cerca de{' '}
                <b>{bestAffordableScenario.ano} anos</b>.
              </div>
            ) : (
              <div className="text-destructive">
                Nenhum cenário da tabela atinge a meta. Será necessário aumentar aporte, prazo ou rentabilidade.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Tabela de evolução patrimonial</CardTitle>
          <CardDescription>
            Verde indica que o cenário ultrapassa a meta desejada.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left">Aportes</th>
                {anos.map((ano) => (
                  <th key={ano} className="py-3 text-left">{ano} anos</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aportes.map((aporte) => (
                <tr key={aporte} className="border-b border-border/50">
                  <td className="py-3 font-bold">{brl(aporte)}</td>
                  {anos.map((ano) => {
                    const total = simulateCompound({
                      initial: calculated.initial,
                      monthly: aporte,
                      rate: calculated.rate / 100,
                      years: ano,
                    });

                    return (
                      <td
                        key={ano}
                        className={total >= calculated.target ? 'py-3 font-bold text-emerald-500' : 'py-3 font-semibold'}
                      >
                        {brl(total)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Curva de crescimento por aporte</CardTitle>
          <CardDescription>
            Comparação visual entre diferentes aportes mensais ao longo do tempo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="year" tickFormatter={(v) => `${v} anos`} />
                <YAxis tickFormatter={(v) => brl(Number(v)).replace(',00', '')} />
                <Tooltip content={<WealthTooltip />} />
                <ReferenceLine y={calculated.target} stroke="#eab308" strokeDasharray="4 4" />

                {aportes.map((aporte, index) => (
                  <Line
                    key={aporte}
                    type="monotone"
                    dataKey={String(aporte)}
                    stroke={colors[index]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
