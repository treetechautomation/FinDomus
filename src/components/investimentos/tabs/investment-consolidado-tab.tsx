'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Landmark, TrendingUp, TrendingDown, RefreshCw, ChevronDown, ChevronUp, DollarSign, Wallet, Percent, BarChart2, Calendar } from 'lucide-react';
import { consolidatePortfolio, type ConsolidatedPortfolio, type ConsolidatedAsset } from '@/services/investments/consolidation-engine';
import { getMonthlyClosures } from '@/services/firestore/monthly-closures';

interface Props {
  userId: string;
}

const colors = ['#5ED7FF', '#5AF2C1', '#FFF85A', '#F07AF5', '#6D9DFF', '#FF9C3A', '#BCA7FF', '#FF7C7C'];

const money = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function InvestmentConsolidadoTab({ userId }: Props) {
  const [portfolio, setPortfolio] = useState<ConsolidatedPortfolio | null>(null);
  const [closures, setClosures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [portData, closuresData] = await Promise.all([
        consolidatePortfolio(userId),
        getMonthlyClosures(userId, 'PF')
      ]);
      setPortfolio(portData);
      setClosures(closuresData || []);
    } catch (err) {
      console.error('Erro ao carregar carteira consolidada:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const toggleRow = (ticker: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [ticker]: !prev[ticker]
    }));
  };

  // --- RECHARTS FORMATTING ---
  const chartOrigins = useMemo(() => {
    if (!portfolio) return [];
    return Object.entries(portfolio.originsSummary).map(([name, value]) => ({
      name,
      value
    }));
  }, [portfolio]);

  const chartClasses = useMemo(() => {
    if (!portfolio) return [];
    return Object.entries(portfolio.classesSummary).map(([name, value]) => ({
      name,
      value
    }));
  }, [portfolio]);

  const chartInstitutions = useMemo(() => {
    if (!portfolio) return [];
    return Object.entries(portfolio.institutionsSummary).map(([name, value]) => ({
      name,
      value
    }));
  }, [portfolio]);

  const chartTopAssets = useMemo(() => {
    if (!portfolio) return [];
    return portfolio.assets.slice(0, 8).map(asset => ({
      name: asset.ticker,
      value: asset.marketValue
    }));
  }, [portfolio]);

  const chartNetWorthHistory = useMemo(() => {
    const monthlyDataMap = new Map<string, number>();

    closures.forEach((c) => {
      const monthKey = c.month; // YYYY-MM
      const netWorthVal = c.snapshot?.netWorth?.value ?? (c.cashflow?.closingBalance ?? c.balance ?? 0);
      monthlyDataMap.set(monthKey, (monthlyDataMap.get(monthKey) || 0) + netWorthVal);
    });

    return Array.from(monthlyDataMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, value]) => {
        const [year, monthNum] = monthKey.split('-');
        const date = new Date(Number(year), Number(monthNum) - 1, 1);
        const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
        return {
          monthKey,
          label,
          netWorth: Number(value.toFixed(2))
        };
      });
  }, [closures]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoaderSpinner />
        <span className="text-sm text-zinc-400">Consolidando carteira de investimentos...</span>
      </div>
    );
  }

  if (!portfolio || portfolio.assets.length === 0) {
    return (
      <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl py-12 text-center">
        <CardContent className="space-y-4">
          <Landmark className="h-12 w-12 text-zinc-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-white">Nenhum investimento cadastrado</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
              Adicione ativos manualmente na aba "Ativos" ou realize uma importação de B3 ou Corretoras para gerar sua Carteira Consolidada.
            </p>
          </div>
          <Button onClick={loadData} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { totalMarketValue, totalInvested, totalProfit, totalProfitPercent } = portfolio;
  const isProfit = totalProfit >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Dynamic Refresh Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Landmark className="h-5 w-5 text-cyan-400" />
            Consolidação em Tempo Real
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Dados agregados exclusivamente em memória a partir de fontes manuais, extratos de corretoras e arquivos B3.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Atualizar
        </Button>
      </div>

      {/* 1. Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-zinc-400 uppercase font-medium">Patrimônio Consolidado</CardDescription>
            <CardTitle className="text-2xl font-black text-white">{money(totalMarketValue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Wallet className="h-3.5 w-3.5 text-cyan-400" />
              <span>Total de {portfolio.assets.length} ativos agrupados</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-zinc-400 uppercase font-medium">Total Investido (Custo)</CardDescription>
            <CardTitle className="text-2xl font-black text-white">{money(totalInvested)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
              <span>Média de custo ponderada das ordens</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-white/5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-zinc-400 uppercase font-medium">Retorno Consolidado</CardDescription>
            <CardTitle className={`text-2xl font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {money(totalProfit)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {isProfit ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-400" />}
              <span className={`text-xs font-semibold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfit ? '+' : ''}{totalProfitPercent.toFixed(2)}%
              </span>
              <span className="text-xs text-zinc-500 ml-1">de variação patrimonial</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-zinc-400 uppercase font-medium">Instituições & Fontes</CardDescription>
            <CardTitle className="text-2xl font-black text-white">
              {Object.keys(portfolio.institutionsSummary).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Percent className="h-3.5 w-3.5 text-amber-400" />
              <span>Distribuídos em {Object.keys(portfolio.originsSummary).length} fontes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts Row 1: Pie distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-white">Divisão por Classe</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Mapeamento de ativos nas carteiras</CardDescription>
          </CardHeader>
          <CardContent className="h-60 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartClasses}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartClasses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => money(value)} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-white">Divisão por Instituição</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Exposição por corretora/banco</CardDescription>
          </CardHeader>
          <CardContent className="h-60 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartInstitutions}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartInstitutions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[(index + 2) % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => money(value)} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-white">Divisão por Origem</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Manual vs B3 vs Corretoras</CardDescription>
          </CardHeader>
          <CardContent className="h-60 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartOrigins}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartOrigins.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[(index + 4) % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => money(value)} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Charts Row 2: Top Assets & Net Worth Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Top 8 Ativos por Patrimônio</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Exposição consolidada por papel</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartTopAssets} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tickFormatter={(v) => money(v).replace(',00', '')} tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => money(value)} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Bar dataKey="value" fill="#6D9DFF" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Evolução Patrimonial</CardTitle>
            <CardDescription className="text-xs text-zinc-500">Patrimônio líquido baseado nos fechamentos mensais</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {chartNetWorthHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-xs">
                <Calendar className="h-8 w-8 mb-2" />
                <span>Nenhum histórico de fechamento mensal disponível ainda.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartNetWorthHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => money(v).replace(',00', '')} tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => money(value)} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                  <Line type="monotone" dataKey="netWorth" stroke="#5AF2C1" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Assets Table */}
      <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-white">Composição Consolidada da Carteira</CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            A tabela abaixo agrega os ativos consolidando custódias de múltiplas instituições e origens. Clique no ativo para ver a auditoria de origens.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t border-white/5">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="text-zinc-400">Ativo</TableHead>
                  <TableHead className="text-zinc-400">Nome do Papel</TableHead>
                  <TableHead className="text-zinc-400">Classe</TableHead>
                  <TableHead className="text-zinc-400 text-right">Qtd. Total</TableHead>
                  <TableHead className="text-zinc-400 text-right">Preço Médio</TableHead>
                  <TableHead className="text-zinc-400 text-right">Cotação Atual</TableHead>
                  <TableHead className="text-zinc-400 text-right">Retorno</TableHead>
                  <TableHead className="text-zinc-400 text-right">Val. de Mercado</TableHead>
                  <TableHead className="text-zinc-400 text-right">Dy / Yoc</TableHead>
                  <TableHead className="text-zinc-400 text-right">Part. %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.assets.map((asset) => {
                  const isAssetProfit = asset.profit >= 0;
                  const isExpanded = !!expandedRows[asset.ticker];

                  return (
                    <ReactFragmentWrapper key={asset.ticker}>
                      <TableRow className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleRow(asset.ticker)}>
                        <TableCell>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                        </TableCell>
                        <TableCell className="font-bold text-white font-mono">{asset.ticker}</TableCell>
                        <TableCell className="text-zinc-400 max-w-[200px] truncate" title={asset.name}>{asset.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-[10px]">
                            {asset.assetClass}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-zinc-300">{asset.totalQuantity.toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right text-zinc-300">{money(asset.averagePrice)}</TableCell>
                        <TableCell className="text-right text-zinc-300">{money(asset.currentPrice)}</TableCell>
                        <TableCell className={`text-right ${isAssetProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <div className="flex flex-col text-[11px] font-semibold items-end">
                            <span>{money(asset.profit)}</span>
                            <span>{isAssetProfit ? '+' : ''}{asset.profitPercent.toFixed(2)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-400">{money(asset.marketValue)}</TableCell>
                        <TableCell className="text-right text-zinc-400 text-[11px]">
                          <div className="flex flex-col items-end">
                            <span>DY: {asset.dividendYield.toFixed(2)}%</span>
                            <span>YoC: {asset.yieldOnCost.toFixed(2)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-cyan-300">{asset.participationPercent.toFixed(2)}%</TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-black/40 border-white/[0.02] hover:bg-black/40">
                          <TableCell colSpan={11} className="p-4">
                            <div className="border border-white/5 rounded-xl overflow-hidden p-3 bg-zinc-950/60 max-w-4xl mx-auto space-y-3">
                              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Origem dos Lançamentos (Auditoria)</h4>
                              <Table className="text-xs">
                                <TableHeader className="bg-white/[0.01]">
                                  <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-zinc-500 py-2">Fonte</TableHead>
                                    <TableHead className="text-zinc-500 py-2">Instituição Mapeada</TableHead>
                                    <TableHead className="text-zinc-500 py-2 text-right">Qtd.</TableHead>
                                    <TableHead className="text-zinc-500 py-2 text-right">Custo Médio</TableHead>
                                    <TableHead className="text-zinc-500 py-2 text-right">Valor de Mercado</TableHead>
                                    <TableHead className="text-zinc-500 py-2 text-center">Ano Ref.</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {asset.origins.map((orig, oIdx) => (
                                    <TableRow key={oIdx} className="border-white/5 hover:bg-white/[0.02]">
                                      <TableCell className="py-2">
                                        <Badge className={`text-[9px] px-1.5 py-0.5 ${
                                          orig.source === 'Manual' 
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                            : orig.source === 'B3' 
                                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        }`}>
                                          {orig.source}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-zinc-300 py-2 font-medium">{orig.institution}</TableCell>
                                      <TableCell className="text-right text-zinc-300 py-2">{orig.quantity.toLocaleString('pt-BR')}</TableCell>
                                      <TableCell className="text-right text-zinc-400 py-2">{money(orig.averagePrice)}</TableCell>
                                      <TableCell className="text-right text-emerald-400 py-2 font-semibold">{money(orig.marketValue)}</TableCell>
                                      <TableCell className="text-center text-zinc-500 py-2 font-mono">{orig.year || '-'}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </ReactFragmentWrapper>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

// Sub-components helpers
function LoaderSpinner() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
      <div className="absolute w-8 h-8 rounded-full border-b-2 border-l-2 border-indigo-400 animate-spin animate-reverse" />
    </div>
  );
}

function ReactFragmentWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
