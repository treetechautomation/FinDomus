import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/core/finance/formatters";
import { formatCurrencyBRL } from "@/lib/utils";
import type { PFDRE } from "@/core/finance/dre-engine";
import type { PFWealthReport } from "@/core/finance/wealth-engine";
import { TrendingUp, Wallet, Landmark, ArrowUpRight, Award, Sparkles, BrainCircuit } from "lucide-react";

const formatCurrency = formatCurrencyBRL;

interface PfDreCardProps {
  dre: PFDRE;
  report?: PFWealthReport;
  freedomScore?: number;
  freedomScoreLabel?: string;
  aiInsights?: any[];
}

export function PfDreCard({ dre, report, freedomScore, freedomScoreLabel, aiInsights }: PfDreCardProps) {
  const getPilarBRL = (pilarName: string) => {
    const normalized = pilarName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace("de vida", "Vida")
      .replace("patrimonial", "")
      .replace(/\s+/g, "")
      .trim();
      
    const key = 
      normalized.includes("essencial") ? "essenciais" :
      normalized.includes("qualidade") ? "qualidadeVida" :
      normalized.includes("estilo") ? "estiloVida" :
      normalized.includes("educacao") ? "educacao" :
      normalized.includes("saude") ? "saude" :
      normalized.includes("construcao") || normalized.includes("patrimonio") ? "construcaoPatrimonial" :
      "outros";
      
    return (dre as any)[key] || 0;
  };

  const score = freedomScore !== undefined ? freedomScore : (report?.score ?? 0);
  const scoreLabel = freedomScoreLabel !== undefined ? freedomScoreLabel : (report?.scoreLabel ?? "");
  const insightsToRender = aiInsights && aiInsights.length > 0
    ? aiInsights.map(i => `${i.icon || '💡'} ${i.title}: ${i.description}`)
    : (report?.insights ?? []);

  return (
    <Card className="rounded-3xl border border-zinc-805 bg-zinc-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.02)] transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[#00beea]" />
              DRE Pessoal (PF)
            </CardTitle>
            <CardDescription className="text-zinc-500">Fluxo de competência pessoal em tempo real.</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Taxa de Acumulação</span>
            <div className="flex items-center gap-1.5 mt-1 bg-cyan-950/40 border border-cyan-800/30 text-[#00beea] font-bold px-3 py-1 rounded-full text-sm shadow-[0_0_15px_rgba(0,190,234,0.15)] animate-pulse">
              <Award className="w-4 h-4" />
              {formatPercent(dre.taxaAcumulacao)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`grid grid-cols-1 ${report ? 'lg:grid-cols-3' : ''} gap-6`}>
          <div className={`${report ? 'lg:col-span-2' : ''} space-y-6`}>
            <div className="space-y-4">
              {/* Receita Section */}
              <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ArrowUpRight className="w-5 h-5" />
                  <span className="font-semibold text-sm">Receita Total</span>
                </div>
                <span className="text-lg font-bold text-emerald-400">{formatCurrency(dre.receitaTotal)}</span>
              </div>

              {/* Despesas Breakdown */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/30">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Despesas Operacionais</h4>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Essenciais</span>
                  <span className="font-medium text-white">{formatCurrency(dre.essenciais)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Qualidade de Vida</span>
                  <span className="font-medium text-white">{formatCurrency(dre.qualidadeVida)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Estilo de Vida</span>
                  <span className="font-medium text-white">{formatCurrency(dre.estiloVida)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Educação</span>
                  <span className="font-medium text-white">{formatCurrency(dre.educacao)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Saúde</span>
                  <span className="font-medium text-white">{formatCurrency(dre.saude)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Outros</span>
                  <span className="font-medium text-white">{formatCurrency(dre.outros)}</span>
                </div>

                <div className="border-t border-zinc-800/80 pt-2.5 flex justify-between items-center text-sm font-bold mt-2">
                  <span className="text-zinc-300">Total Despesas Operacionais</span>
                  <span className="text-red-400">{formatCurrency(dre.despesasOperacionais)}</span>
                </div>
              </div>

              {/* Construção Patrimonial */}
              <div className="p-4 rounded-2xl bg-amber-950/10 border border-amber-500/10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold text-sm">Construção Patrimonial (Aportes/Investimentos)</span>
                </div>
                <span className="text-lg font-bold text-amber-400">{formatCurrency(dre.construcaoPatrimonial)}</span>
              </div>

              {/* Saldo Restante */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                  <Wallet className="w-5 h-5 text-zinc-400" />
                  <span className="font-semibold text-sm">Saldo Restante</span>
                </div>
                <span className={`text-lg font-bold ${dre.saldoRestante >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(dre.saldoRestante)}
                </span>
              </div>
            </div>

            {/* Tabela Meta x Realizado */}
            {report && (
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/30 space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-[#00beea]" />
                  Tabela Comparativa (Meta vs Realizado)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-bold">
                        <th className="py-2 pr-2">Pilar</th>
                        <th className="py-2 px-2 text-right">Realizado (R$)</th>
                        <th className="py-2 px-2 text-right">Meta %</th>
                        <th className="py-2 px-2 text-right">Real %</th>
                        <th className="py-2 pl-2 text-right">Desvio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/55">
                      {report.analysis.map((item, idx) => {
                        const valBRL = getPilarBRL(item.pilar);
                        const isGood = item.status === 'good';
                        const isWarning = item.status === 'warning';
                        
                        const statusColor = 
                          isGood ? 'text-emerald-400' :
                          isWarning ? 'text-amber-400' :
                          'text-red-400';

                        const desvioSign = item.diferencaPercent > 0 ? `+${item.diferencaPercent.toFixed(1)}%` : `${item.diferencaPercent.toFixed(1)}%`;

                        return (
                          <tr key={idx} className="hover:bg-zinc-800/10 transition-colors">
                            <td className="py-3 pr-2 font-medium text-zinc-300">{item.pilar}</td>
                            <td className="py-3 px-2 text-right font-medium text-white">{formatCurrency(valBRL)}</td>
                            <td className="py-3 px-2 text-right text-zinc-450 font-semibold">{item.metaPercent}%</td>
                            <td className="py-3 px-2 text-right text-zinc-300 font-semibold">{item.realizadoPercent}%</td>
                            <td className={`py-3 pl-2 text-right font-bold ${statusColor}`}>
                              {desvioSign}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Wealth Intelligence Panel */}
          {report && (
            <div className="space-y-6 lg:border-l lg:border-zinc-800/40 lg:pl-6">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 relative overflow-hidden">
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="50" className="stroke-zinc-800" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      stroke={
                        score >= 90 ? '#10b981' :
                        score >= 70 ? '#60a5fa' :
                        score >= 50 ? '#f59e0b' :
                        '#ef4444'
                      } 
                      strokeWidth="8" 
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 50} 
                      strokeDashoffset={2 * Math.PI * 50 - (score / 100) * (2 * Math.PI * 50)} 
                      strokeLinecap="round"
                      style={{ 
                        filter: `drop-shadow(0 0 6px ${
                          score >= 90 ? 'rgba(16,185,129,0.2)' :
                          score >= 70 ? 'rgba(96,165,250,0.2)' :
                          score >= 50 ? 'rgba(245,158,11,0.2)' :
                          'rgba(239,68,68,0.2)'
                        })` 
                      }} 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white">{score}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      score >= 90 ? 'text-emerald-400' :
                      score >= 70 ? 'text-blue-400' :
                      score >= 50 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>{scoreLabel}</span>
                  </div>
                </div>
                <span className="text-xs text-zinc-400 mt-4 font-semibold text-center">Score de Saúde Financeira PF</span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00beea]" />
                  Insights da IA Domus
                </h4>
                {insightsToRender.length > 0 ? (
                  <div className="space-y-2">
                    {insightsToRender.map((insight, idx) => {
                      const isError = insight.includes('🚨') || insight.includes('⚠️');
                      const isSuccess = insight.includes('🎉') || insight.includes('✅');
                      
                      let bgClass = "bg-zinc-900/30 border-zinc-800 text-zinc-300";
                      if (isError) bgClass = "bg-red-950/10 border-red-500/10 text-red-200";
                      else if (isSuccess) bgClass = "bg-emerald-950/10 border-emerald-500/10 text-emerald-200";

                      return (
                        <div key={idx} className={`p-3 rounded-xl border text-xs leading-relaxed flex gap-2.5 items-start ${bgClass}`}>
                          <span className="mt-0.5 flex-shrink-0">
                            {insight.includes('🚨') ? '🚨' : 
                             insight.includes('⚠️') ? '⚠️' : 
                             insight.includes('🎉') ? '🎉' : 
                             insight.includes('✅') ? '✅' : '💡'}
                          </span>
                          <span>
                            {insight.replace(/^(🚨|⚠️|🎉|✅|💡)\s*/, '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 text-zinc-400 text-xs text-center">
                    Sem alertas ativos. Seu comportamento financeiro está totalmente alinhado com suas metas!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
