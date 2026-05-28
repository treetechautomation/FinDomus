'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { CalculatorField } from '@/components/finance/calculator-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function brl(v: number) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function JurosCompostosPage() {
  const [initial, setInitial] = useState('1000');
  const [monthly, setMonthly] = useState('300');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState<number | null>(null);

  const data = useMemo(() => {
    let total = Number(initial || 0);
    const r = Number(rate || 0) / 100 / 12;
    return Array.from({ length: Number(years || 0) + 1 }).map((_, year) => {
      if (year > 0) for (let i = 0; i < 12; i++) total = total * (1 + r) + Number(monthly || 0);
      return { year, total };
    });
  }, [initial, monthly, rate, years]);

  function calculate() {
    setResult(data[data.length - 1]?.total ?? 0);
  }

  const gain = result !== null ? result - Number(initial || 0) - Number(monthly || 0) * Number(years || 0) * 12 : 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-muted-foreground">Investimentos › Calculadoras</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Juros compostos</h1>
        <p className="text-muted-foreground">Simule crescimento patrimonial com aporte mensal, taxa anual e prazo.</p>
      </div>

      <Card className="border-primary/20 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Parâmetros da simulação</CardTitle>
          <CardDescription>Modelo patrimonial com reinvestimento de juros.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-5">
          <CalculatorField label="Valor inicial" prefix="R$" value={initial} onChange={setInitial} />
          <CalculatorField label="Aporte mensal" prefix="R$" value={monthly} onChange={setMonthly} />
          <CalculatorField label="Taxa anual" suffix="%" value={rate} onChange={setRate} />
          <CalculatorField label="Prazo" suffix="anos" value={years} onChange={setYears} />
          <div className="flex items-end"><Button onClick={calculate} className="h-11 w-full">Calcular</Button></div>
        </CardContent>
      </Card>

      {result !== null && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-emerald-500/30"><CardHeader><CardTitle>Valor futuro</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-emerald-500">{brl(result)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Ganho estimado</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{brl(gain)}</CardContent></Card>
          <Card className={gain > 0 ? 'border-emerald-500/30' : 'border-amber-500/40'}><CardHeader><CardTitle>Diagnóstico</CardTitle></CardHeader><CardContent className="text-sm">{gain > 0 ? 'Crescimento saudável com efeito relevante dos juros compostos.' : 'O prazo ou aporte ainda está baixo para gerar ganho expressivo.'}</CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Curva de evolução</CardTitle><CardDescription>Evolução ano a ano do patrimônio estimado.</CardDescription></CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="year" tickFormatter={(v) => `${v} anos`} />
              <YAxis tickFormatter={(v) => brl(Number(v)).replace(',00', '')} />
              <Tooltip formatter={(v: any) => brl(Number(v))} labelFormatter={(v) => `${v} anos`} />
              <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
