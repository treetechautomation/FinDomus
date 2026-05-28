import { Edit } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Asset = {
  id?: string;
  ticker?: string;
  type?: string;
  currentValue: number;
  note: number;
  quantity: number;
  profit: number;
  profitPercent: number;
};

type Props = {
  assets: Asset[];
  total: number;
  money: (value: number) => string;
  getTypeLabel: (type?: string) => string;
  getTypeBadgeStyle: (type?: string) => string;
  setEditingTicker: (ticker: string) => void;
};

export function InvestmentAssetsTable({
  assets,
  total,
  money,
  getTypeLabel,
  getTypeBadgeStyle,
  setEditingTicker,
}: Props) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Lista de Ativos</CardTitle>
      </CardHeader>

      <CardContent className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="bg-yellow-500/80 text-black">
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Ticker</th>
              <th className="p-3 text-right">Valor atual</th>
              <th className="p-3 text-right">% carteira</th>
              <th className="p-3 text-right">Nota</th>
              <th className="p-3 text-right">Qtd.</th>
              <th className="p-3 text-right">Resultado</th>
              <th className="p-3 text-center">Ação</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((item) => (
              <tr
                key={item.id || item.ticker}
                className="border-b border-white/10"
              >
                <td className="p-3">
                  <Badge className={`rounded-full border ${getTypeBadgeStyle(item.type)}`}>
                    {getTypeLabel(item.type)}
                  </Badge>
                </td>

                <td className="p-3 font-semibold">{item.ticker}</td>

                <td className="p-3 text-right font-semibold text-emerald-400">
                  {money(item.currentValue)}
                </td>

                <td className="p-3 text-right font-semibold">
                  {total > 0
                    ? ((item.currentValue / total) * 100).toFixed(2)
                    : '0.00'}
                  %
                </td>

                <td className="p-3 text-right">{item.note}</td>
                <td className="p-3 text-right">{item.quantity || '-'}</td>

                <td
                  className={
                    item.profit >= 0
                      ? 'p-3 text-right text-emerald-400'
                      : 'p-3 text-right text-red-400'
                  }
                >
                  {money(item.profit)} ({item.profitPercent.toFixed(2)}%)
                </td>

                <td className="p-3 text-center">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-yellow-500 text-black hover:bg-yellow-400"
                    onClick={() => setEditingTicker(String(item.ticker || ''))}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
