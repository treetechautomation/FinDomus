'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Landmark, Sparkles, RefreshCw, HelpCircle, Save, Trash2, Split, Check } from 'lucide-react';
import { CalculatorField } from '@/components/finance/calculator-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';
import { formatCurrencyBRL, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';

type SavedSim = {
  id: string;
  name: string;
  date: string;
  amount: string;
  selic: string;
  years: string;
  considerIR: boolean;
};

export default function PoupancaSelicPage() {
  const [useRealData, setUseRealData] = useState(false);
  const [kernelData, setKernelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cenário A
  const [amountStr, setAmountStr] = useState('10.000,00');
  const [selicStr, setSelicStr] = useState('10,75');
  const [yearsStr, setYearsStr] = useState('1');
  const [considerIR, setConsiderIR] = useState(true);

  // Cenário B
  const [isComparing, setIsComparing] = useState(false);
  const [amountStrB, setAmountStrB] = useState('10.000,00');
  const [selicStrB, setSelicStrB] = useState('10,75');
  const [yearsStrB, setYearsStrB] = useState('1');
  const [considerIRB, setConsiderIRB] = useState(true);

  // Historico LocalStorage
  const [savedSims, setSavedSims] = useState<SavedSim[]>([]);
  const [simName, setSimName] = useState('');

  // Carregar dados do kernel
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
        setAmountStr(formatCurrencyInput(data.netWorth));
        setSelicStr(String(data.selicRate || 10.75).replace('.', ','));
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
    const stored = localStorage.getItem('findomus_sims_poupanca');
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
      setAmountStr(formatCurrencyInput(kernelData.netWorth));
      setSelicStr(String(kernelData.selicRate || 10.75).replace('.', ','));
    }
  };

  // Salvar Cenário
  const handleSaveSim = () => {
    if (!simName.trim()) return;
    const newSim: SavedSim = {
      id: Math.random().toString(36).substring(2, 9),
      name: simName,
      date: new Date().toLocaleDateString('pt-BR'),
      amount: amountStr,
      selic: selicStr,
      years: yearsStr,
      considerIR,
    };
    const updated = [newSim, ...savedSims];
    setSavedSims(updated);
    localStorage.setItem('findomus_sims_poupanca', JSON.stringify(updated));
    setSimName('');
  };

  // Excluir cenário
  const handleDeleteSim = (id: string) => {
    const updated = savedSims.filter((s) => s.id !== id);
    setSavedSims(updated);
    localStorage.setItem('findomus_sims_poupanca', JSON.stringify(updated));
  };

  // Restaurar cenário
  const handleLoadSim = (sim: SavedSim) => {
    setAmountStr(sim.amount);
    setSelicStr(sim.selic);
    setYearsStr(sim.years);
    setConsiderIR(sim.considerIR);
    setUseRealData(false);
  };

  // Cálculos do Imposto de Renda Regressivo (Renda Fixa)
  const getIRRate = (yearsNum: number) => {
    const monthsNum = yearsNum * 12;
    if (monthsNum < 6) return 0.225;
    if (monthsNum < 12) return 0.20;
    if (monthsNum < 24) return 0.175;
    return 0.15;
  };

  // Fórmulas para o Cenário A
  const amount = parseCurrencyInput(amountStr);
  const selic = Number(selicStr.replace(',', '.')) || 10.75;
  const years = Number(yearsStr) || 1;

  const resultA = useMemo(() => {
    const monthsNum = years * 12;
    const irRate = getIRRate(years);

    // 1. Poupança: se SELIC > 8.5% -> 0.5% a.m., se não 70% da SELIC
    const poupancaRate = selic > 8.5 ? 0.005 : (selic / 100 * 0.7) / 12;
    let poupancaFinal = amount;
    for (let i = 0; i < monthsNum; i++) poupancaFinal *= 1 + poupancaRate;

    // 2. CDB 100% CDI
    const cdiRate = (selic / 100) / 12;
    let cdbFinal = amount;
    for (let i = 0; i < monthsNum; i++) cdbFinal *= 1 + cdiRate;
    const cdbProfit = cdbFinal - amount;
    const cdbNetProfit = considerIR ? cdbProfit * (1 - irRate) : cdbProfit;
    const cdbFinalNet = amount + cdbNetProfit;

    // 3. Tesouro Selic (custódia B3 de 0.2% a.a. sobre montante total)
    const tesouroRate = (selic / 100) / 12;
    let tesouroFinal = amount;
    for (let i = 0; i < monthsNum; i++) tesouroFinal *= 1 + tesouroRate;
    // desconta taxa de custódia
    const custodyFee = tesouroFinal * (0.002 * years);
    const tesouroFinalAfterCustody = Math.max(amount, tesouroFinal - custodyFee);
    const tesouroProfit = tesouroFinalAfterCustody - amount;
    const tesouroNetProfit = considerIR ? tesouroProfit * (1 - irRate) : tesouroProfit;
    const tesouroFinalNet = amount + tesouroNetProfit;

    return {
      poupanca: poupancaFinal,
      cdb: cdbFinalNet,
      tesouro: tesouroFinalNet,
      diffCDB: cdbFinalNet - poupancaFinal,
      diffTesouro: tesouroFinalNet - poupancaFinal,
    };
  }, [amount, selic, years, considerIR]);

  // Fórmulas para o Cenário B
  const amountB = parseCurrencyInput(amountStrB);
  const selicB = Number(selicStrB.replace(',', '.')) || 10.75;
  const yearsB = Number(yearsStrB) || 1;

  const resultB = useMemo(() => {
    const monthsNum = yearsB * 12;
    const irRate = getIRRate(yearsB);

    const poupancaRate = selicB > 8.5 ? 0.005 : (selicB / 100 * 0.7) / 12;
    let poupancaFinal = amountB;
    for (let i = 0; i < monthsNum; i++) poupancaFinal *= 1 + poupancaRate;

    const cdiRate = (selicB / 100) / 12;
    let cdbFinal = amountB;
    for (let i = 0; i < monthsNum; i++) cdbFinal *= 1 + cdiRate;
    const cdbProfit = cdbFinal - amountB;
    const cdbNetProfit = considerIRB ? cdbProfit * (1 - irRate) : cdbProfit;
    const cdbFinalNet = amountB + cdbNetProfit;

    const tesouroRate = (selicB / 100) / 12;
    let tesouroFinal = amountB;
    for (let i = 0; i < monthsNum; i++) tesouroFinal *= 1 + tesouroRate;
    const custodyFee = tesouroFinal * (0.002 * yearsB);
    const tesouroFinalAfterCustody = Math.max(amountB, tesouroFinal - custodyFee);
    const tesouroProfit = tesouroFinalAfterCustody - amountB;
    const tesouroNetProfit = considerIRB ? tesouroProfit * (1 - irRate) : tesouroProfit;
    const tesouroFinalNet = amountB + tesouroNetProfit;

    return {
      poupanca: poupancaFinal,
      cdb: cdbFinalNet,
      tesouro: tesouroFinalNet,
    };
  }, [amountB, selicB, yearsB, considerIRB]);

  // Gráfico Comparativo
  const data = useMemo(() => {
    if (isComparing) {
      return [
        { name: 'Poupança A', value: Math.round(resultA.poupanca) },
        { name: 'Poupança B', value: Math.round(resultB.poupanca) },
        { name: 'CDB 100% A', value: Math.round(resultA.cdb) },
        { name: 'CDB 100% B', value: Math.round(resultB.cdb) },
        { name: 'Tesouro Selic A', value: Math.round(resultA.tesouro) },
        { name: 'Tesouro Selic B', value: Math.round(resultB.tesouro) },
      ];
    }
    return [
      { name: 'Poupança', value: Math.round(resultA.poupanca) },
      { name: 'CDB 100% CDI', value: Math.round(resultA.cdb) },
      { name: 'Tesouro Selic', value: Math.round(resultA.tesouro) },
    ];
  }, [resultA, resultB, isComparing]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">Investimentos › Calculadoras</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            <Landmark className="h-7 w-7 text-sky-500" />
            Poupança vs SELIC
          </h1>
          <p className="text-zinc-400">Compare os rendimentos da Poupança, CDB 100% CDI e Tesouro Selic com incidência de IR.</p>
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
                <p className="text-sm font-semibold text-white">Integração com dados reais ativa</p>
                <p className="text-xs text-zinc-400">
                  Patrimônio Líquido Real: <span className="text-amber-400 font-bold">{formatCurrencyBRL(kernelData.netWorth)}</span> • 
                  Taxa SELIC Atual: <span className="text-amber-400 font-bold">{kernelData.selicRate}% a.a.</span>
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

      {/* Simulação Layout Split (Cenário A e B) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cenário A */}
        <Card className={`border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl ${isComparing ? 'border-amber-500/10' : ''}`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Landmark className="h-5 w-5 text-sky-400" />
              {isComparing ? 'Cenário A' : 'Parâmetros'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CalculatorField label="Valor Aplicado" prefix="R$" value={amountStr} onChange={(v) => { setAmountStr(formatCurrencyInput(v)); setUseRealData(false); }} />
            <div className="grid gap-4 grid-cols-2">
              <CalculatorField label="Taxa SELIC Anual (%)" suffix="%" value={selicStr} onChange={(v) => { setSelicStr(v); setUseRealData(false); }} />
              <CalculatorField label="Prazo (anos)" suffix="anos" value={yearsStr} onChange={(v) => setYearsStr(v.replace(/\D/g, ''))} />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
              <input
                type="checkbox"
                id="considerIRA"
                checked={considerIR}
                onChange={(e) => setConsiderIR(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
              />
              <label htmlFor="considerIRA" className="text-xs text-zinc-400 cursor-pointer select-none">
                Considerar alíquota regressiva de IR (Poupança continuará isenta)
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
              <CalculatorField label="Valor Aplicado B" prefix="R$" value={amountStrB} onChange={(v) => setAmountStrB(formatCurrencyInput(v))} />
              <div className="grid gap-4 grid-cols-2">
                <CalculatorField label="Taxa SELIC Anual B (%)" suffix="%" value={selicStrB} onChange={(v) => setSelicStrB(v)} />
                <CalculatorField label="Prazo B (anos)" suffix="anos" value={yearsStrB} onChange={(v) => setYearsStrB(v.replace(/\D/g, ''))} />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                <input
                  type="checkbox"
                  id="considerIRB"
                  checked={considerIRB}
                  onChange={(e) => setConsiderIRB(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
                />
                <label htmlFor="considerIRB" className="text-xs text-zinc-400 cursor-pointer select-none">
                  Considerar alíquota regressiva de IR B
                </label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resultados/Outputs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Poupança */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Poupança final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-extrabold text-white">
              {formatCurrencyBRL(resultA.poupanca)}
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B: {formatCurrencyBRL(resultB.poupanca)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* CDB 100% CDI */}
        <Card className="border-zinc-800 bg-zinc-950/20 border-emerald-500/10">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              CDB 100% CDI final (líquido)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-extrabold text-emerald-500">
              {formatCurrencyBRL(resultA.cdb)}
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B: {formatCurrencyBRL(resultB.cdb)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tesouro Selic */}
        <Card className="border-zinc-800 bg-zinc-950/20 border-emerald-500/10">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Tesouro Selic final (líquido)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-extrabold text-emerald-500">
              {formatCurrencyBRL(resultA.tesouro)}
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B: {formatCurrencyBRL(resultB.tesouro)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerta/Diagnóstico Detalhado */}
      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-base">Diagnóstico de Rendimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          <p>
            No Cenário A, ao deixar de usar a Poupança e optar por um{' '}
            <span className="text-emerald-400 font-bold">CDB 100% CDI</span>, você ganha{' '}
            <span className="text-emerald-400 font-extrabold">{formatCurrencyBRL(resultA.diffCDB)} a mais</span> no prazo selecionado.
          </p>
          {considerIR && (
            <p className="text-[10px] text-zinc-500">
              * Cálculo do CDB e Tesouro considera alíquota de IR de{' '}
              <span className="font-semibold">{(getIRRate(years) * 100).toFixed(1)}%</span> sobre os lucros. A poupança é isenta de IR. A taxa de custódia de 0.2% a.a. da B3 foi aplicada ao Tesouro Selic.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparativo Visual */}
      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-base">Comparativo Visual Final</CardTitle>
          <CardDescription className="text-zinc-400">Total acumulado líquido por ativo.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
              <YAxis tickFormatter={(v) => formatCurrencyBRL(Number(v)).replace(',00', '')} stroke="#71717a" fontSize={11} />
              <Tooltip formatter={(v: any) => formatCurrencyBRL(Number(v))} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={6} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Salvar e Histórico */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Salvar Simulação */}
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Salvar Simulação</CardTitle>
            <CardDescription className="text-zinc-400">Guarde a comparação atual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do cenário (ex: Poupança vs CDI com 2 anos)"
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
            <CardDescription className="text-zinc-400">Simulações comparativas salvas.</CardDescription>
          </CardHeader>
          <CardContent>
            {savedSims.length > 0 ? (
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {savedSims.map((sim) => (
                  <div key={sim.id} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-xs">
                    <div>
                      <p className="font-bold text-zinc-200">{sim.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {sim.date} • R$ {sim.amount} • {sim.years} anos • SELIC: {sim.selic}%
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
