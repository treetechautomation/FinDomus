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
import { PieChart as PieChartIcon } from 'lucide-react';

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
  const hasData = distribution && distribution.length > 0 && total > 0;

  return (
    <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors duration-500" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
      
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
            <PieChartIcon className="w-4 h-4 text-amber-400" />
          </div>
          <span className="tracking-wide">Carteira</span>
        </CardTitle>
      </CardHeader>

      {!hasData ? (
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 flex items-center justify-center mb-5 border border-white/5">
            <PieChartIcon className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Adicione ativos para ver a distribuição</p>
          <p className="text-muted-foreground/50 text-xs mt-1">Sua carteira está vazia no momento</p>
        </CardContent>
      ) : (
        <CardContent className="relative">
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
                  {distribution.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))',
                        opacity: 1,
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pointer-events-none -mt-32 mb-20 text-center">
            <div className="text-sm text-cyan-300 font-medium tracking-wide">
              {money(total)}
            </div>

            <div className="font-bold text-amber-300 text-sm uppercase tracking-wider mt-1">
              Total
            </div>
          </div>

          <div className="space-y-2">
            {distribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm group/row hover:bg-white/[0.04] p-2.5 rounded-lg transition-all duration-200"
              >
                <span className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
                    style={{
                      background: item.color,
                      boxShadow: `0 0 8px ${item.color}40`,
                    }}
                  />

                  <span className="text-muted-foreground group-hover/row:text-foreground/80 transition-colors text-xs">
                    {item.name}
                  </span>
                </span>

                <strong className="text-amber-300 font-semibold text-xs">
                  {item.percent.toFixed(2)}%
                </strong>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
