'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Landmark } from 'lucide-react';
import { CalculatorField } from '@/components/finance/calculator-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function brl(v: number) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PoupancaSelicPage() {
  const [amount, setAmount] = useState('10000');
  const [selic, setSelic] = useState('10.5');
  const [years, setYears] = useState('1');

  const poupancaRate = Number(selic) > 8.5 ? 0.005 : (Number(selic) / 100 * 0.7) / 12;
  const selicRate = (Number(selic) / 100 * 0.9) / 12;

  function compound(rate: number) {
    let total = Number(amount);
    for (let i = 0; i < Number(years) * 12; i++) total *= 1 + rate;
    return total;
  }

  const poupanca = compound(poupancaRate);
  const tesouro = compound(selicRate);
  const diff = tesouro - poupanca;

  const data = useMemo(() => [
    { name: 'Poupança', value: poupanca },
    { name: 'SELIC estimada', value: tesouro },
  ], [poupanca, tesouro]);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-muted-foreground">Investimentos › Calculadoras</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Poupança vs SELIC</h1>
        <p className="text-muted-foreground">Compare cenários conservadores para tomada de decisão patrimonial.</p>
      </div>

      <Card className="border-primary/20 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> Parâmetros da comparação</CardTitle>
          <CardDescription>Simulação simplificada, sem considerar impostos, taxas ou marcação a mercado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <CalculatorField label="Valor aplicado" prefix="R$" value={amount} onChange={setAmount} />
          <CalculatorField label="SELIC anual estimada" suffix="%" value={selic} onChange={setSelic} />
          <CalculatorField label="Prazo" suffix="anos" value={years} onChange={setYears} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>Poupança</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{brl(poupanca)}</CardContent></Card>
        <Card className={tesouro > poupanca ? 'border-emerald-500/30' : ''}><CardHeader><CardTitle>SELIC estimada</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-emerald-500">{brl(tesouro)}</CardContent></Card>
        <Card className={diff > 0 ? 'border-emerald-500/30' : 'border-amber-500/40'}><CardHeader><CardTitle>Diagnóstico</CardTitle></CardHeader><CardContent className="text-sm">{diff > 0 ? `SELIC estimada supera a poupança em ${brl(diff)}.` : 'Poupança fica competitiva nesse cenário simplificado.'}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Comparativo visual</CardTitle><CardDescription>Resultado acumulado no prazo informado.</CardDescription></CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => brl(Number(v)).replace(',00', '')} />
              <Tooltip formatter={(v: any) => brl(Number(v))} />
              <Bar dataKey="value" fill="#38bdf8" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
