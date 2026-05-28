import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PlanningGoalRecommendationCardProps = {
  pressuredGoal?: any;
  brl: (value: number) => string;
};

export function PlanningGoalRecommendationCard({
  pressuredGoal,
  brl,
}: PlanningGoalRecommendationCardProps) {
  return (
    <Card className="border-primary/30 bg-card/70">
      <CardHeader>
        <CardTitle>Recomendação automática por meta</CardTitle>
        <CardDescription>
          Análise baseada na meta mais pressionada e nos principais impactos do mês.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Meta analisada</p>
          <p className="mt-1 text-xl font-bold">{pressuredGoal?.name || '-'}</p>
          <p className="text-sm text-muted-foreground">
            Planejado: {pressuredGoal ? brl(pressuredGoal.planned) : '-'} • Gasto: {pressuredGoal ? brl(pressuredGoal.spent) : '-'}
          </p>
          <p className="mt-2 text-sm font-semibold">
            Status: {pressuredGoal?.status || '-'}
          </p>
          <p className="mt-3 text-sm">
            {pressuredGoal?.recommendation || 'Sem dados suficientes para recomendação.'}
          </p>
        </div>

        <div className="rounded-xl border bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Principais impactos</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(pressuredGoal?.impacts || []).length ? (
              pressuredGoal.impacts.map((impact: any) => (
                <span key={impact.name} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {impact.name}: {brl(impact.value)}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Sem impactos identificados.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
