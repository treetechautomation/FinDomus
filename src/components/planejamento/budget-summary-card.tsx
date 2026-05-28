import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type BudgetSummaryCardProps = {
  budgetRows: any[];
  monthlyIncome: number;
  totalOutflow: number;
  brl: (value: number) => string;
};

export function BudgetSummaryCard({
  budgetRows,
  monthlyIncome,
  totalOutflow,
  brl,
}: BudgetSummaryCardProps) {
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

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-2xl font-bold text-emerald-500">{brl(totalOutflow)}</div>
            <div className="text-xs font-semibold">Total gasto</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{brl(monthlyIncome)}</div>
            <div className="text-xs font-semibold">Receita do mês</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {monthlyIncome > 0 ? ((totalOutflow / monthlyIncome) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-xs font-semibold">Utilizado da renda</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
