import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PlanningInvestmentOpportunityCardProps = {
  investmentSuggestion: any;
  availableToInvest: number;
  brl: (value: number) => string;
};

export function PlanningInvestmentOpportunityCard({
  investmentSuggestion,
  availableToInvest,
  brl,
}: PlanningInvestmentOpportunityCardProps) {
  if (!investmentSuggestion) return null;

  return (
    <Card className="border-emerald-500/30 bg-card/70">
      <CardHeader>
        <CardTitle>💰 Oportunidade financeira</CardTitle>
        <CardDescription>Uso inteligente do saldo disponível no mês</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-semibold">
          Saldo disponível: {brl(availableToInvest)}
        </p>
        <p className="text-xs text-muted-foreground">{investmentSuggestion.message}</p>
      </CardContent>
    </Card>
  );
}
