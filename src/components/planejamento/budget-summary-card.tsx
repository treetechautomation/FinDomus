import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type BudgetSummaryCardProps = {
  budgetRows: any[];
  monthlyIncome: number;
  totalOutflow: number;
  brl: (value: number) => string;
};

const isPatrimonialGoal = (name: string) => {
  const norm = String(name || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  return norm.includes("construcao de patrimonio") || norm.includes("independencia financeira");
};

export function BudgetSummaryCard({
  budgetRows,
  monthlyIncome,
  totalOutflow,
  brl,
}: BudgetSummaryCardProps) {
  const patrimonialRows = budgetRows.filter((item) => isPatrimonialGoal(item.name));
  const aporteSugerido = patrimonialRows.reduce((sum, item) => sum + Math.max(0, item.remaining), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo</CardTitle>
        <CardDescription>
          Cada teto é calculado por: renda do mês × percentual da meta.
        </CardDescription>
      </CardHeader>

      <CardContent className="overflow-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left">Meta</th>
              <th className="py-3 text-left">Teto do mês</th>
              <th className="py-3 text-left">Valor gasto</th>
              <th className="py-3 text-left">Saldo</th>
              <th className="py-3 text-left">Utilizado</th>
              <th className="py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {budgetRows.map((item) => (
              <tr key={item.id} className="border-b border-border/60">
                <td className="py-3 font-semibold">{item.name}</td>
                <td className="py-3 font-bold">{brl(item.planned)}</td>
                <td className="py-3 text-red-400 font-semibold">{brl(item.spent)}</td>
                <td className={item.remaining < 0 ? 'py-3 text-destructive' : 'py-3 text-emerald-500'}>
                  {brl(item.remaining)}
                </td>
                <td className="py-3">{item.used.toFixed(1)}%</td>
                <td
                  className={
                    item.status === 'Estourou'
                      ? 'py-3 font-bold text-destructive'
                      : item.status === 'Atenção' || item.status === 'Sem base'
                        ? 'py-3 font-bold text-amber-500'
                        : 'py-3 font-bold text-emerald-500'
                  }
                >
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 grid gap-4 md:grid-cols-4 border-t border-border/40 pt-6">
          <div>
            <div className="text-2xl font-bold text-emerald-500">{brl(totalOutflow)}</div>
            <div className="text-xs font-semibold text-muted-foreground">Total gasto</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{brl(monthlyIncome)}</div>
            <div className="text-xs font-semibold text-muted-foreground">Receita do mês</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {monthlyIncome > 0 ? ((totalOutflow / monthlyIncome) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-xs font-semibold text-muted-foreground">Utilizado da renda</div>
          </div>
          <div className="relative overflow-hidden p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="text-2xl font-black text-cyan-400 tracking-tight">{brl(aporteSugerido)}</div>
            <div className="text-xs font-bold text-cyan-300">Aporte sugerido do mês</div>
            <div className="text-[9px] text-zinc-400 mt-1 leading-tight">
              Baseado no saldo de: Construção de patrimônio + Independência financeira
            </div>
            <a 
              href="/investimentos" 
              className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 mt-2 transition-colors"
            >
              Ir para Aportar →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
