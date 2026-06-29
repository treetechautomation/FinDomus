import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type FreedomTimeline as TimelineType } from '@/core/finance/freedom-engine';
import { Check } from 'lucide-react';

type Props = {
  timeline: TimelineType;
};

export function FreedomTimeline({ timeline }: Props) {
  const milestones = timeline.milestones || [];

  return (
    <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.02)] transition-all duration-300 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent pointer-events-none" />
      <CardHeader className="pb-4">
        <CardTitle className="text-zinc-400 text-xs font-semibold tracking-wider flex items-center gap-2 uppercase">
          📅 Linha do Tempo da Emancipação Financeira
        </CardTitle>
        <CardDescription className="text-[10px] text-zinc-500">
          Marcos temporais projetados com base no seu saldo, passivos e ritmo de acumulação atual.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-6">
        <div className="relative pl-6 space-y-6">
          {/* Linha vertical conectora */}
          <div className="absolute top-2 bottom-2 left-[13px] w-0.5 bg-zinc-900" />

          {milestones.map((ms, idx) => {
            const completed = ms.completed;

            return (
              <div key={idx} className="relative flex gap-4 items-start group/item">
                {/* Indicador de Status */}
                <div className={`absolute -left-[25px] flex items-center justify-center h-7 w-7 rounded-xl border transition-all duration-500 z-10 ${
                  completed 
                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                }`}>
                  {completed ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : (
                    <span className="text-xs font-bold leading-none">{ms.icon}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 bg-zinc-950/20 border border-zinc-900/60 rounded-2xl p-3 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white truncate">
                        {ms.label}
                      </span>
                      {completed && (
                        <span className="text-[8px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/20 rounded-md px-1.5 py-0.2 font-bold uppercase shrink-0">
                          Concluído
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed truncate max-w-[480px]">
                      {ms.description}
                    </p>
                  </div>

                  <div className={`text-right shrink-0 py-1 px-3 rounded-xl border text-xs font-extrabold tracking-tight ${
                    completed
                      ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30'
                      : 'bg-zinc-900/60 text-zinc-300 border-zinc-800'
                  }`}>
                    {ms.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
