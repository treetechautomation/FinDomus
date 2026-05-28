import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PiggyBank } from 'lucide-react';

type AportePlanItem = {
  name: string;
  currentPercent: number;
  goalPercent: number;
  suggestedValue: number;
};

type Props = {
  aporteValue: string;
  setAporteValue: (value: string) => void;
  aporteNumber: number;
  aportePlan: AportePlanItem[];
  colors: string[];
  money: (value: number) => string;
  getTypeBadgeStyle: (value: string) => string;
  setPrefillAporte: (value: { type: string; amount: number }) => void;
};

export function InvestmentAporteTab({
  aporteValue,
  setAporteValue,
  aporteNumber,
  aportePlan,
  colors,
  money,
  getTypeBadgeStyle,
  setPrefillAporte,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-amber-100 bg-clip-text text-transparent">
          Simulador de aporte
        </h2>

        <p className="text-muted-foreground">
          Informe o valor do aporte e o sistema sugere a distribuição ideal
          para aproximar sua carteira das metas.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex max-w-xl flex-col gap-4 md:flex-row">
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold text-cyan-300">
                Valor do aporte
              </label>
              <Input
                value={aporteValue}
                onChange={(e) => setAporteValue(e.target.value)}
                placeholder="R$ 0,00"
                inputMode="decimal"
                className="bg-background/50 border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" className="w-full md:w-48 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30">
                Calcular
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="min-w-0 border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-amber-400" />
              Distribuição sugerida
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aportePlan}
                    dataKey="suggestedValue"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {aportePlan.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pointer-events-none -mt-40 mb-24 text-center">
              <div className="text-lg font-bold">
                {money(aporteNumber)}
              </div>

              <div className="text-sm text-muted-foreground">
                Aporte
              </div>
            </div>

            <div className="space-y-2">
              {aportePlan.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm group hover:bg-white/5 p-2 rounded-md transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full ring-1 ring-white/20"
                      style={{
                        background: colors[index % colors.length],
                      }}
                    />

                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.name}
                    </span>
                  </span>

                  <strong className="text-amber-300 font-medium">
                    {money(item.suggestedValue)}
                  </strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              Sugestões inteligentes
            </CardTitle>
          </CardHeader>

          <CardContent className="min-w-0 overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20">
                  <th className="p-4 text-left text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Tipo</th>
                  <th className="p-4 text-right text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Atual</th>
                  <th className="p-4 text-right text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Meta</th>
                  <th className="p-4 text-right text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Sugestão</th>
                  <th className="p-4 text-center text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Ação</th>
                </tr>
              </thead>

              <tbody>
                {aportePlan.map((item) => (
                  <tr
                    key={item.name}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
                  >
                    <td className="p-4">
                      <Badge
                        className={`rounded-full border ${getTypeBadgeStyle(item.name)}`}
                      >
                        {item.name}
                      </Badge>
                    </td>

                    <td className="p-4 text-right text-muted-foreground">
                      {item.currentPercent.toFixed(2)}%
                    </td>

                    <td className="p-4 text-right text-muted-foreground">
                      {item.goalPercent}%
                    </td>

                    <td className="p-4 text-right font-bold text-cyan-400">
                      {money(item.suggestedValue)}
                    </td>

                    <td className="p-4 text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/10"
                        onClick={() =>
                          setPrefillAporte({
                            type: item.name,
                            amount: item.suggestedValue,
                          })
                        }
                      >
                        Aportar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {aporteNumber <= 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Informe um valor de aporte para gerar sugestões.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
