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
        <h2 className="text-3xl font-bold">
          Simulador de aporte
        </h2>

        <p className="text-muted-foreground">
          Informe o valor do aporte e o sistema sugere a distribuição ideal
          para aproximar sua carteira das metas.
        </p>
      </div>

      <div className="flex max-w-xl flex-col gap-4 md:flex-row">
        <div className="space-y-2">
          <label className="text-xs font-bold text-yellow-400">
            Valor do aporte
          </label>

          <Input
            value={aporteValue}
            onChange={(e) => setAporteValue(e.target.value)}
            placeholder="R$ 0,00"
            inputMode="decimal"
          />
        </div>

        <div className="flex items-end">
          <Button type="button" className="w-full md:w-48">
            Calcular
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-yellow-400">
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
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: colors[index % colors.length],
                      }}
                    />

                    {item.name}
                  </span>

                  <strong className="text-yellow-400">
                    {money(item.suggestedValue)}
                  </strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Sugestões inteligentes</CardTitle>
          </CardHeader>

          <CardContent className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-yellow-500/80 text-black">
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-right">Atual</th>
                  <th className="p-3 text-right">Meta</th>
                  <th className="p-3 text-right">Sugestão</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>

              <tbody>
                {aportePlan.map((item) => (
                  <tr
                    key={item.name}
                    className="border-b border-white/10"
                  >
                    <td className="p-3">
                      <Badge
                        className={`rounded-full border ${getTypeBadgeStyle(item.name)}`}
                      >
                        {item.name}
                      </Badge>
                    </td>

                    <td className="p-3 text-right">
                      {item.currentPercent.toFixed(2)}%
                    </td>

                    <td className="p-3 text-right">
                      {item.goalPercent}%
                    </td>

                    <td className="p-3 text-right font-bold text-emerald-400">
                      {money(item.suggestedValue)}
                    </td>

                    <td className="p-3 text-center">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-yellow-500 text-black hover:bg-yellow-400"
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
