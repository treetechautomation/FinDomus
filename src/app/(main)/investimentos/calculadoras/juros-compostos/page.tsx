'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp, Sparkles, RefreshCw, HelpCircle, Save, Trash2, Split, Check } from 'lucide-react';
import { CalculatorField } from '@/components/finance/calculator-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';
import { formatCurrencyBRL, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';
import { simulateCompound } from '@/core/finance/million';

type SavedSim = {
  id: string;
  name: string;
  date: string;
  initial: string;
  monthly: string;
  rate: string;
  years: string;
  discountInflation: boolean;
  mode: 'future_value' | 'required_aporte';
  targetAmount: string;
};

export default function JurosCompostosPage() {
  const [useRealData, setUseRealData] = useState(false);
  const [kernelData, setKernelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modo: "Quanto terei?" (future_value) vs "Quanto preciso por mês?" (required_aporte)
  const [mode, setMode] = useState<'future_value' | 'required_aporte'>('future_value');

  // Cenário A
  const [initialStr, setInitialStr] = useState('10.000,00');
  const [monthlyStr, setMonthlyStr] = useState('500,00');
  const [rateStr, setRateStr] = useState('9,50');
  const [yearsStr, setYearsStr] = useState('10');
  const [targetAmountStr, setTargetAmountStr] = useState('100.000,00');
  const [discountInflation, setDiscountInflation] = useState(false);

  // Cenário B (Comparação)
  const [isComparing, setIsComparing] = useState(false);
  const [initialStrB, setInitialStrB] = useState('10.000,00');
  const [monthlyStrB, setMonthlyStrB] = useState('500,00');
  const [rateStrB, setRateStrB] = useState('9,50');
  const [yearsStrB, setYearsStrB] = useState('10');
  const [targetAmountStrB, setTargetAmountStrB] = useState('100.000,00');
  const [discountInflationB, setDiscountInflationB] = useState(false);

  // LocalStorage Histórico
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
        throw new Error('Erro ao carregar os dados do Kernel.');
      }
      const data = await res.json();
      setKernelData(data);

      // Pré-preencher com dados do kernel
      if (data) {
        setInitialStr(formatCurrencyInput(data.netWorth));
        // Aporte sugerido baseado no saldo restante do DRE (surplus)
        const surplus = Math.max(0, data.monthlyIncome - data.monthlyExpenses);
        setMonthlyStr(formatCurrencyInput(surplus > 0 ? surplus : 500));
        setUseRealData(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao comunicar com a API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('findomus_sims_juros');
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
      setInitialStr(formatCurrencyInput(kernelData.netWorth));
      const surplus = Math.max(0, kernelData.monthlyIncome - kernelData.monthlyExpenses);
      setMonthlyStr(formatCurrencyInput(surplus > 0 ? surplus : 500));
    }
  };

  // Salvar Simulação
  const handleSaveSim = () => {
    if (!simName.trim()) return;
    const newSim: SavedSim = {
      id: Math.random().toString(36).substring(2, 9),
      name: simName,
      date: new Date().toLocaleDateString('pt-BR'),
      initial: initialStr,
      monthly: monthlyStr,
      rate: rateStr,
      years: yearsStr,
      discountInflation,
      mode,
      targetAmount: targetAmountStr,
    };
    const updated = [newSim, ...savedSims];
    setSavedSims(updated);
    localStorage.setItem('findomus_sims_juros', JSON.stringify(updated));
    setSimName('');
  };

  // Excluir simulação
  const handleDeleteSim = (id: string) => {
    const updated = savedSims.filter((s) => s.id !== id);
    setSavedSims(updated);
    localStorage.setItem('findomus_sims_juros', JSON.stringify(updated));
  };

  // Restaurar simulação
  const handleLoadSim = (sim: SavedSim) => {
    setInitialStr(sim.initial);
    setMonthlyStr(sim.monthly);
    setRateStr(sim.rate);
    setYearsStr(sim.years);
    setDiscountInflation(sim.discountInflation);
    setMode(sim.mode);
    if (sim.targetAmount) setTargetAmountStr(sim.targetAmount);
    setUseRealData(false);
  };

  // Parâmetros Cenário A
  const initial = parseCurrencyInput(initialStr);
  const years = Number(yearsStr) || 0;
  const rateNominal = Number(rateStr.replace(',', '.')) / 100;
  const rate = discountInflation ? (1 + rateNominal) / (1 + 0.045) - 1 : rateNominal;
  const targetAmount = parseCurrencyInput(targetAmountStr);

  const monthlyContribution = mode === 'future_value'
    ? parseCurrencyInput(monthlyStr)
    : useMemo(() => {
        // Encontra o aporte mensal ideal para bater a meta
        const monthlyRate = rate / 12;
        const months = years * 12;
        const factor = monthlyRate > 0 ? (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate : months;
        const val = factor > 0 ? (targetAmount - initial * Math.pow(1 + monthlyRate, months)) / factor : 0;
        return Math.max(0, val);
      }, [initial, targetAmount, rate, years]);

  // Parâmetros Cenário B
  const initialB = parseCurrencyInput(initialStrB);
  const yearsB = Number(yearsStrB) || 0;
  const rateNominalB = Number(rateStrB.replace(',', '.')) / 100;
  const rateB = discountInflationB ? (1 + rateNominalB) / (1 + 0.045) - 1 : rateNominalB;
  const targetAmountB = parseCurrencyInput(targetAmountStrB);

  const monthlyContributionB = mode === 'future_value'
    ? parseCurrencyInput(monthlyStrB)
    : useMemo(() => {
        const monthlyRate = rateB / 12;
        const months = yearsB * 12;
        const factor = monthlyRate > 0 ? (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate : months;
        const val = factor > 0 ? (targetAmountB - initialB * Math.pow(1 + monthlyRate, months)) / factor : 0;
        return Math.max(0, val);
      }, [initialB, targetAmountB, rateB, yearsB]);

  // Resultados
  const resultA = useMemo(() => {
    return simulateCompound({ initial, monthly: monthlyContribution, rate, years });
  }, [initial, monthlyContribution, rate, years]);

  const resultB = useMemo(() => {
    return simulateCompound({ initial: initialB, monthly: monthlyContributionB, rate: rateB, years: yearsB });
  }, [initialB, monthlyContributionB, rateB, yearsB]);

  const totalInvestedA = initial + monthlyContribution * years * 12;
  const totalGainA = Math.max(0, resultA - totalInvestedA);

  const totalInvestedB = initialB + monthlyContributionB * yearsB * 12;
  const totalGainB = Math.max(0, resultB - totalInvestedB);

  // Evolução Gráfico
  const chartData = useMemo(() => {
    const maxYears = Math.max(years, isComparing ? yearsB : years);
    const monthlyRateA = rate / 12;
    const monthlyRateB = rateB / 12;

    return Array.from({ length: maxYears + 1 }).map((_, year) => {
      let totalA = initial;
      if (year > 0 && year <= years) {
        totalA = initial * Math.pow(1 + monthlyRateA, year * 12) +
          monthlyContribution * ((Math.pow(1 + monthlyRateA, year * 12) - 1) / monthlyRateA);
      } else if (year > years) {
        totalA = resultA; // Trava após o fim do prazo do cenário A
      }

      let totalB = initialB;
      if (isComparing) {
        if (year > 0 && year <= yearsB) {
          totalB = initialB * Math.pow(1 + monthlyRateB, year * 12) +
            monthlyContributionB * ((Math.pow(1 + monthlyRateB, year * 12) - 1) / monthlyRateB);
        } else if (year > yearsB) {
          totalB = resultB;
        }
      }

      return {
        year,
        'Cenário A': Math.round(totalA),
        ...(isComparing ? { 'Cenário B': Math.round(totalB) } : {}),
      };
    });
  }, [initial, monthlyContribution, rate, years, initialB, monthlyContributionB, rateB, yearsB, isComparing, resultA, resultB]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">Investimentos › Calculadoras</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white uppercase">Juros compostos</h1>
          <p className="text-zinc-400">Simule seu acúmulo patrimonial ou descubra quanto precisa aportar para atingir suas metas.</p>
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
                  Patrimônio Líquido Real:{' '}
                  <span className="text-amber-400 font-bold">{formatCurrencyBRL(kernelData.netWorth)}</span> • 
                  Excedente Mensal sugerido:{' '}
                  <span className="text-amber-400 font-bold">
                    {formatCurrencyBRL(Math.max(0, kernelData.monthlyIncome - kernelData.monthlyExpenses))}
                  </span>
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

      {/* Seletor de Modo (Botoes de Aba Premium) */}
      <div className="flex bg-zinc-900/60 p-1 rounded-xl w-fit border border-zinc-800">
        <button
          onClick={() => setMode('future_value')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'future_value' ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Quanto meu dinheiro vai render?
        </button>
        <button
          onClick={() => setMode('required_aporte')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'required_aporte' ? 'bg-amber-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Quanto preciso poupar para a meta?
        </button>
      </div>

      {/* Inputs de Cenários */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cenário A */}
        <Card className={`border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl ${isComparing ? 'border-amber-500/10' : ''}`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              {isComparing ? 'Cenário A' : 'Parâmetros'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <CalculatorField label="Patrimônio Inicial" prefix="R$" value={initialStr} onChange={(v) => { setInitialStr(formatCurrencyInput(v)); setUseRealData(false); }} />
              {mode === 'future_value' ? (
                <CalculatorField label="Aporte Mensal" prefix="R$" value={monthlyStr} onChange={(v) => { setMonthlyStr(formatCurrencyInput(v)); setUseRealData(false); }} />
              ) : (
                <CalculatorField label="Meta Desejada" prefix="R$" value={targetAmountStr} onChange={(v) => setTargetAmountStr(formatCurrencyInput(v))} />
              )}
            </div>
            <div className="grid gap-4 grid-cols-2">
              <CalculatorField label="Taxa Anual (%)" suffix="%" value={rateStr} onChange={(v) => setRateStr(v)} />
              <CalculatorField label="Prazo (anos)" suffix="anos" value={yearsStr} onChange={(v) => setYearsStr(v.replace(/\D/g, ''))} />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
              <input
                type="checkbox"
                id="inflationCheckA"
                checked={discountInflation}
                onChange={(e) => setDiscountInflation(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
              />
              <label htmlFor="inflationCheckA" className="text-xs text-zinc-400 cursor-pointer select-none">
                Descontar inflação estimada (4,5% a.a.) para simular poder de compra real
              </label>
            </div>
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
                <CalculatorField label="Patrimônio Inicial B" prefix="R$" value={initialStrB} onChange={(v) => setInitialStrB(formatCurrencyInput(v))} />
                {mode === 'future_value' ? (
                  <CalculatorField label="Aporte Mensal B" prefix="R$" value={monthlyStrB} onChange={(v) => setMonthlyStrB(formatCurrencyInput(v))} />
                ) : (
                  <CalculatorField label="Meta Desejada B" prefix="R$" value={targetAmountStrB} onChange={(v) => setTargetAmountStrB(formatCurrencyInput(v))} />
                )}
              </div>
              <div className="grid gap-4 grid-cols-2">
                <CalculatorField label="Taxa Anual B (%)" suffix="%" value={rateStrB} onChange={(v) => setRateStrB(v)} />
                <CalculatorField label="Prazo B (anos)" suffix="anos" value={yearsStrB} onChange={(v) => setYearsStrB(v.replace(/\D/g, ''))} />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                <input
                  type="checkbox"
                  id="inflationCheckB"
                  checked={discountInflationB}
                  onChange={(e) => setDiscountInflationB(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <label htmlFor="inflationCheckB" className="text-xs text-zinc-400 cursor-pointer select-none">
                  Descontar inflação estimada (4,5% a.a.) para simular poder de compra real B
                </label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resultados/Outputs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Resultado Principal */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              {mode === 'future_value' ? 'Patrimônio Estimado Final' : 'Aporte Mensal Requerido'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-extrabold text-amber-500">
              {mode === 'future_value' ? formatCurrencyBRL(resultA) : formatCurrencyBRL(monthlyContribution)}
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B:{' '}
                {mode === 'future_value' ? formatCurrencyBRL(resultB) : formatCurrencyBRL(monthlyContributionB)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Juros Acumulados / Total Investido */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              {mode === 'future_value' ? 'Juros Rendidos Acumulados' : 'Total Investido (Sem Juros)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-extrabold text-white">
              {mode === 'future_value' ? formatCurrencyBRL(totalGainA) : formatCurrencyBRL(totalInvestedA)}
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B: {mode === 'future_value' ? formatCurrencyBRL(totalGainB) : formatCurrencyBRL(totalInvestedB)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Diagnóstico */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Diagnóstico de Crescimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-300">
            {mode === 'future_value' ? (
              totalGainA > totalInvestedA * 0.4 ? (
                <p className="text-emerald-400 font-semibold flex items-center gap-1"><Check className="h-4 w-4" /> Excelente efeito multiplicador dos juros compostos.</p>
              ) : (
                <p className="text-amber-500 font-semibold">Tente aumentar o prazo para os juros trabalharem mais.</p>
              )
            ) : (
              <p>Meta total de {formatCurrencyBRL(targetAmount)} em {years} anos.</p>
            )}
            {isComparing && (
              <p className="text-xs text-zinc-500 mt-1 border-t border-zinc-800 pt-1">
                Delta de Rendimento: {formatCurrencyBRL(resultB - resultA)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Curva de Evolução */}
      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-base">Curva de Evolução do Patrimônio</CardTitle>
          <CardDescription className="text-zinc-400">Evolução estimada ano a ano.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="year" tickFormatter={(v) => `${v}a`} stroke="#71717a" fontSize={11} />
              <YAxis tickFormatter={(v) => formatCurrencyBRL(Number(v)).replace(',00', '')} stroke="#71717a" fontSize={11} />
              <Tooltip formatter={(v: any) => formatCurrencyBRL(Number(v))} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
              <Line type="monotone" dataKey="Cenário A" stroke="#f59e0b" strokeWidth={3} dot={{ r: 2 }} />
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
            <CardDescription className="text-zinc-400">Guarde o cenário atual para restaurá-lo a qualquer momento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do cenário (ex: Renda Fixa de Longo Prazo)"
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
            <CardDescription className="text-zinc-400">Simulações de juros no seu navegador.</CardDescription>
          </CardHeader>
          <CardContent>
            {savedSims.length > 0 ? (
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {savedSims.map((sim) => (
                  <div key={sim.id} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-xs">
                    <div>
                      <p className="font-bold text-zinc-200">{sim.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {sim.date} • {sim.years} anos • Tx: {sim.rate}% •{' '}
                        {sim.mode === 'future_value' ? `Aporte: R$ ${sim.monthly}` : `Meta: R$ ${sim.targetAmount}`}
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
