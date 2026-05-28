'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PiggyBank } from 'lucide-react';
import { CalculatorField } from '@/components/finance/calculator-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function brl(v: number) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AposentadoriaPage() {
  const [monthlyIncome, setMonthlyIncome] = useState('5000');
  const [currentAmount, setCurrentAmount] = useState('50000');
  const [targetAmount, setTargetAmount] = useState('1000000');
  const [investPercent, setInvestPercent] = useState('20');
  const [currentAge, setCurrentAge] = useState('30');
  const [retireAge, setRetireAge] = useState('65');
  const [annualRate, setAnnualRate] = useState('10');
  const [retiredMonthlyExpense, setRetiredMonthlyExpense] = useState('10000');
  const [result, setResult] = useState<any>(null);

  const years = Math.max(Number(retireAge) - Number(currentAge), 1);
  const monthlyContribution = Number(monthlyIncome || 0) * (Number(investPercent || 0) / 100);
  const desiredTarget = Number(targetAmount || 0);
  const estimatedTargetByExpense = Number(retiredMonthlyExpense || 0) * 300;

  const data = useMemo(() => {
    let total = Number(currentAmount || 0);
    const r = Number(annualRate || 0) / 100 / 12;

    return Array.from({ length: years + 1 }).map((_, year) => {
      if (year > 0) {
        for (let i = 0; i < 12; i++) {
          total = total * (1 + r) + monthlyContribution;
        }
      }

      return {
        age: Number(currentAge) + year,
        total,
      };
    });
  }, [currentAmount, annualRate, years, currentAge, monthlyContribution]);

  function calculate() {
    const r = Number(annualRate || 0) / 100 / 12;
    const n = years * 12;
    const projected = data[data.length - 1]?.total ?? 0;

    const neededMonthly =
      r > 0
        ? (desiredTarget - Number(currentAmount || 0) * Math.pow(1 + r, n)) /
          ((Math.pow(1 + r, n) - 1) / r)
        : (desiredTarget - Number(currentAmount || 0)) / n;

    setResult({
      years,
      monthlyContribution,
      projected,
      desiredTarget,
      estimatedTargetByExpense,
      neededMonthly: Math.max(neededMonthly, 0),
      additionalMonthlyNeeded: Math.max(neededMonthly - monthlyContribution, 0),
      gap: Math.max(desiredTarget - projected, 0),
      willReach: projected >= desiredTarget,
      contributionRisk: monthlyContribution > Number(monthlyIncome || 0) * 0.3,
    });
  }

  function clear() {
    setMonthlyIncome('5000');
    setCurrentAmount('50000');
    setTargetAmount('1000000');
    setInvestPercent('20');
    setCurrentAge('30');
    setRetireAge('65');
    setAnnualRate('10');
    setRetiredMonthlyExpense('10000');
    setResult(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-muted-foreground">Investimentos › Calculadoras</div>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight">
          <PiggyBank className="h-7 w-7 text-violet-400" />
          Simulador de aposentadoria
        </h1>
        <p className="text-muted-foreground">
          Planeje quanto precisa acumular, quanto deve aportar e se sua estratégia atual é sustentável.
        </p>
      </div>

      <Card className="border-primary/20 bg-card/70">
        <CardHeader>
          <CardTitle>Parâmetros da simulação</CardTitle>
          <CardDescription>
            Informe renda, patrimônio atual, meta, prazo e rentabilidade projetada.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-2">
          <CalculatorField accentClassName="text-violet-400" label="Quanto você ganha por mês?" prefix="R$" value={monthlyIncome} onChange={setMonthlyIncome} />
          <CalculatorField accentClassName="text-violet-400" label="Quanto você já tem investido?" prefix="R$" value={currentAmount} onChange={setCurrentAmount} />

          <CalculatorField accentClassName="text-violet-400" label="Com quanto de patrimônio você quer se aposentar?" prefix="R$" value={targetAmount} onChange={setTargetAmount} />
          <CalculatorField accentClassName="text-violet-400" label="Quantos % da sua renda você investe?" suffix="%" value={investPercent} onChange={setInvestPercent} />

          <CalculatorField accentClassName="text-violet-400" label="Qual sua idade atual?" suffix="anos" value={currentAge} onChange={setCurrentAge} />
          <CalculatorField accentClassName="text-violet-400" label="Com quantos anos você deseja se aposentar?" suffix="anos" value={retireAge} onChange={setRetireAge} />

          <CalculatorField accentClassName="text-violet-400" label="Sua rentabilidade total anual projetada" suffix="%" value={annualRate} onChange={setAnnualRate} />
          <CalculatorField accentClassName="text-violet-400" label="Quanto você pretende gastar por mês aposentado?" prefix="R$" value={retiredMonthlyExpense} onChange={setRetiredMonthlyExpense} />
        </CardContent>

        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button onClick={calculate} className="h-11 px-10">
            Calcular
          </Button>
          <Button onClick={clear} variant="outline" className="h-11 px-10">
            Limpar
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Meta informada</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{brl(result.desiredTarget)}</CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Meta sugerida por gasto</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{brl(result.estimatedTargetByExpense)}</CardContent>
          </Card>

          <Card className={result.willReach ? 'border-emerald-500/30' : 'border-destructive/40'}>
            <CardHeader><CardTitle>Patrimônio projetado</CardTitle></CardHeader>
            <CardContent className={result.willReach ? 'text-2xl font-bold text-emerald-500' : 'text-2xl font-bold text-destructive'}>
              {brl(result.projected)}
            </CardContent>
          </Card>

          <Card className="border-violet-500/30">
            <CardHeader><CardTitle>Aporte mensal atual</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-violet-400">{brl(result.monthlyContribution)}</CardContent>
          </Card>

          <Card className={result.additionalMonthlyNeeded > 0 ? 'border-amber-500/40' : 'border-emerald-500/30'}>
            <CardHeader><CardTitle>Aporte adicional necessário</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{brl(result.additionalMonthlyNeeded)}</CardContent>
          </Card>
        </div>
      )}

      {result && (
        <Card className={result.willReach ? 'border-emerald-500/30' : 'border-destructive/40'}>
          <CardHeader>
            <CardTitle>Diagnóstico patrimonial</CardTitle>
            <CardDescription>
              Análise baseada na renda, percentual investido, prazo e rentabilidade projetada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              Aporte atual estimado: <b>{brl(result.monthlyContribution)}</b> por mês.
            </div>

            {result.willReach ? (
              <div className="font-semibold text-emerald-500">
                ✅ No cenário informado, você atinge a meta patrimonial. Não há aporte adicional necessário.
              </div>
            ) : (
              <div className="font-semibold text-destructive">
                ⚠️ No cenário informado, faltariam {brl(result.gap)} para a meta. Aumente aporte, prazo ou reduza a meta.
              </div>
            )}

            {result.contributionRisk && (
              <div className="text-amber-500">
                ⚠️ O percentual investido é agressivo em relação à renda. Verifique se isso não compromete sua liquidez.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Curva até a aposentadoria</CardTitle>
          <CardDescription>Linha amarela representa a meta patrimonial informada.</CardDescription>
        </CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="age" />
              <YAxis tickFormatter={(v) => brl(Number(v)).replace(',00', '')} />
              <Tooltip formatter={(v: any) => brl(Number(v))} labelFormatter={(v) => `Idade ${v}`} />
              <ReferenceLine y={Number(targetAmount || 0)} stroke="#eab308" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="total" stroke="#a855f7" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
