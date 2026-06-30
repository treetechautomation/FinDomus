'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shield, Sparkles, RefreshCw, HelpCircle, Eye, EyeOff, Save, Trash2, Split } from 'lucide-react';
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
  monthlyExpenses: string;
  months: string;
  currentReserve: string;
};

export default function ReservaPage() {
  const [useRealData, setUseRealData] = useState(false);
  const [kernelData, setKernelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cenário A
  const [monthlyExpensesStr, setMonthlyExpensesStr] = useState('4.000,00');
  const [monthsStr, setMonthsStr] = useState('6');
  const [currentReserveStr, setCurrentReserveStr] = useState('0,00');

  // Cenário B (Comparação)
  const [isComparing, setIsComparing] = useState(false);
  const [monthlyExpensesStrB, setMonthlyExpensesStrB] = useState('4.000,00');
  const [monthsStrB, setMonthsStrB] = useState('6');
  const [currentReserveStrB, setCurrentReserveStrB] = useState('0,00');

  // LocalStorage Historico
  const [savedSims, setSavedSims] = useState<SavedSim[]>([]);
  const [simName, setSimName] = useState('');

  // Expansão do Breakdown de Liquidez
  const [showBreakdown, setShowBreakdown] = useState(false);

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
        throw new Error('Erro ao carregar os dados reais do Kernel.');
      }
      const data = await res.json();
      setKernelData(data);
      
      // Pré-preencher com dados reais
      if (data.emergencyReserve) {
        setMonthlyExpensesStr(formatCurrencyInput(data.emergencyReserve.essentialMonthlyExpenses));
        setCurrentReserveStr(formatCurrencyInput(data.emergencyReserve.reserveAmount));
        setMonthsStr(String(data.emergencyReserve.targetMonths || 6));
        setUseRealData(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao comunicar com a API.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito de carga inicial das simulações salvas
  useEffect(() => {
    const stored = localStorage.getItem('findomus_sims_reserva');
    if (stored) {
      try {
        setSavedSims(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
    loadKernelData();
  }, []);

  // Alternar entre dados reais e manual
  const handleToggleRealData = (checked: boolean) => {
    setUseRealData(checked);
    if (checked && kernelData?.emergencyReserve) {
      setMonthlyExpensesStr(formatCurrencyInput(kernelData.emergencyReserve.essentialMonthlyExpenses));
      setCurrentReserveStr(formatCurrencyInput(kernelData.emergencyReserve.reserveAmount));
      setMonthsStr(String(kernelData.emergencyReserve.targetMonths || 6));
    }
  };

  // Salvar Simulação no LocalStorage
  const handleSaveSim = () => {
    if (!simName.trim()) return;
    const newSim: SavedSim = {
      id: Math.random().toString(36).substring(2, 9),
      name: simName,
      date: new Date().toLocaleDateString('pt-BR'),
      monthlyExpenses: monthlyExpensesStr,
      months: monthsStr,
      currentReserve: currentReserveStr,
    };
    const updated = [newSim, ...savedSims];
    setSavedSims(updated);
    localStorage.setItem('findomus_sims_reserva', JSON.stringify(updated));
    setSimName('');
  };

  // Excluir simulação salva
  const handleDeleteSim = (id: string) => {
    const updated = savedSims.filter((s) => s.id !== id);
    setSavedSims(updated);
    localStorage.setItem('findomus_sims_reserva', JSON.stringify(updated));
  };

  // Carregar simulação salva
  const handleLoadSim = (sim: SavedSim) => {
    setMonthlyExpensesStr(sim.monthlyExpenses);
    setMonthsStr(sim.months);
    setCurrentReserveStr(sim.currentReserve);
    setUseRealData(false);
  };

  // Cálculos do Cenário A
  const monthlyExpenses = parseCurrencyInput(monthlyExpensesStr);
  const months = Number(monthsStr) || 0;
  const currentReserve = parseCurrencyInput(currentReserveStr);

  const targetAmount = monthlyExpenses * months;
  const reserveGap = Math.max(targetAmount - currentReserve, 0);
  const coveredMonths = monthlyExpenses > 0 ? currentReserve / monthlyExpenses : 0;
  const reservePercent = targetAmount > 0 ? Math.min(100, (currentReserve / targetAmount) * 100) : 0;

  // Cálculos do Cenário B
  const monthlyExpensesB = parseCurrencyInput(monthlyExpensesStrB);
  const monthsB = Number(monthsStrB) || 0;
  const currentReserveB = parseCurrencyInput(currentReserveStrB);

  const targetAmountB = monthlyExpensesB * monthsB;
  const reserveGapB = Math.max(targetAmountB - currentReserveB, 0);
  const coveredMonthsB = monthlyExpensesB > 0 ? currentReserveB / monthlyExpensesB : 0;
  const reservePercentB = targetAmountB > 0 ? Math.min(100, (currentReserveB / targetAmountB) * 100) : 0;

  // Gráfico comparativo
  const chartData = useMemo(() => {
    if (isComparing) {
      return [
        { name: 'Cenário A - Atual', value: currentReserve },
        { name: 'Cenário A - Ideal', value: targetAmount },
        { name: 'Cenário B - Atual', value: currentReserveB },
        { name: 'Cenário B - Ideal', value: targetAmountB },
      ];
    }
    return [
      { name: 'Atual', value: currentReserve },
      { name: 'Ideal', value: targetAmount },
    ];
  }, [isComparing, currentReserve, targetAmount, currentReserveB, targetAmountB]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">Investimentos › Calculadoras</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white uppercase">Reserva de emergência</h1>
          <p className="text-zinc-400">Calcule a proteção financeira necessária com base nas suas despesas essenciais.</p>
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
                  Despesas essenciais detectadas:{' '}
                  <span className="text-amber-400 font-bold">
                    {formatCurrencyBRL(kernelData.emergencyReserve.essentialMonthlyExpenses)}
                  </span>
                  /mês.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Dados Reais</span>
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
        {/* Coluna Cenário A */}
        <Card className={`border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl ${isComparing ? 'border-amber-500/10' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-amber-500" />
              {isComparing ? 'Cenário A (Atual / Base)' : 'Parâmetros da reserva'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {useRealData ? 'Preenchido automaticamente com dados do kernel' : 'Ajuste os valores para simular cenários customizados.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CalculatorField
              label="Gasto mensal essencial"
              prefix="R$"
              value={monthlyExpensesStr}
              onChange={(v) => {
                setMonthlyExpensesStr(formatCurrencyInput(v));
                setUseRealData(false);
              }}
            />
            <div className="grid gap-4 grid-cols-2">
              <CalculatorField
                label="Meses de cobertura"
                suffix="meses"
                value={monthsStr}
                onChange={(v) => {
                  setMonthsStr(v.replace(/\D/g, ''));
                  setUseRealData(false);
                }}
              />
              <CalculatorField
                label="Reserva atual líquida"
                prefix="R$"
                value={currentReserveStr}
                onChange={(v) => {
                  setCurrentReserveStr(formatCurrencyInput(v));
                  setUseRealData(false);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Coluna Cenário B (Se comparando) */}
        {isComparing && (
          <Card className="border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl border-cyan-500/10 animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Split className="h-5 w-5 text-cyan-500" />
                Cenário B (Comparativo)
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Simule um cenário alternativo (ex: redução de gastos essenciais ou aumento de aporte).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CalculatorField
                label="Gasto mensal essencial B"
                prefix="R$"
                value={monthlyExpensesStrB}
                onChange={(v) => setMonthlyExpensesStrB(formatCurrencyInput(v))}
              />
              <div className="grid gap-4 grid-cols-2">
                <CalculatorField
                  label="Meses de cobertura B"
                  suffix="meses"
                  value={monthsStrB}
                  onChange={(v) => setMonthsStrB(v.replace(/\D/g, ''))}
                />
                <CalculatorField
                  label="Reserva atual B"
                  prefix="R$"
                  value={currentReserveStrB}
                  onChange={(v) => setCurrentReserveStrB(formatCurrencyInput(v))}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resultados/Outputs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Reserva Ideal */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              Meta Alvo da Reserva
              <span title="Despesa essencial mensal multiplicada pelos meses de cobertura." className="cursor-help">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-extrabold text-white">{formatCurrencyBRL(targetAmount)}</p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B: {formatCurrencyBRL(targetAmountB)}
                <span className="text-zinc-400 font-normal">
                  {' '}(Delta: {formatCurrencyBRL(targetAmountB - targetAmount)})
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Falta Guardar */}
        <Card className={`border-zinc-800 bg-zinc-950/20 ${reserveGap > 0 ? 'border-amber-500/10' : 'border-emerald-500/15'}`}>
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              Falta Guardar
              <span title="Diferença restante para atingir a meta total." className="cursor-help">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className={`text-2xl font-extrabold ${reserveGap > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {formatCurrencyBRL(reserveGap)}
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B:{' '}
                <span className={reserveGapB > 0 ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>
                  {formatCurrencyBRL(reserveGapB)}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Diagnóstico */}
        <Card className={`border-zinc-800 bg-zinc-950/20 ${reserveGap > 0 ? 'border-amber-500/10' : 'border-emerald-500/15'}`}>
          <CardHeader className="py-4">
            <CardTitle className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
              Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className={`text-sm font-bold ${reserveGap > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              Cenário A: {coveredMonths.toFixed(1)} de {months} meses ({reservePercent.toFixed(0)}%)
            </p>
            {isComparing && (
              <p className="text-xs text-cyan-400 font-bold border-t border-zinc-800 pt-1">
                Cenário B: {coveredMonthsB.toFixed(1)} de {monthsB} meses ({reservePercentB.toFixed(0)}%)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Comparativo */}
      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-base">Evolução e Comparação da Reserva</CardTitle>
          <CardDescription className="text-zinc-400">Visualização lado a lado da reserva atual vs. meta ideal.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
              <YAxis tickFormatter={(v) => formatCurrencyBRL(Number(v)).replace(',00', '')} stroke="#71717a" fontSize={11} />
              <Tooltip formatter={(v: any) => formatCurrencyBRL(Number(v))} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
              <Bar dataKey="value" fill="#f59e0b" radius={6} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seção 1: Breakdown de Liquidez (dados do kernel) */}
      {kernelData && (
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="py-4 cursor-pointer select-none" onClick={() => setShowBreakdown(!showBreakdown)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                Auditoria de Ativos (Breakdown de Liquidez)
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                {showBreakdown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{showBreakdown ? 'Esconder detalhamento' : 'Ver detalhamento'}</span>
              </Button>
            </div>
            <CardDescription className="text-zinc-400">
              Veja exatamente quais das suas contas e investimentos reais foram considerados ou excluídos do cálculo de liquidez.
            </CardDescription>
          </CardHeader>
          {showBreakdown && (
            <CardContent className="border-t border-zinc-800 pt-4 space-y-6">
              {/* Ativos Líquidos Incluídos */}
              <div>
                <h4 className="text-sm font-bold text-emerald-500 mb-3 uppercase tracking-wider">
                  ✓ Ativos Incluídos (Total: {formatCurrencyBRL(kernelData.emergencyReserve.reserveAmount)})
                </h4>
                <div className="space-y-2">
                  {kernelData.emergencyReserve.liquidityAssets.accounts.map((a: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-emerald-950/10 border border-emerald-500/10">
                      <div>
                        <span className="font-semibold text-zinc-200">{a.name}</span>
                        <span className="ml-2 text-zinc-500 text-[10px] uppercase">({a.type})</span>
                      </div>
                      <span className="font-bold text-emerald-400">{formatCurrencyBRL(a.balance)}</span>
                    </div>
                  ))}
                  {kernelData.emergencyReserve.liquidityAssets.investments.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-emerald-950/10 border border-emerald-500/10">
                      <div>
                        <span className="font-semibold text-zinc-200">{i.name}</span>
                        <span className="ml-2 text-zinc-500 text-[10px] uppercase">({i.type})</span>
                      </div>
                      <span className="font-bold text-emerald-400">{formatCurrencyBRL(i.value)}</span>
                    </div>
                  ))}
                  {kernelData.emergencyReserve.liquidityAssets.accounts.length === 0 &&
                    kernelData.emergencyReserve.liquidityAssets.investments.length === 0 && (
                      <p className="text-xs text-zinc-500">Nenhum ativo líquido detectado.</p>
                    )}
                </div>
              </div>

              {/* Ativos Sem Liquidez Excluídos */}
              <div>
                <h4 className="text-sm font-bold text-amber-500 mb-3 uppercase tracking-wider">
                  ⚠ Ativos Excluídos do Cálculo de Reserva
                </h4>
                <div className="space-y-2">
                  {kernelData.emergencyReserve.excludedAssets.accounts.map((a: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs p-2.5 rounded-lg bg-zinc-900/50 border border-white/5 gap-1">
                      <div>
                        <span className="font-semibold text-zinc-300">{a.name}</span>
                        <span className="ml-2 text-zinc-500 text-[10px] uppercase">({a.type})</span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{a.reason}</p>
                      </div>
                      <span className="font-bold text-zinc-400 self-end sm:self-center">{formatCurrencyBRL(a.balance)}</span>
                    </div>
                  ))}
                  {kernelData.emergencyReserve.excludedAssets.investments.map((i: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs p-2.5 rounded-lg bg-zinc-900/50 border border-white/5 gap-1">
                      <div>
                        <span className="font-semibold text-zinc-300">{i.name}</span>
                        <span className="ml-2 text-zinc-500 text-[10px] uppercase">({i.type})</span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{i.reason}</p>
                      </div>
                      <span className="font-bold text-zinc-400 self-end sm:self-center">{formatCurrencyBRL(i.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Salvar e Histórico Local */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Salvar Simulação */}
        <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Salvar Cenário</CardTitle>
            <CardDescription className="text-zinc-400">Guarde os parâmetros de simulação atuais para rápida restauração posterior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da simulação (ex: Meta reduzida)"
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
            <CardDescription className="text-zinc-400">Simulações salvas no seu navegador.</CardDescription>
          </CardHeader>
          <CardContent>
            {savedSims.length > 0 ? (
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {savedSims.map((sim) => (
                  <div key={sim.id} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-xs">
                    <div>
                      <p className="font-bold text-zinc-200">{sim.name}</p>
                      <p className="text-[10px] text-zinc-500">{sim.date} • Gasto: R$ {sim.monthlyExpenses} ({sim.months}m)</p>
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
                Nenhum cenário salvo ainda. Use o painel ao lado para registrar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
