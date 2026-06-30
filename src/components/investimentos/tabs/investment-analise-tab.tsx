'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  RefreshCw, 
  AlertTriangle, 
  ShieldAlert, 
  Award, 
  Coins, 
  Briefcase, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Heart,
  Info,
  CheckCircle2,
  PieChart as PieIcon
} from 'lucide-react';
import { consolidatePortfolio, type ConsolidatedPortfolio } from '@/services/investments/consolidation-engine';
import { getB3Income } from '@/services/firestore/b3-investments';
import { getBrokerIncome } from '@/services/firestore/broker-investments';
import { getInvestmentYields } from '@/services/firestore/yields';
import { generateInvestmentAnalytics, type InvestmentAnalytics, type RawIncomeInput } from '@/core/investments/analytics/analytics-engine';

interface Props {
  userId: string;
  portfolio?: ConsolidatedPortfolio;
}

const colors = ['#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

const money = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function InvestmentAnaliseTab({ userId, portfolio: propPortfolio }: Props) {
  const [portfolio, setPortfolio] = useState<ConsolidatedPortfolio | null>(null);
  const [rawIncomes, setRawIncomes] = useState<RawIncomeInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    try {
      setRefreshing(true);
      const [portData, b3Inc, brokerInc, manualYields] = await Promise.all([
        consolidatePortfolio(userId),
        getB3Income(userId),
        getBrokerIncome(userId),
        getInvestmentYields(userId)
      ]);

      setPortfolio(portData);

      // Merge and normalize incomes
      const mergedIncomes: RawIncomeInput[] = [
        ...b3Inc.map(y => ({ ticker: y.ticker, amount: y.amount, year: Number(y.year) })),
        ...brokerInc.map(y => ({ ticker: y.ticker, amount: y.amount, year: Number(y.year) })),
        ...manualYields.map(y => {
          const year = y.date ? new Date(y.date).getFullYear() : new Date().getFullYear();
          return { ticker: y.ticker, amount: y.amount, year };
        })
      ];
      setRawIncomes(mergedIncomes);
    } catch (err) {
      console.error('Erro ao carregar dados do Analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (propPortfolio) {
      setPortfolio(propPortfolio);
      setLoading(false);
      Promise.all([
        getB3Income(userId),
        getBrokerIncome(userId),
        getInvestmentYields(userId)
      ]).then(([b3Inc, brokerInc, manualYields]) => {
        const mergedIncomes: RawIncomeInput[] = [
          ...b3Inc.map(y => ({ ticker: y.ticker, amount: y.amount, year: Number(y.year) })),
          ...brokerInc.map(y => ({ ticker: y.ticker, amount: y.amount, year: Number(y.year) })),
          ...manualYields.map(y => {
            const year = y.date ? new Date(y.date).getFullYear() : new Date().getFullYear();
            return { ticker: y.ticker, amount: y.amount, year };
          })
        ];
        setRawIncomes(mergedIncomes);
      }).catch(console.error);
    } else {
      loadData();
    }
  }, [userId, propPortfolio]);

  // Compute analytics
  const analytics = useMemo<InvestmentAnalytics | null>(() => {
    if (!portfolio) return null;
    return generateInvestmentAnalytics(portfolio, rawIncomes);
  }, [portfolio, rawIncomes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" />
          <div className="absolute w-8 h-8 rounded-full border-b-2 border-l-2 border-indigo-400 animate-spin animate-reverse" />
        </div>
        <span className="text-sm text-zinc-400">Processando métricas e relatórios do Analytics...</span>
      </div>
    );
  }

  if (!portfolio || !analytics || portfolio.assets.length === 0) {
    return (
      <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl py-12 text-center">
        <CardContent className="space-y-4">
          <Activity className="h-12 w-12 text-zinc-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-white">Nenhum investimento disponível para análise</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
              Adicione ativos manuais, integre sua conta B3 ou faça importações de corretoras para gerar o diagnóstico analítico completo.
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

  const { health, allocation, dividends, risk, insights, performance } = analytics;

  // Grade color scheme
  const getGradeStyles = (g: string) => {
    if (g.startsWith('A')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (g.startsWith('B')) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5';
    if (g.startsWith('C')) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    if (g.startsWith('D')) return 'text-orange-400 border-orange-500/30 bg-orange-500/5';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />;
      case 'danger': return <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />;
      default: return <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300';
      case 'warning': return 'bg-amber-500/5 border-amber-500/10 text-amber-300';
      case 'danger': return 'bg-rose-500/5 border-rose-500/10 text-rose-300';
      default: return 'bg-cyan-500/5 border-cyan-500/10 text-cyan-300';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Refresh Control */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Investment Analytics Engine
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Diagnóstico profundo de riscos, diversificação geográfica, setores, liquidez e renda passiva. Última geração: {analytics.lastGenerated}.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadData} 
          disabled={refreshing}
          className="border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          Recalcular Análise
        </Button>
      </div>

      {/* Row 1: Health Score Gauges & Pillar Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Semicircle score card */}
        <Card className="border-white/5 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-400" />
              Índice de Saúde (Health Score)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">Média ponderada do score de diversificação e risco</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#18181b" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke={health.score >= 70 ? '#10b981' : health.score >= 50 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * health.score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-3xl font-black text-white tracking-tighter">{health.score}</span>
                <span className={`text-xs px-2 py-0.5 border rounded-full font-bold mt-1 uppercase ${getGradeStyles(health.grade)}`}>
                  Nota {health.grade}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pillars description and values */}
        <Card className="border-white/5 bg-slate-950/60 backdrop-blur-xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-cyan-400" />
              Desempenho por Pilar Analítico
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">Notas individuais de 0 a 20 para cada dimensão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {Object.values(health.pilars).map((pilar, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-300">{pilar.name}</span>
                  <span className="font-mono text-cyan-400 font-bold">{pilar.score}/{pilar.maxScore}</span>
                </div>
                <Progress 
                  value={(pilar.score / pilar.maxScore) * 100} 
                  className="h-1.5 bg-zinc-900" 
                  indicatorClassName={pilar.score >= 15 ? 'bg-emerald-500' : pilar.score >= 10 ? 'bg-amber-500' : 'bg-rose-500'}
                />
                <p className="text-[10px] text-zinc-500 mt-0.5">{pilar.feedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Dynamic Insights & Recomendações */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              Insights Recomendados (Motor de Regras)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Análise em tempo real do portfólio para sugerir rebalanceamentos e mitigar ameaças operacionais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <span>Nenhum alerta ou recomendação pendente. Sua carteira está bem calibrada!</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs transition-all duration-300 hover:scale-[1.01] ${getInsightBg(insight.type)}`}
                  >
                    {getInsightIcon(insight.type)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                          {insight.category}
                        </span>
                      </div>
                      <p className="leading-relaxed font-medium">{insight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Exposure charts (Setores, Moeda, Países) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Setores bar chart */}
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              Distribuição por Setor / Subclasse
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">Exposição consolidada por nichos de mercado</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocation.bySector} layout="vertical" margin={{ left: 20, right: 10 }}>
                <XAxis type="number" tickFormatter={(v) => money(v).replace(',00', '')} tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#a1a1aa' }} width={120} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => money(value)} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={10}>
                  {allocation.bySector.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Moedas & Países */}
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="h-4 w-4 text-cyan-400" />
              Divisão por Moeda / Geografia
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">Dollarização e risco de custódia cambial</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk.countryConcentration}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {risk.countryConcentration.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[(index + 1) % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => money(value)} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Dividend History & Asset yield metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dividend yearly bar chart */}
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Evolução Anual de Dividendos Recebidos
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">Histórico de proventos pagos acumulados por ano</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {dividends.byYear.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-zinc-600">
                Nenhum provento lançado ou importado até o momento.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dividends.byYear} margin={{ top: 10, bottom: 5 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => money(v).replace(',00', '')} tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => money(value)} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Asset Dividends Table */}
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Maiores Produtores de Renda Passiva
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">Ativos ordenados pelo total de proventos históricos pagos</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-white/5 h-64 overflow-y-auto">
            {dividends.byAsset.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-zinc-600">
                Sem proventos a classificar.
              </div>
            ) : (
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-500">Ativo</TableHead>
                    <TableHead className="text-zinc-500 text-right">Dividendos Totais</TableHead>
                    <TableHead className="text-zinc-500 text-right">YoC Individual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividends.byAsset.slice(0, 5).map((item) => {
                    const assetDetails = portfolio.assets.find(a => a.ticker === item.ticker);
                    return (
                      <TableRow key={item.ticker} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-bold text-white font-mono">{item.ticker}</TableCell>
                        <TableCell className="text-right text-emerald-400 font-bold">{money(item.amount)}</TableCell>
                        <TableCell className="text-right text-zinc-300 font-medium">
                          {assetDetails ? `${assetDetails.yieldOnCost.toFixed(2)}%` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Concentração de Ativos com Linha de Referência */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-rose-400" />
              Concentração de Ativos Individuais
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Mapeamento de part. % por ativo com referência de segurança (20% limite recomendado para diversificação ideal).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={risk.assetConcentration} margin={{ top: 10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Alerta (20%)', fill: '#f59e0b', fontSize: 9, position: 'insideTopLeft' }} />
                <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Crítico (35%)', fill: '#ef4444', fontSize: 9, position: 'insideTopLeft' }} />
                <Bar dataKey="percentage" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25}>
                  {risk.assetConcentration.map((entry, index) => {
                    const pct = entry.percentage;
                    const fill = pct > 35 ? '#ef4444' : pct > 20 ? '#f59e0b' : '#3b82f6';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
