import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type FreedomTimeline as TimelineType } from '@/core/finance/freedom-engine';
import { Check } from 'lucide-react';
import { useState } from 'react';

type Props = {
  timeline: TimelineType;
};

export function FreedomTimeline({ timeline }: Props) {
  const milestones = timeline.milestones || [];
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number | null>(null);

  return (
    <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.02)] transition-all duration-300 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent pointer-events-none" />
      <CardHeader className="pb-4">
        <CardTitle className="text-zinc-400 text-xs font-semibold tracking-wider flex items-center gap-2 uppercase">
          📅 Linha do Tempo da Emancipação Financeira
        </CardTitle>
        <CardDescription className="text-[10px] text-zinc-500">
          Marcos temporais projetados. Clique em qualquer card para ver a auditoria de cálculo da engine.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-6">
        <div className="relative pl-6 space-y-6">
          {/* Linha vertical conectora */}
          <div className="absolute top-2 bottom-2 left-[13px] w-0.5 bg-zinc-900" />

          {milestones.map((ms: any, idx) => {
            const completed = ms.completed;

            return (
              <div key={idx} className="relative flex flex-col group/item">
                <div 
                  onClick={() => setSelectedMilestoneIdx(selectedMilestoneIdx === idx ? null : idx)}
                  className="flex gap-4 items-start cursor-pointer w-full"
                >
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

                  <div className={`flex-1 min-w-0 bg-zinc-950/20 border border-zinc-900/60 rounded-2xl p-3 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${selectedMilestoneIdx === idx ? 'border-cyan-500/30 bg-cyan-950/5' : ''}`}>
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

                {/* Calculation audit details */}
                {selectedMilestoneIdx === idx && ms.explainability && (
                  <div className="mt-3 ml-0 sm:ml-4 p-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/10 text-xs text-zinc-300 space-y-3 animate-in slide-in-from-top-2 duration-300 w-full">
                    <div className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                      <span className="font-bold text-cyan-400">📍 Auditoria do Cálculo: {ms.label}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMilestoneIdx(null);
                        }}
                        className="text-zinc-500 hover:text-zinc-300 font-extrabold text-[10px] uppercase tracking-wider"
                      >
                        Fechar
                      </button>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">🧮 Variáveis Utilizadas</span>
                        <div className="space-y-1">
                          {Object.entries(ms.explainability.variablesUsed).map(([key, item]: any) => (
                            <div key={key} className="flex justify-between items-center bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900/60">
                              <span className="text-zinc-400 font-mono text-[10px]">{key}</span>
                              <span className="font-bold text-white text-[10px]">
                                {typeof item.value === 'number' ? item.value.toLocaleString('pt-BR') : item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">⚙️ Engines Envolvidas</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ms.explainability.enginesUsed.map((engine: string) => (
                            <span key={engine} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-cyan-300">
                              {engine}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-cyan-500/10 space-y-1">
                      <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest">📐 Modelo de Cálculo</span>
                      <p className="italic text-zinc-400 font-mono text-[10px]">{ms.explainability.formula}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
