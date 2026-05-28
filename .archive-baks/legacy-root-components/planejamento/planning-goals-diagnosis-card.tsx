import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PlanningGoalsDiagnosisCardProps = {
  message: string;
  pressuredGoal?: any;
  biggestGoalExpense?: any;
  riskyGoalsCount: number;
  brl: (value: number) => string;
};

export function PlanningGoalsDiagnosisCard({
  message,
  pressuredGoal,
  biggestGoalExpense,
  riskyGoalsCount,
  brl,
}: PlanningGoalsDiagnosisCardProps) {
  return (
    <Card className="border-primary/30 bg-card/70">
      <CardHeader>
        <CardTitle>Diagnóstico das metas</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Meta mais pressionada</p>
          <p className="mt-1 text-lg font-bold">{pressuredGoal?.name || '-'}</p>
          <p className="text-xs text-muted-foreground">
            {pressuredGoal ? `${pressuredGoal.used.toFixed(1)}% utilizado` : 'Sem dados'}
          </p>
        </div>

        <div className="rounded-xl border bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Maior gasto por meta</p>
          <p className="mt-1 text-lg font-bold">{biggestGoalExpense?.name || '-'}</p>
          <p className="text-xs text-muted-foreground">
            {biggestGoalExpense ? brl(biggestGoalExpense.spent) : 'Sem dados'}
          </p>
        </div>

        <div className="rounded-xl border bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">Metas em atenção</p>
          <p className={riskyGoalsCount > 0 ? 'mt-1 text-lg font-bold text-yellow-400' : 'mt-1 text-lg font-bold text-emerald-500'}>
            {riskyGoalsCount}
          </p>
          <p className="text-xs text-muted-foreground">Fora da zona saudável</p>
        </div>
      </CardContent>
    </Card>
  );
}
