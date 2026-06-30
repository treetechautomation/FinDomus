import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowUpRight, Compass } from 'lucide-react';
import { type ActionPlanItem } from '@/core/finance/freedom-engine';

type Props = {
  actions: ActionPlanItem[];
  brl: (value: number) => string;
};

export function PlanningInvestmentOpportunityCard({ actions, brl }: Props) {
  // O ActionPlanItem do freedom-engine não possui a propriedade "completed",
  // vamos listar todos ou filtrar os que têm href/cta relevantes.
  const activeActions = actions;

  return (
    <Card className="border-cyan-500/20 bg-zinc-950/20 backdrop-blur-md">
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
          <Compass className="h-4 w-4 text-emerald-400" />
          Plano de Ação e Oportunidades
        </CardTitle>
        <CardDescription className="text-zinc-500 text-xs mt-1">
          Ações recomendadas com base nas suas prioridades patrimoniais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        {activeActions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-zinc-400">Nenhuma ação recomendada pendente. Parabéns!</p>
            <Link href="/investimentos/calculadoras" className="text-[10px] text-cyan-400 mt-2 hover:underline inline-flex items-center gap-0.5">
              Explorar simuladores financeiros <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {activeActions.slice(0, 3).map((action, idx) => (
              <div key={idx} className="p-3 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col justify-between md:flex-row md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      action.priority === 'Crítica' ? 'bg-red-950/40 text-red-400 border border-red-900/30' :
                      action.priority === 'Alta' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                      'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {action.priority}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Impacto: <strong className="text-emerald-500">{action.impactR$}</strong> (+{action.impactPts} pts)
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-1.5">{action.title}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-light">{action.description}</p>
                </div>
                {action.href && (
                  <Link href={action.href} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold border border-zinc-800 rounded-lg px-2.5 py-1.5 bg-zinc-900 flex-shrink-0 text-center flex items-center justify-center gap-1">
                    {action.cta || 'Resolver'}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-2 text-center">
              <Link href="/investimentos/calculadoras" className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-0.5">
                Simular cenários no Laboratório de Decisões <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
