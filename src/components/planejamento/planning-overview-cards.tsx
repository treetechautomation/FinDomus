import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PlanningOverviewCardsProps = {
  monthlyIncome: number;
  totalOutflow: number;
  monthlyRecurring: number;
  monthlyLiabilities: number;
  financialHealthClass: string;
  financialHealthStatus: string;
  commitmentPercent: number;
  brl: (value: number) => string;
};

export function PlanningOverviewCards({
  monthlyIncome,
  totalOutflow,
  monthlyRecurring,
  monthlyLiabilities,
  financialHealthClass,
  financialHealthStatus,
  commitmentPercent,
  brl,
}: PlanningOverviewCardsProps) {
  const plannedBalance = monthlyIncome - totalOutflow;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <Card className="border-primary/40 bg-card/70">
        <CardHeader>
          <CardDescription>Receita do mês</CardDescription>
          <CardTitle className="text-2xl text-primary">{brl(monthlyIncome)}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-red-500/40 bg-card/70">
        <CardHeader>
          <CardDescription>Total comprometido</CardDescription>
          <CardTitle className="text-2xl text-red-400">{brl(totalOutflow)}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-yellow-500/40 bg-card/70">
        <CardHeader>
          <CardDescription>Fixos recorrentes</CardDescription>
          <CardTitle className="text-2xl text-yellow-400">{brl(monthlyRecurring)}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-orange-500/40 bg-card/70">
        <CardHeader>
          <CardDescription>Parcelas</CardDescription>
          <CardTitle className="text-2xl text-orange-400">{brl(monthlyLiabilities)}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-emerald-500/40 bg-card/70">
        <CardHeader>
          <CardDescription>Saldo planejado</CardDescription>
          <CardTitle className={plannedBalance >= 0 ? 'text-2xl text-emerald-500' : 'text-2xl text-red-500'}>
            {brl(plannedBalance)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-primary/40 bg-card/70">
        <CardHeader>
          <CardDescription>Saúde financeira</CardDescription>
          <CardTitle className={`text-2xl ${financialHealthClass}`}>
            {financialHealthStatus}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {commitmentPercent.toFixed(1)}% da renda comprometida
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}
