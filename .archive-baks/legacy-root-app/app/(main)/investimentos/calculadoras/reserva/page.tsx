'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shield } from 'lucide-react';
import { CalculatorField } from '@/components/finance/calculator-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function brl(v: number) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ReservaPage() {
  const [monthlyExpenses, setMonthlyExpenses] = useState('4000');
  const [months, setMonths] = useState('6');
  const [currentReserve, setCurrentReserve] = useState('0');

  const target = Number(monthlyExpenses) * Number(months);
  const gap = Math.max(target - Number(currentReserve), 0);
  const coverage = Number(monthlyExpenses) > 0 ? Number(currentReserve) / Number(monthlyExpenses) : 0;

  const data = useMemo(() => [
    { name: 'Atual', value: Number(currentReserve) },
    { name: 'Ideal', value: target },
  ], [currentReserve, target]);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-muted-foreground">Investimentos › Calculadoras</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Reserva de emergência</h1>
        <p className="text-muted-foreground">Calcule a proteção financeira necessária para atravessar instabilidades.</p>
      </div>

      <Card className="border-primary/20 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Parâmetros da reserva</CardTitle>
          <CardDescription>Uma reserva saudável costuma cobrir de 6 a 12 meses de gastos essenciais.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <CalculatorField label="Gasto mensal" prefix="R$" value={monthlyExpenses} onChange={setMonthlyExpenses} />
          <CalculatorField label="Meses de cobertura" suffix="meses" value={months} onChange={setMonths} />
          <CalculatorField label="Reserva atual" prefix="R$" value={currentReserve} onChange={setCurrentReserve} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>Reserva ideal</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{brl(target)}</CardContent></Card>
        <Card className={gap > 0 ? 'border-amber-500/40' : 'border-emerald-500/30'}><CardHeader><CardTitle>Falta guardar</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{brl(gap)}</CardContent></Card>
        <Card className={gap > 0 ? 'border-amber-500/40' : 'border-emerald-500/30'}><CardHeader><CardTitle>Diagnóstico</CardTitle></CardHeader><CardContent className={gap > 0 ? 'text-sm text-amber-500' : 'text-sm text-emerald-500'}>{gap > 0 ? `Sua reserva cobre ${coverage.toFixed(1)} meses. Ainda abaixo do alvo.` : 'Reserva adequada para o objetivo informado.'}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Atual vs ideal</CardTitle><CardDescription>Comparação direta da proteção disponível.</CardDescription></CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => brl(Number(v)).replace(',00', '')} />
              <Tooltip formatter={(v: any) => brl(Number(v))} />
              <Bar dataKey="value" fill="#f59e0b" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
