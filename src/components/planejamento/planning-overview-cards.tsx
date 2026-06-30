import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shield, Banknote, Target, TrendingUp } from 'lucide-react';

type Props = {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilities: number;
  freedomIndex: number;
  freedomLevel: string;
  freedomIcon: string;
  reserve: any;
  brl: (v: number) => string;
};

export function PlanningOverviewCards({
  monthlyIncome,
  monthlyExpenses,
  monthlyLiabilities,
  freedomIndex,
  freedomLevel,
  freedomIcon,
  reserve,
  brl,
}: Props) {
  const plannedBalance = monthlyIncome - monthlyExpenses - monthlyLiabilities;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <Card className="border-cyan-500/20 bg-zinc-950/20 backdrop-blur-md">
        <CardHeader className="p-4 space-y-1">
          <CardDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            Receita do Mês
          </CardDescription>
          <CardTitle className="text-xl font-extrabold text-white mt-1">{brl(monthlyIncome)}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-red-500/20 bg-zinc-950/20 backdrop-blur-md">
        <CardHeader className="p-4 space-y-1">
          <CardDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-red-400 rotate-180" />
            Despesas do Mês
          </CardDescription>
          <CardTitle className="text-xl font-extrabold text-red-400 mt-1">{brl(monthlyExpenses)}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-orange-500/20 bg-zinc-950/20 backdrop-blur-md">
        <CardHeader className="p-4 space-y-1">
          <CardDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-orange-400" />
            Parcelas do Mês
          </CardDescription>
          <CardTitle className="text-xl font-extrabold text-orange-400 mt-1">{brl(monthlyLiabilities)}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-emerald-500/20 bg-zinc-950/20 backdrop-blur-md">
        <CardHeader className="p-4 space-y-1">
          <CardDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            Saldo Planejado
          </CardDescription>
          <CardTitle className={`text-xl font-extrabold mt-1 ${plannedBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {brl(plannedBalance)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-purple-500/20 bg-zinc-950/20 backdrop-blur-md">
        <CardHeader className="p-4 space-y-1">
          <CardDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-purple-400" />
            Reserva Emergencial
          </CardDescription>
          <CardTitle className="text-xl font-extrabold text-purple-400 mt-1">
            {reserve ? `${reserve.coveredMonths.toFixed(1)} meses` : 'N/D'}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-amber-500/20 bg-zinc-950/20 backdrop-blur-md">
        <CardHeader className="p-4 space-y-1">
          <CardDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Freedom Index
          </CardDescription>
          <CardTitle className="text-xl font-extrabold text-amber-400 mt-1">
            {freedomIndex} <span className="text-xs font-normal text-zinc-400">{freedomLevel} {freedomIcon}</span>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
