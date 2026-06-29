import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Target, ArrowRight, Zap, Flame, ShieldAlert, AlertCircle, Compass } from 'lucide-react';
import { type ActionPlanItem } from '@/core/finance/freedom-engine';

type Props = {
  item: ActionPlanItem;
};

export function NextBestAction({ item }: Props) {
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
    <Card className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-950 to-emerald-950/20 shadow-[0_0_50px_rgba(16,185,129,0.03)] backdrop-blur-md transition-all duration-300 relative group overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none" />
      
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-emerald-400 text-xs font-semibold tracking-wider flex items-center gap-2 uppercase">
            <Target className="h-4 w-4 text-emerald-400 animate-pulse" />
            Sua Próxima Melhor Ação
          </CardTitle>
          <CardDescription className="text-[10px] text-zinc-500 mt-0.5">
            Ação prioritária recomendada para elevar seu Índice de Liberdade.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`flex items-center gap-1 py-0.5 px-2 text-[10px] font-bold ${getPriorityBadgeClass(item.priority)}`}>
              {getPriorityIcon(item.priority)}
              {item.priority}
            </Badge>
            <Badge className="bg-emerald-950/40 text-emerald-400 border-emerald-900/35 text-[10px] font-extrabold flex items-center gap-1">
              <Zap className="h-3 w-3 fill-emerald-400 text-emerald-400" />
              +{item.impactPts} pontos no índice
            </Badge>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-white leading-snug">
              {item.title}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {item.description}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] text-xs text-zinc-300 flex items-center justify-between">
            <span className="text-zinc-500 font-medium">Impacto financeiro:</span>
            <span className="font-extrabold text-emerald-400">{item.impactR$}</span>
          </div>

          <Link href={item.href} className="block w-full">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.35)] group-hover:scale-[1.01]">
              <span>{item.cta} agora</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
