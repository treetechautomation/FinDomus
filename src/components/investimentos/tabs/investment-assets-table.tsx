import { Edit, Plus, TrendingUp } from 'lucide-react';

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
  prefillTicker: { ticker: string; name?: string; type?: string; price?: number; source?: string } | null;
  setPrefillTicker: (value: { ticker: string; name?: string; type?: string; price?: number; source?: string } | null) => void;
};

export function InvestmentAssetsTable({
  assets,
  total,
  money,
  getTypeLabel,
  getTypeBadgeStyle,
  setEditingTicker,
  prefillTicker,
  setPrefillTicker,
}: Props) {
  const hasAssets = assets && assets.length > 0;

  return (
    <Card className="min-w-0 border-white/10 bg-white/[0.03] backdrop-blur-xl group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/3 rounded-full blur-3xl group-hover:bg-cyan-500/5 transition-colors duration-500" />
      
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <span className="tracking-wide">Lista de Ativos</span>
          {hasAssets && (
            <span className="text-xs font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
              {assets.length} {assets.length === 1 ? 'ativo' : 'ativos'}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      {!hasAssets ? (
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 flex items-center justify-center mb-6 border border-white/5">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Sua carteira ainda está vazia</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm">
            Adicione seu primeiro ativo para iniciar sua análise patrimonial e acompanhar seu patrimônio ao longo do tempo.
          </p>
          <Button 
            className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 px-6 shadow-lg shadow-cyan-500/10"
            onClick={() => setPrefillTicker({ ticker: '' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Ativo
          </Button>
        </CardContent>
      ) : (
        <CardContent className="min-w-0 overflow-x-auto p-0">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Ticker</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Valor atual</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">% carteira</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Nota</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Qtd.</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Resultado</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>

            <tbody>
              {assets.map((item) => (
                <tr
                  key={item.id || item.ticker}
                  className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-all duration-150 group/row"
                >
                  <td className="px-4 py-3">
                    <Badge className={`rounded-md border text-xs ${getTypeBadgeStyle(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 font-semibold text-foreground tracking-tight">{item.ticker}</td>

                  <td className="px-4 py-3 text-right font-semibold text-cyan-400 font-mono text-sm">
                    {money(item.currentValue)}
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-muted-foreground text-sm">
                    {total > 0
                      ? ((item.currentValue / total) * 100).toFixed(2)
                      : '0.00'}
                    %
                  </td>

                  <td className="px-4 py-3 text-right text-muted-foreground text-sm">{item.note}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-sm">{item.quantity || '-'}</td>

                  <td
                    className={
                      item.profit >= 0
                        ? 'px-4 py-3 text-right font-mono text-sm text-emerald-400'
                        : 'px-4 py-3 text-right font-mono text-sm text-red-400'
                    }
                  >
                    <span className={`px-1.5 py-0.5 rounded ${item.profit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      {money(item.profit)} ({item.profitPercent.toFixed(2)}%)
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-amber-300/70 hover:text-amber-300 hover:bg-amber-500/10 h-7 px-2 text-xs"
                      onClick={() => setEditingTicker(String(item.ticker || ''))}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      )}
    </Card>
  );
}
