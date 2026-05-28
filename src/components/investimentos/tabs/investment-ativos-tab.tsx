import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wallet, Gauge, ShieldAlert, Activity } from 'lucide-react';

import { InvestmentPortfolioChart } from './investment-portfolio-chart';
import { InvestmentAssetsTable } from './investment-assets-table';

type Props = {
  search: string;
  setSearch: (value: string) => void;
  editingTicker: string;
  setEditingTicker: (value: string) => void;
  prefillAporte: any;
  prefillTicker: { ticker: string; name?: string; type?: string; price?: number; source?: string } | null;
  setPrefillTicker: (value: { ticker: string; name?: string; type?: string; price?: number; source?: string } | null) => void;
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
        <Card className="group relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-background hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10">
          <div className="absolute left-0 top-8 bottom-8 w-[3px] bg-cyan-500/60 rounded-full" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/15 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Patrimônio</CardTitle>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-cyan-300 tracking-tight">
              {props.money(props.netWorth)}
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-background hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10">
          <div className="absolute left-0 top-8 bottom-8 w-[3px] bg-amber-500/60 rounded-full" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/15 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wealth Score</CardTitle>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
              <Gauge className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-amber-300 tracking-tight">
              {props.wealthScore}
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-background hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
          <div className="absolute left-0 top-8 bottom-8 w-[3px] bg-emerald-500/60 rounded-full" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-medium px-3 py-1">
              {props.wealthStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-red-500/20 bg-gradient-to-br from-red-950/30 to-background hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/10">
          <div className="absolute left-0 top-8 bottom-8 w-[3px] bg-red-500/60 rounded-full" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/15 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dívidas Ativas</CardTitle>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-xl font-bold text-red-400 tracking-tight">
              {props.money(props.activeLiabilityBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar ativo..."
                value={props.search}
                onChange={(e) => props.setSearch(e.target.value)}
                className="bg-background/50 border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {props.classes.map((item) => (
                <Button
                  key={item}
                  variant={props.filter === item ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => props.setFilter(item)}
                  className={`h-8 px-3 text-xs transition-all duration-200 ${
                    props.filter === item 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30 shadow-sm' 
                      : 'border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
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
          prefillTicker={props.prefillTicker}
          setPrefillTicker={props.setPrefillTicker}
        />
      </div>
    </div>
  );
}
