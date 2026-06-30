import React, { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { runSimulation, type SimulationResult, type SimulationScenario } from '@/core/finance/simulation-engine';
import { findOptimalStrategy } from '@/core/finance/optimizer';
import { type KernelContext, type KernelResult } from '@/core/finance/kernel';
import { TrendingUp, TrendingDown, Landmark, Sparkles, Scale, Percent, Wallet, Calendar } from 'lucide-react';

// Fallback clean card component if ui/card not globally matching or for ease
function SimCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md p-6 ${className}`}>
      {children}
    </div>
  );
}

export function ScenarioComparator({
  context,
  baseline,
}: {
  context: KernelContext;
  baseline: KernelResult;
}) {
  const [activeScenarioType, setActiveScenarioType] = useState<'payoff_debt' | 'new_investment' | 'expense_reduction'>('payoff_debt');
  
  // States for scenarios
  const [selectedLiabilityId, setSelectedLiabilityId] = useState<string>('');
  const [payoffAmount, setPayoffAmount] = useState<number>(1000);
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(500);
  const [monthlyReduction, setMonthlyReduction] = useState<number>(300);

  const liabilities = context.liabilities || [];
  const idleCash = context.accounts
    .filter((a: any) => a.owner === 'PF')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  // Set initial liability if none selected
  React.useEffect(() => {
    if (liabilities.length > 0 && !selectedLiabilityId) {
      setSelectedLiabilityId(liabilities[0].id || '');
    }
  }, [liabilities, selectedLiabilityId]);

  // Compute active simulation
  const simulation: SimulationResult | null = useMemo(() => {
    let scenario: SimulationScenario;

    if (activeScenarioType === 'payoff_debt') {
      const selected = liabilities.find(l => l.id === selectedLiabilityId);
      const name = selected ? selected.name : 'Dívida';
      scenario = {
        type: 'payoff_debt',
        params: { liabilityId: selectedLiabilityId, amount: payoffAmount },
        label: `Quitar R$ ${payoffAmount.toLocaleString('pt-BR')} de ${name}`,
      };
    } else if (activeScenarioType === 'new_investment') {
      scenario = {
        type: 'new_investment',
        params: { monthlyAmount: monthlyInvestment },
        label: `Investir R$ ${monthlyInvestment.toLocaleString('pt-BR')} mensais`,
      };
    } else {
      scenario = {
        type: 'expense_reduction',
        params: { monthlyReduction },
        label: `Reduzir R$ ${monthlyReduction.toLocaleString('pt-BR')} em gastos recorrentes`,
      };
    }

    try {
      return runSimulation(context, baseline, scenario);
    } catch (err) {
      console.error('[ScenarioComparator] Simulation error', err);
      return null;
    }
  }, [activeScenarioType, selectedLiabilityId, payoffAmount, monthlyInvestment, monthlyReduction, context, baseline]);

  // Run Optimizer for recommendations
  const recommendations = useMemo(() => {
    try {
      return findOptimalStrategy(context, baseline);
    } catch (err) {
      console.error('[ScenarioComparator] Optimizer error', err);
      return null;
    }
  }, [context, baseline]);

  const targetLiability = liabilities.find(l => l.id === selectedLiabilityId);
  const maxPayoff = targetLiability ? Math.min(idleCash, Number(targetLiability.remainingBalance || 0)) : idleCash;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="h-6 w-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white tracking-tight">Simulador de Cenários Lado a Lado</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Side: Simulation Customizer & Results */}
        <div className="space-y-6">
          <SimCard>
            <div className="flex border-b border-zinc-800 pb-3 mb-6 gap-2">
              <Button
                variant={activeScenarioType === 'payoff_debt' ? 'default' : 'ghost'}
                onClick={() => setActiveScenarioType('payoff_debt')}
                className="rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider"
              >
                💳 Quitar Dívida
              </Button>
              <Button
                variant={activeScenarioType === 'new_investment' ? 'default' : 'ghost'}
                onClick={() => setActiveScenarioType('new_investment')}
                className="rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider"
              >
                📈 Aporte Mensal
              </Button>
              <Button
                variant={activeScenarioType === 'expense_reduction' ? 'default' : 'ghost'}
                onClick={() => setActiveScenarioType('expense_reduction')}
                className="rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider"
              >
                ✂️ Cortar Gastos
              </Button>
            </div>

            {/* Payoff Debt Controller */}
            {activeScenarioType === 'payoff_debt' && (
              <div className="space-y-4">
                {liabilities.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    Nenhuma obrigação ou dívida cadastrada para simulação.
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Selecione o passivo</label>
                        <select
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                          value={selectedLiabilityId}
                          onChange={(e) => setSelectedLiabilityId(e.target.value)}
                        >
                          {liabilities.map((l: any) => (
                            <option key={l.id} value={l.id}>
                              {l.name} (Saldo: {formatCurrency(l.remainingBalance)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Saldo disponível para pagar</label>
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-bold text-emerald-400">
                          {formatCurrency(idleCash)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">VALOR A AMORTIZAR</span>
                        <span className="text-cyan-400 font-bold">{formatCurrency(payoffAmount)}</span>
                      </div>
                      <Slider
                        defaultValue={[payoffAmount]}
                        value={[payoffAmount]}
                        max={Math.max(1000, maxPayoff)}
                        min={0}
                        step={100}
                        onValueChange={(val) => setPayoffAmount(val[0])}
                        className="py-4"
                      />
                      <p className="text-[10px] text-zinc-500">
                        * Limitado ao menor valor entre o saldo devedor do passivo selecionado e sua liquidez total disponível em conta.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* New Investment Controller */}
            {activeScenarioType === 'new_investment' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-400">VALOR APORTADO MENSALMENTE</span>
                    <span className="text-cyan-400 font-bold">{formatCurrency(monthlyInvestment)}/mês</span>
                  </div>
                  <Slider
                    defaultValue={[monthlyInvestment]}
                    value={[monthlyInvestment]}
                    max={10000}
                    min={100}
                    step={100}
                    onValueChange={(val) => setMonthlyInvestment(val[0])}
                    className="py-4"
                  />
                  <p className="text-[10px] text-zinc-500">
                    * Simula um aporte recorrente em ativos de liquidez básica gerando proventos sobre a carteira.
                  </p>
                </div>
              </div>
            )}

            {/* Expense Reduction Controller */}
            {activeScenarioType === 'expense_reduction' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-400">VALOR A CORTAR MENSALMENTE</span>
                    <span className="text-cyan-400 font-bold">{formatCurrency(monthlyReduction)}/mês</span>
                  </div>
                  <Slider
                    defaultValue={[monthlyReduction]}
                    value={[monthlyReduction]}
                    max={3000}
                    min={50}
                    step={50}
                    onValueChange={(val) => setMonthlyReduction(val[0])}
                    className="py-4"
                  />
                  <p className="text-[10px] text-zinc-500">
                    * Simula a otimização de assinaturas ou cortes supérfluos, liberando margem de superávit para a reserva.
                  </p>
                </div>
              </div>
            )}
          </SimCard>

          {/* Results Side-by-Side Comparison */}
          {simulation && (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Today Card */}
              <div className="rounded-3xl border border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Estado Atual</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Índice</span>
                    <span className="text-2xl font-black text-white">{baseline.freedom.index.freedomIndex}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Patrimônio</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(baseline.financialCore.netWorth)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Dívidas</span>
                    <span className="text-sm font-bold text-zinc-300">
                      {formatCurrency(
                        context.liabilities.reduce((s, l) => s + Number(l.remainingBalance || 0), 0)
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Reserva</span>
                    <span className="text-sm font-bold text-zinc-300">{baseline.freedom.index.breakdown.emergencyReservePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Simulation Result Card */}
              <div className="rounded-3xl border border-cyan-500/20 bg-cyan-950/10 p-5 space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent pointer-events-none" />
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Cenário Simulado
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Índice</span>
                    <span className="text-2xl font-black text-white">
                      {simulation.kernelResult.freedom.index.freedomIndex}
                      {(() => {
                        const delta = simulation.kernelResult.freedom.index.freedomIndex - baseline.freedom.index.freedomIndex;
                        if (delta > 0) return <span className="text-emerald-400 text-xs ml-1 font-bold">▲ +{delta}</span>;
                        if (delta < 0) return <span className="text-rose-400 text-xs ml-1 font-bold">▼ {delta}</span>;
                        return null;
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Patrimônio</span>
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(simulation.kernelResult.financialCore.netWorth)}
                      {(() => {
                        const delta = simulation.kernelResult.financialCore.netWorth - baseline.financialCore.netWorth;
                        if (delta > 0) return <span className="block text-[10px] text-emerald-400 font-bold">+{formatCurrency(delta)}</span>;
                        if (delta < 0) return <span className="block text-[10px] text-rose-400 font-bold">{formatCurrency(delta)}</span>;
                        return null;
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Dívidas</span>
                    <span className="text-sm font-bold text-zinc-300">
                      {formatCurrency(
                        simulation.kernelResult.freedom.actions.reduce((s, a) => s, 0) || // Fallback
                        (activeScenarioType === 'payoff_debt' && targetLiability
                          ? Math.max(0, context.liabilities.reduce((s, l) => s + Number(l.remainingBalance || 0), 0) - payoffAmount)
                          : context.liabilities.reduce((s, l) => s + Number(l.remainingBalance || 0), 0))
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Reserva</span>
                    <span className="text-sm font-bold text-zinc-300">
                      {simulation.kernelResult.freedom.index.breakdown.emergencyReservePercent}%
                      {(() => {
                        const delta = simulation.kernelResult.freedom.index.breakdown.emergencyReservePercent - baseline.freedom.index.breakdown.emergencyReservePercent;
                        if (delta > 0) return <span className="text-emerald-400 text-xs ml-1 font-bold">▲ +{delta}%</span>;
                        if (delta < 0) return <span className="text-rose-400 text-xs ml-1 font-bold">▼ {delta}%</span>;
                        return null;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: IA Optimizer Recommendation Panel */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> RECOMENDAÇÃO DA IA
            </h3>

            {recommendations && recommendations.opportunities.length > 0 ? (
              <div className="space-y-3 pt-2">
                {recommendations.opportunities.map((opp, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-xs leading-relaxed text-zinc-300 space-y-1">
                    <span className="font-extrabold text-amber-400 text-[10px] uppercase block tracking-wider">Oportunidade {idx + 1}</span>
                    <p>{opp.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nenhuma anomalia de juros ou liquidez ociosa identificada. Suas alocações básicas parecem equilibradas.
              </p>
            )}

            {recommendations && recommendations.topStrategies.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Top 3 Estratégias Recomendadas</span>
                <div className="space-y-2">
                  {recommendations.topStrategies.map((strat, idx) => {
                    const indexGain = strat.diff.find(d => d.metric === 'Índice de Liberdade')?.delta || 0;
                    return (
                      <div key={idx} className="p-3 rounded-xl border border-zinc-900 bg-zinc-950 hover:bg-zinc-900/60 transition-all duration-300 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">{strat.scenario.label}</span>
                          <span className="text-[10px] text-zinc-500">Ganho estimado no Índice</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold">
                          +{indexGain} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ScenarioComparator;
