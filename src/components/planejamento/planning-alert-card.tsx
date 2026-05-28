import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PlanningAlertCardProps = {
  message: string;
};

export function PlanningAlertCard({ message }: PlanningAlertCardProps) {
  return (
    <Card className="border-primary/30 bg-card/70">
      <CardHeader>
        <CardTitle>Alerta inteligente</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}
