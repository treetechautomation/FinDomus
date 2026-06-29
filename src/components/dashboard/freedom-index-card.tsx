import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Info, EyeOff } from 'lucide-react';
import { type FreedomIndexResult } from '@/core/finance/freedom-engine';
import { FreedomIndexExplainer } from './freedom-index-explainer';
import { useVisibility } from '@/providers/visibility-provider';

type Props = {
  result: FreedomIndexResult;
};

export function FreedomIndexCard({ result }: Props) {
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const { showFinancialValues } = useVisibility();
  
  const score = result.freedomIndex;
  
  const getStrokeColor = (val: number) => {
    if (val >= 95) return '#3b82f6'; // blue
    if (val >= 80) return '#10b981'; // emerald
    if (val >= 60) return '#22c55e'; // green
    if (val >= 40) return '#f59e0b'; // amber
    if (val >= 20) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const strokeColor = getStrokeColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const pointsToNext = score >= 95 ? 0 : 
                       score >= 80 ? 95 - score : 
                       score >= 60 ? 80 - score : 
                       score >= 40 ? 60 - score : 
                       score >= 20 ? 40 - score : 20 - score;

  const nextLevelName = score >= 95 ? 'Independência Total' : 
                        score >= 80 ? 'Liberdade' : 
                        score >= 60 ? 'Crescimento' : 
                        score >= 40 ? 'Construção' : 
                        score >= 20 ? 'Estabilidade' : 'Organização';

  const pillars = [
    { label: 'Dívidas', value: result.breakdown.debtPayoffPercent, weight: '25%', desc: 'Porcentagem de quitação de dívidas contratadas.' },
    { label: 'Margem Caixa', value: result.breakdown.incomeFreedomPercent, weight: '20%', desc: 'Porcentagem da sua renda livre de parcelamentos.' },
    { label: 'Reserva', value: result.breakdown.emergencyReservePercent, weight: '15%', desc: 'Progresso da sua reserva de emergência de 6 meses.' },
    { label: 'Patrimônio', value: result.breakdown.netWorthPercent, weight: '15%', desc: 'Net worth comparado à meta de 1 ano de renda.' },
    { label: 'Aportes', value: result.breakdown.investmentRatePercent, weight: '10%', desc: 'Taxa de poupança mensal vs meta de 30%.' },
    { label: 'Renda Passiva', value: result.breakdown.passiveIncomePercent, weight: '10%', desc: 'Estimativa de rendimento cobrindo seu custo de vida.' },
    { label: 'Diversificação', value: result.breakdown.diversificationNormalized, weight: '5%', desc: 'Variedade de ativos (meta: 5+ classes/títulos).' },
  ];

  return (
    <>
      <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.02)] transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
        
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-zinc-400 text-xs font-semibold tracking-wider flex items-center gap-2 uppercase">
            🌳 ÍNDICE DE LIBERDADE FINANCEIRA
          </CardTitle>
          <button 
            onClick={() => setIsExplainerOpen(true)}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 p-1 px-2 rounded-lg bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 transition-all duration-300"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Entenda o Índice
          </button>
        </CardHeader>
        
        <CardContent className="space-y-5 py-2 flex-1 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Círculo de Score */}
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle 
                  cx="64" 
                  cy="64" 
                  r={radius} 
                  className="stroke-slate-800/40" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <circle 
                  cx="64" 
                  cy="64" 
                  r={radius} 
                  stroke={strokeColor} 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{ 
                    filter: `drop-shadow(0 0 6px ${strokeColor}30)` 
                  }} 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white tracking-tight">
                  {showFinancialValues ? score : '••'}
                </span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Pontos</span>
              </div>
            </div>

            {/* Progresso de Níveis */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xl font-black tracking-tight text-white">
                    Nível {result.levelLabel}
                  </span>
                  <Badge className="bg-zinc-900 text-zinc-300 border-zinc-800 flex items-center gap-1 py-0 px-2 text-[10px] font-bold">
                    <span>{result.levelIcon}</span>
                    <span>{result.levelLabel}</span>
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 max-w-[380px] leading-relaxed">
                  Você conquistou <strong className="text-white">{score}%</strong> da sua emancipação.
                  {pointsToNext > 0 ? (
                    <span> Faltam <strong className="text-cyan-400">{pointsToNext} pontos</strong> para subir ao nível <strong className="text-zinc-200">{nextLevelName}</strong>.</span>
                  ) : (
                    <span> Você atingiu a independência financeira máxima! 🎉</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Listagem de 7 Pilares de Cálculo */}
          <div className="space-y-2 pt-2">
            <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider pl-0.5">
              Breakdown dos 7 Pilares de Independência:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {pillars.map((p, idx) => (
                <div 
                  key={idx} 
                  title={`${p.label} (Peso ${p.weight}): ${p.desc}`}
                  className="bg-zinc-950/60 border border-zinc-900/60 rounded-xl p-2 flex flex-col justify-between hover:border-zinc-800 hover:bg-zinc-900/10 cursor-help transition-all duration-300 group/item relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-zinc-400 font-bold truncate tracking-wide">
                      {p.label}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-medium shrink-0">
                      p. {p.weight}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-1.5 gap-1.5">
                    <span className="text-sm font-extrabold text-white">
                      {showFinancialValues ? `${p.value}%` : '••%'}
                    </span>
                    {/* Indicador visual de progresso */}
                    <div className="h-1.5 w-1.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: getStrokeColor(p.value) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <FreedomIndexExplainer 
        isOpen={isExplainerOpen} 
        onClose={() => setIsExplainerOpen(false)} 
      />
    </>
  );
}
