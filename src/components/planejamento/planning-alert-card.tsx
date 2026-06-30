import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

type Props = {
  insights: any[];
  freedomIndex: number;
};

export function PlanningAlertCard({ insights, freedomIndex }: Props) {
  const visibleInsights = insights.slice(0, 3);

  return (
    <Card className="border-cyan-500/20 bg-zinc-950/20 backdrop-blur-md">
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Alertas e Recomendações Inteligentes
        </CardTitle>
        <CardDescription className="text-zinc-500 text-xs mt-1">
          Garantia e análise cognitiva com base no seu nível de Liberdade Financeira ({freedomIndex} pts).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        {visibleInsights.length === 0 ? (
          <p className="text-xs text-zinc-400">Nenhum alerta pendente para este mês. Seu planejamento está alinhado!</p>
        ) : (
          visibleInsights.map((insight, idx) => (
            <div key={idx} className="flex gap-2.5 p-3 rounded-2xl border border-zinc-900 bg-zinc-950/40">
              <span className="text-base flex-shrink-0 mt-0.5">{insight.icon || '💡'}</span>
              <div>
                <p className="text-xs text-zinc-300 font-semibold">{insight.title}</p>
                <p className="text-[11px] text-zinc-400 mt-1 font-light">{insight.description}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
