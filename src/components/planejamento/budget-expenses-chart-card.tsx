import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type BudgetExpensesChartCardProps = {
  expensesChartData: any[];
  plannedChartData: any[];
  budgetRows: any[];
  brl: (value: number) => string;
};

export function BudgetExpensesChartCard({
  expensesChartData,
  plannedChartData,
  budgetRows,
  brl,
}: BudgetExpensesChartCardProps) {
  const chartData = expensesChartData.length ? expensesChartData : plannedChartData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos</CardTitle>
        <CardDescription>Distribuição real dos gastos do mês.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey={expensesChartData.length ? 'spent' : 'value'}
                nameKey="name"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={2}
              >
                {chartData.map((item: any) => (
                  <Cell key={item.id || item.name} fill={item.color} />
                ))}
              </Pie>

              <Tooltip formatter={(value: any) => brl(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {budgetRows.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
              <span className="font-semibold text-primary">({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
