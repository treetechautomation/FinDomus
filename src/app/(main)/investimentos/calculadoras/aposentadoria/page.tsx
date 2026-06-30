'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PiggyBank, Sparkles, RefreshCw, HelpCircle, Save, Trash2, Split, Check } from 'lucide-react';
import { CalculatorField } from '@/components/finance/calculator-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';
import { formatCurrencyBRL, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';
import { calculateRetirement } from '@/core/finance/retirement';

type SavedSim = {
  id: string;
  name: string;
  date: string;
  monthlyIncome: string;
  currentAmount: string;
  targetAmount: string;
  investPercent: string;
  currentAge: string;
  retireAge: string;
  annualRate: string;
  retiredMonthlyExpense: string;
  inssContribution: string;
};

export default function AposentadoriaPage() {
  const [useRealData, setUseRealData] = useState(false);
  const [kernelData, setKernelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cenário A
  const [monthlyIncomeStr, setMonthlyIncomeStr] = useState('5.000,00');
  const [currentAmountStr, setCurrentAmountStr] = useState('50.000,00');
  const [targetAmountStr, setTargetAmountStr] = useState('1.000,000,00');
  const [investPercentStr, setInvestPercentStr] = useState('20');
  const [currentAgeStr, setCurrentAgeStr] = useState('30');
  const [retireAgeStr, setRetireAgeStr] = useState('65');
  const [annualRateStr, setAnnualRateStr] = useState('9,5');
  const [retiredMonthlyExpenseStr, setRetiredMonthlyExpenseStr] = useState('4.000,00');
  const [inssContributionStr, setInssContributionStr] = useState('0,00');

  // Cenário B
  const [isComparing, setIsComparing] = useState(false);
  const [monthlyIncomeStrB, setMonthlyIncomeStrB] = useState('5.000,00');
  const [currentAmountStrB, setCurrentAmountStrB] = useState('50.000,00');
  const [targetAmountStrB, setTargetAmountStrB] = useState('1.000.000,00');
  const [investPercentStrB, setInvestPercentStrB] = useState('20');
  const [currentAgeStrB, setCurrentAgeStrB] = useState('30');
  const [retireAgeStrB, setRetireAgeStrB] = useState('65');
  const [annualRateStrB, setAnnualRateStrB] = useState('9,5');
  const [retiredMonthlyExpenseStrB, setRetiredMonthlyExpenseStrB] = useState('4.000,00');
  const [inssContributionStrB, setInssContributionStrB] = useState('0,00');

  // Historico LocalStorage
  const [savedSims, setSavedSims] = useState<SavedSim[]>([]);
  const [simName, setSimName] = useState('');

  // Carregar dados reais do kernel
  const loadKernelData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = auth.currentUser ? await getIdToken(auth.currentUser) : null;
      if (!token) {
        throw new Error('Usuário não autenticado no Firebase.');
      }
      const res = await fetch('/api/kernel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Erro ao carregar dados do Kernel.');
      }
      const data = await res.json();
      setKernelData(data);

      if (data) {
        setMonthlyIncomeStr(formatCurrencyInput(data.monthlyIncome));
        setCurrentAmountStr(formatCurrencyInput(data.netWorth));
        setRetiredMonthlyExpenseStr(formatCurrencyInput(data.monthlyExpenses));
        if (data.wealthProfile?.age) {
          setCurrentAgeStr(String(data.wealthProfile.age));
        }
        
        // Sugestão de meta baseada na regra de 4% sobre gastos mensais
        const suggestedTarget = data.monthlyExpenses * 12 / 0.04;
        setTargetAmountStr(formatCurrencyInput(suggestedTarget || 1000000));
        setUseRealData(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao sincronizar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('findomus_sims_retire');
    if (stored) {
      try {
        setSavedSims(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
    loadKernelData();
  }, []);

  const handleToggleRealData = (checked: boolean) => {
    setUseRealData(checked);
    if (checked && kernelData) {
      setMonthlyIncomeStr(formatCurrencyInput(kernelData.monthlyIncome));
      setCurrentAmountStr(formatCurrencyInput(kernelData.netWorth));
      setRetiredMonthlyExpenseStr(formatCurrencyInput(kernelData.monthlyExpenses));
      if (kernelData.wealthProfile?.age) {
        setCurrentAgeStr(String(kernelData.wealthProfile.age));
      }
      const suggestedTarget = kernelData.monthlyExpenses * 12 / 0.04;
      setTargetAmountStr(formatCurrencyInput(suggestedTarget || 1000000));
    }
  };

  // Salvar Cenário
  const handleSaveSim = () => {
    if (!simName.trim()) return;
    const newSim: SavedSim = {
      id: Math.random().toString(36).substring(2, 9),
      name: simName,
      date: new Date().toLocaleDateString('pt-BR'),
      monthlyIncome: monthlyIncomeStr,
      currentAmount: currentAmountStr,
      targetAmount: targetAmountStr,
      investPercent: investPercentStr,
      currentAge: currentAgeStr,
      retireAge: retireAgeStr,
      annualRate: annualRateStr,
      retiredMonthlyExpense: retiredMonthlyExpenseStr,
      inssContribution: inssContributionStr,
    };
    const updated = [newSim, ...savedSims];
    setSavedSims(updated);
    localStorage.setItem('findomus_sims_retire', JSON.stringify(updated));
    setSimName('');
  };

  // Excluir cenário
  const handleDeleteSim = (id: string) => {
    const updated = savedSims.filter((s) => s.id !== id);
    setSavedSims(updated);
    localStorage.setItem('findomus_sims_retire', JSON.stringify(updated));
  };

  // Restaurar cenário
  const handleLoadSim = (sim: SavedSim) => {
    setMonthlyIncomeStr(sim.monthlyIncome);
    setCurrentAmountStr(sim.currentAmount);
    setTargetAmountStr(sim.targetAmount);
    setInvestPercentStr(sim.investPercent);
    setCurrentAgeStr(sim.currentAge);
    setRetireAgeStr(sim.retireAge);
    setAnnualRateStr(sim.annualRate);
    setRetiredMonthlyExpenseStr(sim.retiredMonthlyExpense);
    if (sim.inssContribution) setInssContributionStr(sim.inssContribution);
    setUseRealData(false);
  };

  // Fórmulas Cenário A
  const monthlyIncome = parseCurrencyInput(monthlyIncomeStr);
  const currentAmount = parseCurrencyInput(currentAmountStr);
  const investPercent = Number(investPercentStr) || 0;
  const currentAge = Number(currentAgeStr) || 30;
  const retireAge = Number(retireAgeStr) || 65;
  const annualRate = Number(annualRateStr.replace(',', '.')) / 100;
  const retiredMonthlyExpense = parseCurrencyInput(retiredMonthlyExpenseStr);
  const inssContribution = parseCurrencyInput(inssContributionStr);

  const years = Math.max(retireAge - currentAge, 1);
  const monthlyContribution = monthlyIncome * (investPercent / 100);

  // Regra dos 4%: Target ideal = Gasto Mensal Aposentado * 12 / 0.04
  // Se houver INSS, subtrai o INSS da despesa antes de projetar
  const targetExpensesForRule = Math.max(0, retiredMonthlyExpense - inssContribution);
  const suggestedTargetAmount = targetExpensesForRule * 12 / 0.04;
  const finalTargetAmount = parseCurrencyInput(targetAmountStr) - (inssContribution * 12 / 0.04);

  const resultA = useMemo(() => {
    return calculateRetirement({
      currentAmount,
      monthlyContribution,
      annualRate,
      years,
      targetAmount: Math.max(0, finalTargetAmount),
    });
  }, [currentAmount, monthlyContribution, annualRate, years, finalTargetAmount]);

  // Fórmulas Cenário B
  const monthlyIncomeB = parseCurrencyInput(monthlyIncomeStrB);
  const currentAmountB = parseCurrencyInput(currentAmountStrB);
  const investPercentB = Number(investPercentStrB) || 0;
  const currentAgeB = Number(currentAgeStrB) || 30;
  const retireAgeB = Number(retireAgeStrB) || 65;
  const annualRateB = Number(annualRateStrB.replace(',', '.')) / 100;
  const retiredMonthlyExpenseB = parseCurrencyInput(retiredMonthlyExpenseStrB);
  const inssContributionB = parseCurrencyInput(inssContributionStrB);

  const yearsB = Math.max(retireAgeB - currentAgeB, 1);
  const monthlyContributionB = monthlyIncomeB * (investPercentB / 100);
  const finalTargetAmountB = parseCurrencyInput(targetAmountStrB) - (inssContributionB * 12 / 0.04);

  const resultB = useMemo(() => {
    return calculateRetirement({
      currentAmount: currentAmountB,
      monthlyContribution: monthlyContributionB,
      annualRate: annualRateB,
      years: yearsB,
      targetAmount: Math.max(0, finalTargetAmountB),
    });
  }, [currentAmountB, monthlyContributionB, annualRateB, yearsB, finalTargetAmountB]);

  // Gráfico Evolução
  const chartData = useMemo(() => {
    const maxYears = Math.max(years, isComparing ? yearsB : years);
    const rA = annualRate / 12;
    const rB = annualRateB / 12;

    return Array.from({ length: maxYears + 1 }).map((_, year) => {
      let totalA = currentAmount;
      if (year > 0 && year <= years) {
        totalA = currentAmount * Math.pow(1 + rA, year * 12) +
          monthlyContribution * ((Math.pow(1 + rA, year * 12) - 1) / rA);
      } else if (year > years) {
        totalA = resultA.futureValue;
      }

      let totalB = currentAmountB;
      if (isComparing) {
        if (year > 0 && year <= yearsB) {
          totalB = currentAmountB * Math.pow(1 + rB, year * 12) +
            monthlyContributionB * ((Math.pow(1 + rB, year * 12) - 1) / rB);
        } else if (year > yearsB) {
          totalB = resultB.futureValue;
        }
      }

      return {
        age: currentAge + year,
        'Cenário A': Math.round(totalA),
        ...(isComparing ? { 'Cenário B': Math.round(totalB) } : {}),
      };
    });
  }, [currentAmount, monthlyContribution, annualRate, years, currentAge, currentAmountB, monthlyContributionB, annualRateB, yearsB, isComparing, resultA, resultB]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">Investimentos › Calculadoras</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            <PiggyBank className="h-7 w-7 text-violet-500" />
            Aposentadoria
          </h1>
          <p className="text-zinc-400">Planeje sua independência financeira usando a regra de rentabilidade segura (4% a.a.).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white"
            onClick={loadKernelData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button
            variant="outline"
            className={`border-zinc-800 bg-zinc-950/40 ${isComparing ? 'text-amber-500 border-amber-500/20' : 'text-zinc-400 hover:text-white'}`}
            onClick={() => setIsComparing(!isComparing)}
          >
            <Split className="h-4 w-4 mr-2" />
            {isComparing ? 'Remover Comparador' : 'Comparar Cenários'}
          </Button>
        </div>
      </div>

      {/* Switch modo real vs manual */}
      {kernelData && (
        <Card className="border-amber-500/10 bg-gradient-to-r from-amber-950/20 via-zinc-950/40 to-transparent">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-white">Kernel Financeiro conectado</p>
                <p className="text-xs text-zinc-400">
                  Renda Mensal Real: <span className="text-amber-400 font-bold">{formatCurrencyBRL(kernelData.monthlyIncome)}</span> • 
                  Gasto Mensal Atual: <span className="text-amber-400 font-bold">{formatCurrencyBRL(kernelData.monthlyExpenses)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Usar Meus Dados</span>
              <button
                role="switch"
                aria-checked={useRealData}
                onClick={() => handleToggleRealData(!useRealData)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  useRealData ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    useRealData ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regra dos 4% / FIRE Suggestion Card */}
      <Card className="border-violet-500/20 bg-violet-950/5">
        <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-violet-400 flex items-center gap-1.5">
              💡 Regra dos 4% (FIRE Number)
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-[500px]">
              Para viver de renda vitalícia cobrindo um custo de{' '}
              <span className="text-white font-semibold">{formatCurrencyBRL(retiredMonthlyExpense)}</span>/mês (descontando INSS de {formatCurrencyBRL(inssContribution)}), seu patrimônio necessário é de{' '}
              <span className="text-violet-400 font-bold">{formatCurrencyBRL(suggestedTargetAmount)}</span>.
            </p>
          </div>
          <Button
            onClick={() => setTargetAmountStr(formatCurrencyInput(suggestedTargetAmount))}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs"
          >
            Usar esta meta
          </Button>
        </CardContent>
      </Card>

      {/* Simulação Layout Split (Cenário A e B) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cenário A */}
        <Card className={`border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl ${isComparing ? 'border-amber-500/10' : ''}`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-violet-400" />
              {isComparing ? 'Cenário A' : 'Parâmetros'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <CalculatorField label="Renda Mensal" prefix="R$" value={monthlyIncomeStr} onChange={(v) => { setMonthlyIncomeStr(formatCurrencyInput(v)); setUseRealData(false); }} />
              <CalculatorField label="Patrimônio Atual" prefix="R$" value={currentAmountStr} onChange={(v) => { setCurrentAmountStr(formatCurrencyInput(v)); setUseRealData(false); }} />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <CalculatorField label="Meta Patrimonial" prefix="R$" value={targetAmountStr} onChange={(v) => setTargetAmountStr(formatCurrencyInput(v))} />
              <CalculatorField label="Taxa Poupança (%)" suffix="%" value={investPercentStr} onChange={(v) => setInvestPercentStr(v)} />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <CalculatorField label="Idade Atual" suffix="anos" value={currentAgeStr} onChange={(v) => { setCurrentAgeStr(v.replace(/\D/g, '')); setUseRealData(false); }} />
              <CalculatorField label="Idade Aposentadoria" suffix="anos" value={retireAgeStr} onChange={(v) => setRetireAgeStr(v.replace(/\D/g, ''))} />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <CalculatorField label="Taxa Total Anual" suffix="%" value={annualRateStr} onChange={(v) => setAnnualRateStr(v)} />
              <CalculatorField label="Gasto Aposentado" prefix="R$" value={retiredMonthlyExpenseStr} onChange={(v) => { setRetiredMonthlyExpenseStr(formatCurrencyInput(v)); setUseRealData(false); }} />
            </div>
            <CalculatorField label="Contribuição INSS estimada (Reduz meta)" prefix="R$" value={inssContributionStr} onChange={(v) => setInssContributionStr(formatCurrencyInput(v))} />
          </CardContent>
        </Card>

        {/* Cenário B */}
        {isComparing && (
          <Card className="border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl border-cyan-500/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Split className="h-5 w-5 text-cyan-500" />
                Cenário B
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <CalculatorField label="Renda Mensal B" prefix="R$" value={monthlyIncomeStrB} onChange={(v) => setMonthlyIncomeStrB(formatCurrencyInput(v))} />
                <CalculatorField label="Patrimônio Atual B" prefix="R$" value={currentAmountStrB} onChange={(v) => setCurrentAmountStrB(formatCurrencyInput(v))} />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <CalculatorField label="Meta Patrimonial B" prefix="R$" value={targetAmountStrB} onChange={(v) => setTargetAmountStrB(formatCurrencyInput(v))} />
                <CalculatorField label="Taxa Poupança B (%)" suffix="%" value={investPercentStrB} onChange={(v) => setInvestPercentStrB(v)} />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <CalculatorField label="Idade Atual B" suffix="anos" value={currentAgeStrB} onChange={(v) => setCurrentAgeStrB(v.replace(/\D/g, ''))} />
                <CalculatorField label="Idade Aposentadoria B" suffix="anos" value={retireAgeStrB} onChange={(v) => setRetireAgeStrB(v.replace(/\D/g, ''))} />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <CalculatorField label="Taxa Total Anual B" suffix="%" value={annualRateStrB} onChange={(v) => setAnnualRateStrB(v)} />
                <CalculatorField label="Gasto Aposentado B" prefix="R$" value={retiredMonthlyExpenseStrB} onChange={(v) => setRetiredMonthlyExpenseStrB(formatCurrencyInput(v))} />
              </div>
              <CalculatorField label="Contribuição INSS B" prefix="R$" value={inssContributionStrB} onChange={(v) => setInssContributionStrB(formatCurrencyInput(v))} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resultados/Outputs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Futuro Projetado */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Patrimônio Projetado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className={`text-2xl font-extrabold ${resultA.willReach ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatCurrencyBRL(resultA.futureValue)}
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B:{' '}
                <span className={resultB.willReach ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {formatCurrencyBRL(resultB.futureValue)}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Aporte Requerido */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Aporte Mensal Requerido (Meta)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-extrabold text-white">
              {formatCurrencyBRL(resultA.requiredContribution)}
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B: {formatCurrencyBRL(resultB.requiredContribution)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Diagnóstico */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            {resultA.willReach ? (
              <p className="text-emerald-500 font-bold flex items-center gap-1"><Check className="h-4.5 w-4.5" /> Meta atingida! Estratégia sustentável.</p>
            ) : (
              <p className="text-rose-500 font-bold">Faltam {formatCurrencyBRL(resultA.gap)} para bater a meta.</p>
            )}
            {isComparing && (
              <p className="text-[10px] text-zinc-500 border-t border-zinc-800 pt-1">
                Aporte atual Cenário A: {formatCurrencyBRL(monthlyContribution)}/mês.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-base">Curva de Acúmulo Patrimonial</CardTitle>
          <CardDescription className="text-zinc-400">Meta patrimonial representada pela linha amarela tracejada.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="age" stroke="#71717a" fontSize={11} />
              <YAxis tickFormatter={(v) => formatCurrencyBRL(Number(v)).replace(',00', '')} stroke="#71717a" fontSize={11} />
              <Tooltip formatter={(v: any) => formatCurrencyBRL(Number(v))} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
              <ReferenceLine y={Math.max(0, finalTargetAmount)} stroke="#eab308" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="Cenário A" stroke="#a855f7" strokeWidth={3} dot={{ r: 2 }} />
              {isComparing && <Line type="monotone" dataKey="Cenário B" stroke="#06b6d4" strokeWidth={3} dot={{ r: 2 }} />}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Salvar e Histórico */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Salvar Simulação */}
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Salvar Simulação</CardTitle>
            <CardDescription className="text-zinc-400">Guarde a estratégia de aposentadoria atual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do cenário (ex: Aposentar aos 55)"
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                className="flex-1 h-10 px-3 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-amber-500/50"
              />
              <Button onClick={handleSaveSim} className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs">
                <Save className="h-4 w-4 mr-1.5" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulações Salvas */}
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Cenários Salvos</CardTitle>
            <CardDescription className="text-zinc-400">Simulações de aposentadoria salvas no navegador.</CardDescription>
          </CardHeader>
          <CardContent>
            {savedSims.length > 0 ? (
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {savedSims.map((sim) => (
                  <div key={sim.id} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-xs">
                    <div>
                      <p className="font-bold text-zinc-200">{sim.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {sim.date} • Aposenta aos: {sim.retireAge} anos • Renda: R$ {sim.monthlyIncome} • Meta: R$ {sim.targetAmount}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleLoadSim(sim)} variant="ghost" size="sm" className="h-8 text-amber-500 hover:text-amber-400 font-semibold px-2 hover:bg-amber-500/5">
                        Restaurar
                      </Button>
                      <Button onClick={() => handleDeleteSim(sim.id)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs">
                Nenhum cenário salvo ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
