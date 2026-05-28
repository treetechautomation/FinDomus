import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type PlanningGoalsChartCardProps = {
  total: number;
  categories: any[];
};

export function PlanningGoalsChartCard({
  total,
  categories,
}: PlanningGoalsChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total: {total}%</CardTitle>
        <CardDescription>
          A soma precisa fechar 100% para salvar.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="percentage"
                nameKey="name"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={2}
              >
                {categories.map((item) => (
                  <Cell key={item.id} fill={item.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: any, _name: any, item: any) => [
                  `${value}%`,
                  item.payload.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
