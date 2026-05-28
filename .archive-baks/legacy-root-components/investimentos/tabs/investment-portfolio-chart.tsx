import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type DistributionItem = {
  name: string;
  value: number;
  percent: number;
  color: string;
};

type Props = {
  distribution: DistributionItem[];
  total: number;
  money: (value: number) => string;
};

export function InvestmentPortfolioChart({
  distribution,
  total,
  money,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-yellow-400">
          Carteira
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={2}
              >
                {distribution.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pointer-events-none -mt-32 mb-20 text-center">
          <div className="text-sm">
            {money(total)}
          </div>

          <div className="font-bold">
            Total
          </div>
        </div>

        <div className="space-y-2">
          {distribution.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    background: item.color,
                  }}
                />

                {item.name}
              </span>

              <strong className="text-yellow-400">
                {item.percent.toFixed(2)}%
              </strong>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
