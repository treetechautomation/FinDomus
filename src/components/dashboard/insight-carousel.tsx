import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Compass, TrendingUp, RefreshCw, Tv, Lightbulb } from 'lucide-react';
import { type FinancialAIInsight } from '@/core/finance/financial-ai-engine';

type Props = {
  insights: FinancialAIInsight[];
};

export function InsightCarousel({ insights }: Props) {
  if (!insights || insights.length === 0) return null;

  const getStyle = (type: string) => {
    switch (type) {
      case 'alert':
        return {
          bg: 'bg-rose-500/[0.03] hover:bg-rose-500/[0.06]',
          border: 'border-rose-500/10 hover:border-rose-500/20',
          iconColor: 'text-rose-400',
          icon: AlertTriangle,
          badge: 'Aviso Importante',
        };
      case 'behavior':
        return {
          bg: 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]',
          border: 'border-amber-500/10 hover:border-amber-500/20',
          iconColor: 'text-amber-400',
          icon: Compass,
          badge: 'Hábito & Finanças',
        };
      case 'forecast':
        return {
          bg: 'bg-purple-500/[0.03] hover:bg-purple-500/[0.06]',
          border: 'border-purple-500/10 hover:border-purple-500/20',
          iconColor: 'text-purple-400',
          icon: TrendingUp,
          badge: 'Projeção de Futuro',
        };
      case 'recurrence':
        return {
          bg: 'bg-blue-500/[0.03] hover:bg-blue-500/[0.06]',
          border: 'border-blue-500/10 hover:border-blue-500/20',
          iconColor: 'text-blue-400',
          icon: RefreshCw,
          badge: 'Recorrência Detectada',
        };
      default:
        return {
          bg: 'bg-cyan-500/[0.03] hover:bg-cyan-500/[0.06]',
          border: 'border-cyan-500/10 hover:border-cyan-500/20',
          iconColor: 'text-cyan-400',
          icon: Tv,
          badge: 'Assinatura Ativa',
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pl-1">
        <Lightbulb className="h-4.5 w-4.5 text-cyan-400 animate-bounce" />
        <span className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">
          💡 Recomendações & Copiloto IA
        </span>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-3 pt-0.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {insights.map((insight, idx) => {
          const cfg = getStyle(insight.type);
          const Icon = cfg.icon;

          return (
            <Card 
              key={idx}
              className={`flex-shrink-0 w-[290px] sm:w-[320px] rounded-2xl border ${cfg.border} ${cfg.bg} backdrop-blur-sm transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]`}
            >
              <CardContent className="p-4 flex gap-3.5 h-full min-h-[110px] items-start">
                <div className={`p-2 rounded-xl bg-zinc-950/70 border border-zinc-900 ${cfg.iconColor} shadow-inner`}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="space-y-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${cfg.iconColor}`}>
                    {cfg.badge}
                  </span>
                  <h4 className="text-xs font-extrabold text-white tracking-tight leading-snug">
                    {insight.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                    {insight.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
