import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Play, Flame, ShieldAlert, AlertCircle, Compass } from 'lucide-react';
import { type ActionPlanItem } from '@/core/finance/freedom-engine';

type Props = {
  items: ActionPlanItem[];
};

export function NextActionsList({ items }: Props) {
  const secondaryActions = items.slice(1);

  if (secondaryActions.length === 0) return null;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Crítica': return <Flame className="h-3.5 w-3.5" />;
      case 'Alta': return <ShieldAlert className="h-3.5 w-3.5" />;
      case 'Média': return <AlertCircle className="h-3.5 w-3.5" />;
      default: return <Compass className="h-3.5 w-3.5" />;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Crítica': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Alta': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Média': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700/50';
    }
  };

  return (
    <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.01)] transition-all duration-300 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent pointer-events-none" />
      <CardHeader className="pb-3">
        <CardTitle className="text-zinc-400 text-xs font-semibold tracking-wider flex items-center gap-2 uppercase">
          ⚡ Próximas Ações Recomendadas
        </CardTitle>
        <CardDescription className="text-[10px] text-zinc-500">
          Passos adicionais priorizados para continuar subindo seu score patrimonial.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {secondaryActions.map((action, idx) => (
          <div 
            key={idx} 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`flex items-center gap-1 py-0 px-2 text-[10px] font-bold ${getPriorityBadgeClass(action.priority)}`}>
                  {getPriorityIcon(action.priority)}
                  {action.priority}
                </Badge>
                <Badge className="bg-zinc-900/60 text-zinc-400 border-zinc-900 text-[10px]">
                  Esforço: {action.effort}
                </Badge>
                <Badge className="bg-emerald-950/30 text-emerald-400 border-emerald-900/30 text-[10px] font-semibold">
                  +{action.impactPts} pts
                </Badge>
              </div>

              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-white leading-tight">
                  {action.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="text-[10px] text-zinc-500 font-medium">
                Impacto esperado: <strong className="text-zinc-300">{action.impactR$}</strong>
              </div>
            </div>

            <Link href={action.href} className="flex-shrink-0 self-end sm:self-center">
              <button className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white transition-all duration-300 group/btn">
                <span>{action.cta}</span>
                <Play className="h-3 w-3 fill-white text-white group-hover/btn:translate-x-0.5 transition-transform duration-300" />
              </button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
