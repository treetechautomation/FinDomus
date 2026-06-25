'use client';

import { useMemo, useState, useEffect } from 'react';
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
import { Calculator, ShieldAlert, Target, TrendingUp, AlertCircle, HelpCircle, Coins } from 'lucide-react';

import { simulateCompound, generateChartData } from '@/core/finance/million';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { getInvestments } from '@/services/firestore/investments';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getInvestmentYields } from '@/services/firestore/yields';
import { calculateFinancialCore } from '@/core/finance/financial-core';

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
  const { user } = useAuth();
  const [loadingRealData, setLoadingRealData] = useState(false);
  const [realYieldsAvg, setRealYieldsAvg] = useState<number | null>(null);
  const [hasLoadedRealData, setHasLoadedRealData] = useState(false);

  const [initialInput, setInitialInput] = useState('1000000');
  const [targetInput, setTargetInput] = useState('100000000');
  const [rateInput, setRateInput] = useState('8');

  const [calculated, setCalculated] = useState({
    initial: 10000,
    target: 1000000,
    rate: 8,
  });

  useEffect(() => {
    if (!user?.uid) return;

    setLoadingRealData(true);
    async function loadRealData() {
      try {
        const [investmentsData, accountsData, liabilitiesData, yieldsData] = await Promise.all([
          getInvestments(user!.uid),
          getAccountsWithBalance(user!.uid),
          getLiabilities(user!.uid),
          getInvestmentYields(user!.uid),
        ]);

        const financial = calculateFinancialCore({
          accounts: accountsData || [],
          investments: investmentsData || [],
          liabilities: liabilitiesData || [],
        });

        const realNetWorth = financial.netWorth || 0;
        
        if (realNetWorth > 0) {
          const roundedNetWorth = Math.round(realNetWorth);
          setInitialInput(String(roundedNetWorth * 100));
          setCalculated((c) => ({
            ...c,
            initial: roundedNetWorth,
          }));
          setHasLoadedRealData(true);
        }

        // Média de proventos 12M
        const today = new Date();
        const last12Months = Array.from({ length: 12 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        });

        let totalYields12M = 0;
        (yieldsData || []).forEach((y) => {
          if (y.date && y.amount && last12Months.some((ym) => y.date.startsWith(ym))) {
            totalYields12M += Number(y.amount) || 0;
          }
        });
        setRealYieldsAvg(totalYields12M / 12);
      } catch (err) {
        console.error('Erro ao carregar dados reais na calculadora:', err);
      } finally {
        setLoadingRealData(false);
      }
    }

    loadRealData();
  }, [user?.uid]);

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

  const gap = Math.max(calculated.target - calculated.initial, 0);

  function calculateNeededMonthlyContribution(initial: number, target: number, annualRate: number, years: number) {
    const r = (Math.pow(1 + annualRate / 100, 1 / 12) - 1);
    const n = years * 12;
    if (r <= 0) return (target - initial) / n;
    
    const compoundFactor = Math.pow(1 + r, n);
    const annuityFactor = (compoundFactor - 1) / r;
    const needed = (target - initial * compoundFactor) / annuityFactor;
    return Math.max(needed, 0);
  }

  const neededConservador = calculateNeededMonthlyContribution(calculated.initial, calculated.target, 5, 15);
  const neededModerado = calculateNeededMonthlyContribution(calculated.initial, calculated.target, 9, 15);
  const neededAgressivo = calculateNeededMonthlyContribution(calculated.initial, calculated.target, 13, 15);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/5 bg-slate-950/20 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              <Target className="h-4 w-4 text-primary" />
              Meta Desejada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white tracking-tight">{brl(calculated.target)}</div>
            <p className="text-[10px] text-zinc-500 font-light mt-1">Valor alvo definido</p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-950/20 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Patrimônio Inicial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white tracking-tight">{brl(calculated.initial)}</div>
            <p className="text-[10px] text-zinc-500 font-light mt-1">
              {hasLoadedRealData ? "Pré-carregado do seu patrimônio real" : "Valor manual informado"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-950/20 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              <Coins className="h-4 w-4 text-amber-400" />
              Falta Guardar (Gap)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-300 tracking-tight">{brl(gap)}</div>
            <p className="text-[10px] text-zinc-500 font-light mt-1">
              {calculated.target > 0 ? `${((calculated.initial / calculated.target) * 100).toFixed(1)}%` : '0%'} já acumulado
            </p>
          </CardContent>
        </Card>

        <Card className={bestAffordableScenario ? 'border-emerald-500/30 bg-slate-950/20 backdrop-blur-xl' : 'border-destructive/40 bg-slate-950/20 backdrop-blur-xl'}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-300 font-light">
            {bestAffordableScenario ? (
              <div>
                Com aportes de <span className="font-semibold text-white">{brl(bestAffordableScenario.aporte)}</span>, a meta pode ser atingida em cerca de <span className="font-semibold text-white">{bestAffordableScenario.ano} anos</span>.
              </div>
            ) : (
              <div className="text-destructive font-medium">
                Nenhum cenário padrão atinge a meta. Aumente aporte ou prazo.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-bold tracking-tight text-white mb-1 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          Simulador de Cenários FIRE (Meta em 15 Anos)
        </h2>
        <p className="text-xs text-zinc-500 font-light mb-4">
          Aporte mensal necessário para alcançar o primeiro milhão (ou sua meta) em 15 anos com juros compostos.
          {realYieldsAvg !== null && realYieldsAvg > 0 && (
            <span className="text-cyan-400 ml-1 font-normal">
              Seus proventos reais médios de {brl(realYieldsAvg)}/mês podem cobrir parte desse esforço!
            </span>
          )}
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-amber-500/20 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-zinc-400">Cenário Conservador (5% a.a.)</CardTitle>
              <CardDescription className="text-[10px] text-zinc-500">Alocação defensiva em renda fixa pós-fixada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white tracking-tight">{brl(neededConservador)}/mês</div>
              <p className="text-[10px] text-zinc-500 font-light mt-1">Aporte mensal necessário por 15 anos</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-zinc-400">Cenário Moderado (9% a.a.)</CardTitle>
              <CardDescription className="text-[10px] text-zinc-500">Carteira balanceada (FIIs, Selic e Ações)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">{brl(neededModerado)}/mês</div>
              <p className="text-[10px] text-zinc-500 font-light mt-1">Aporte mensal necessário por 15 anos</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-500/20 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/40 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-zinc-400">Cenário Agressivo (13% a.a.)</CardTitle>
              <CardDescription className="text-[10px] text-zinc-500">Foco em ações de crescimento, FIIs e cripto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-cyan-400 tracking-tight">{brl(neededAgressivo)}/mês</div>
              <p className="text-[10px] text-zinc-500 font-light mt-1">Aporte mensal necessário por 15 anos</p>
            </CardContent>
          </Card>
        </div>
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
