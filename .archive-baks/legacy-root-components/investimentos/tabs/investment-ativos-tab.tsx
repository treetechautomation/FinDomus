import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { InvestmentPortfolioChart } from './investment-portfolio-chart';
import { InvestmentAssetsTable } from './investment-assets-table';

type Props = {
  search: string;
  setSearch: (value: string) => void;
  editingTicker: string;
  setEditingTicker: (value: string) => void;
  prefillAporte: any;
  assets: any[];
  netWorth: number;
  wealthScore: number;
  wealthStatus: string;
  activeLiabilityBalance: number;
  monthlyDebtPayment: number;
  wealthRecommendation: string;
  classes: string[];
  filter: string;
  setFilter: (value: string) => void;
  filteredAssets: any[];
  total: number;
  distribution: any[];
  money: (value: number) => string;
  getTypeLabel: (value?: string) => string;
  getTypeBadgeStyle: (value?: string) => string;
};

export function InvestmentAtivosTab(props: Props) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Patrimônio</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {props.money(props.netWorth)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wealth Score</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {props.wealthScore}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{props.wealthStatus}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dívidas Ativas</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold text-red-400">
            {props.money(props.activeLiabilityBalance)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Input
            placeholder="Buscar ativo..."
            value={props.search}
            onChange={(e) => props.setSearch(e.target.value)}
          />

          {props.classes.map((item) => (
            <Button
              key={item}
              variant={props.filter === item ? 'default' : 'outline'}
              onClick={() => props.setFilter(item)}
            >
              {item}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <InvestmentPortfolioChart
          distribution={props.distribution}
          total={props.total}
          money={props.money}
        />

        <InvestmentAssetsTable
          assets={props.filteredAssets}
          total={props.total}
          money={props.money}
          getTypeLabel={props.getTypeLabel}
          getTypeBadgeStyle={props.getTypeBadgeStyle}
          setEditingTicker={props.setEditingTicker}
        />
      </div>
    </div>
  );
}
