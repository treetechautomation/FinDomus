'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import type { Investment, Account, Liability } from '@/services/firestore/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Sparkles, Plus, Calendar, CalendarDays, Target } from 'lucide-react';
import { NewYieldDialog } from './new-yield-dialog';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/overview/stat-card';
import { getInvestmentYields, type InvestmentYield } from '@/services/firestore/yields';

import { calculateFinancialCore } from '@/core/finance/financial-core';
import { useInvestmentMetrics } from '@/hooks/investimentos/use-investment-metrics';
import { useInvestmentAporte } from '@/hooks/investimentos/use-investment-aporte';
import { useAuth } from '@/providers/auth-provider';
import { NewInvestmentDialog } from './new-investment-dialog';

const InvestmentQuestionsTab = dynamic(
  () => import('@/components/investimentos/tabs/investment-questions-tab').then((mod) => mod.InvestmentQuestionsTab),
  { ssr: false }
);

const InvestmentGoalsTab = dynamic(
  () => import('@/components/investimentos/tabs/investment-goals-tab').then((mod) => mod.InvestmentGoalsTab),
  { ssr: false }
);

const InvestmentAporteTab = dynamic(
  () => import('@/components/investimentos/tabs/investment-aporte-tab').then((mod) => mod.InvestmentAporteTab),
  { ssr: false }
);

const InvestmentAtivosTab = dynamic(
  () => import('@/components/investimentos/tabs/investment-ativos-tab').then((mod) => mod.InvestmentAtivosTab),
  { ssr: false }
);

const MarketWatchTab = dynamic(
  () => import('@/components/investimentos/tabs/market-watch-tab').then((mod) => mod.MarketWatchTab),
  { ssr: false }
);

const InvestmentYieldsTab = dynamic(
  () => import('@/components/investimentos/tabs/investment-yields-tab').then((mod) => mod.InvestmentYieldsTab),
  { ssr: false }
);

const money = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const classes = [
  'Todos',
  'Ações Internacionais',
  'Ações Nacionais',
  'Fundos Imobiliários',
  'REITs',
  'Criptomoedas',
  'Renda Fixa',
  'Renda Fixa Internacional',
];

const colors = ['#5ED7FF', '#5AF2C1', '#FFF85A', '#F07AF5', '#6D9DFF', '#FF9C3A', '#BCA7FF'];

const TYPE_LABELS: Record<string, string> = {
  'Ações Nacionais': 'Ações Nacionais',
  'Ações Internacionais': 'Ações Internacionais',
  'FIIs': 'Fundos Imobiliários',
  'Fundos Imobiliários': 'Fundos Imobiliários',
  'Cripto': 'Criptomoedas',
  'Criptomoedas': 'Criptomoedas',
  'REITs': 'REITs',
  'Renda Fixa': 'Renda Fixa',
  'Renda Fixa Internacional': 'Renda Fixa Internacional',
};

const TYPE_BADGE_STYLES: Record<string, string> = {
  'Ações Internacionais': 'bg-[#5ED7FF]/20 text-[#5ED7FF] border-[#5ED7FF]/40',
  'Ações Nacionais': 'bg-[#5AF2C1]/20 text-[#5AF2C1] border-[#5AF2C1]/40',
  'FIIs': 'bg-[#FFF85A]/20 text-[#FFF85A] border-[#FFF85A]/40',
  'Fundos Imobiliários': 'bg-[#FFF85A]/20 text-[#FFF85A] border-[#FFF85A]/40',
  'REITs': 'bg-[#F07AF5]/20 text-[#F07AF5] border-[#F07AF5]/40',
  'Cripto': 'bg-[#6D9DFF]/20 text-[#6D9DFF] border-[#6D9DFF]/40',
  'Criptomoedas': 'bg-[#6D9DFF]/20 text-[#6D9DFF] border-[#6D9DFF]/40',
  'Renda Fixa': 'bg-[#FF9C3A]/20 text-[#FF9C3A] border-[#FF9C3A]/40',
  'Renda Fixa Internacional': 'bg-[#BCA7FF]/20 text-[#BCA7FF] border-[#BCA7FF]/40',
};

function getTypeLabel(type?: string) {
  return TYPE_LABELS[String(type || '')] || String(type || 'Sem tipo');
}

function getTypeBadgeStyle(type?: string) {
  return TYPE_BADGE_STYLES[String(type || '')] || 'bg-muted text-muted-foreground border-border';
}

const INVESTMENT_PROFILES = {
  Conservador: [
    { name: 'Ações Nacionais', value: 3 },
    { name: 'Ações Internacionais', value: 2 },
    { name: 'REITs', value: 0 },
    { name: 'Criptomoedas', value: 0 },
    { name: 'Renda Fixa', value: 75 },
    { name: 'Fundos Imobiliários', value: 10 },
    { name: 'Renda Fixa Internacional', value: 10 },
  ],
  Moderado: [
    { name: 'Ações Nacionais', value: 15 },
    { name: 'Ações Internacionais', value: 10 },
    { name: 'REITs', value: 5 },
    { name: 'Criptomoedas', value: 5 },
    { name: 'Renda Fixa', value: 40 },
    { name: 'Fundos Imobiliários', value: 15 },
    { name: 'Renda Fixa Internacional', value: 10 },
  ],
  Arrojado: [
    { name: 'Ações Nacionais', value: 25 },
    { name: 'Ações Internacionais', value: 25 },
    { name: 'REITs', value: 5 },
    { name: 'Criptomoedas', value: 10 },
    { name: 'Renda Fixa', value: 15 },
    { name: 'Fundos Imobiliários', value: 15 },
    { name: 'Renda Fixa Internacional', value: 5 },
  ],
};

function normalizeInvestment(item: Investment) {
  const quantity = Number(item.quantity || 0);
  const averagePrice = Number(item.averagePrice || 0);
  const currentPrice = Number(item.currentPrice || 0);

  const investedAmount =
    quantity > 0 && averagePrice > 0
      ? quantity * averagePrice
      : Number(item.contributions || 0);

  const currentValue =
    quantity > 0 && currentPrice > 0
      ? quantity * currentPrice
      : Number(item.currentValue || 0);

  const profit = currentValue - investedAmount;
  const profitPercent = investedAmount > 0 ? (profit / investedAmount) * 100 : 0;

  return {
    ...item,
    ticker: item.ticker || item.institution || item.type,
    quantity,
    averagePrice,
    currentPrice: currentPrice || currentValue,
    investedAmount,
    currentValue,
    profit,
    profitPercent,
    note: item.goal ? 5 : 0,
    lastUpdate: item.lastUpdate || 'N/A',
  };
}

export function InvestmentWallet({ investments, onRefresh }: { investments: Investment[]; onRefresh?: () => void }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [editingTicker, setEditingTicker] = useState('');
  const [aporteValue, setAporteValue] = useState('1000');
  const [activeTab, setActiveTab] = useState('ativos');
  const [prefillAporte, setPrefillAporte] = useState<{ type: string; amount: number } | null>(null);
  const [prefillTicker, setPrefillTicker] = useState<{ ticker: string; name?: string; type?: string; price?: number; source?: string } | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [openYieldDialog, setOpenYieldDialog] = useState(false);
  const [yields, setYields] = useState<InvestmentYield[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<'Conservador' | 'Moderado' | 'Arrojado'>('Arrojado');
  const [goals, setGoals] = useState([
    { name: 'Ações Nacionais', value: 25 },
    { name: 'Ações Internacionais', value: 20 },
    { name: 'REITs', value: 5 },
    { name: 'Criptomoedas', value: 10 },
    { name: 'Renda Fixa', value: 15 },
    { name: 'Fundos Imobiliários', value: 25 },
    { name: 'Renda Fixa Internacional', value: 0 },
  ]);
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) return;

    async function loadWealthData() {
      const [{ getAccountsWithBalance }, { getLiabilities }, { getInvestmentGoals }, { getMonthlyClosures }] = await Promise.all([
          import('@/services/firestore/accounts'),
        import('@/services/firestore/liabilities'),
        import('@/services/firestore'),
        import('@/services/firestore/monthly-closures'),
      ]);

      const [accountsData, liabilitiesData, goalsData, closuresData] = await Promise.all([
        getAccountsWithBalance(user!.uid),
        getLiabilities(user!.uid),
        getInvestmentGoals(user!.uid),
        getMonthlyClosures(user!.uid, 'PF'),
      ]);

      setAccounts(accountsData || []);
      setLiabilities(liabilitiesData || []);
      setClosures(closuresData || []);
      
      if (goalsData && goalsData.length > 0) {
        setGoals(goalsData);
      }
    }

    loadWealthData();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    getInvestmentYields(user.uid)
      .then(setYields)
      .catch(console.error);

    import('@/services/firestore/monthly-closures')
      .then(({ getMonthlyClosures }) => getMonthlyClosures(user.uid, 'PF'))
      .then(setClosures)
      .catch(console.error);
  }, [user?.uid, investments]);

  function applyInvestmentProfile(profile: keyof typeof INVESTMENT_PROFILES) {
    setSelectedProfile(profile);
    setGoals(INVESTMENT_PROFILES[profile].map((item) => ({ ...item })));
  }

  function handleResetGoals() {
    setSelectedProfile('Arrojado');
    setGoals([
      { name: 'Ações Nacionais', value: 25 },
      { name: 'Ações Internacionais', value: 20 },
      { name: 'REITs', value: 5 },
      { name: 'Criptomoedas', value: 10 },
      { name: 'Renda Fixa', value: 15 },
      { name: 'Fundos Imobiliários', value: 25 },
      { name: 'Renda Fixa Internacional', value: 0 },
    ]);
  }

  async function handleSaveGoals() {
    if (!user?.uid) {
      window.alert('Usuário não autenticado.');
      return;
    }

    const total = goals.reduce((sum, g) => sum + g.value, 0);

    if (total !== 100) {
      window.alert('A soma das metas precisa ser 100%.');
      return;
    }

    try {
      const { saveInvestmentGoals } = await import('@/services/firestore');
      await saveInvestmentGoals(user.uid, goals);
      window.alert('Metas salvas com sucesso.');
    } catch (error) {
      console.error(error);
      window.alert('Erro ao salvar metas.');
    }
  }

  const {
    assets,
    filteredAssets,
    total,
    invested,
    profit,
    profitPercent,
    distribution,
  } = useInvestmentMetrics({
    investments,
    normalizeInvestment,
    filter,
    search,
    getTypeLabel,
    classes,
    colors,
  });

  useEffect(() => {
    if (!editingTicker) {
      setEditingInvestment(null);
      return;
    }
    const found = assets.find(
      (a: any) => String(a.ticker || '').toUpperCase() === editingTicker.toUpperCase()
    );
    setEditingInvestment(found || null);
  }, [editingTicker, assets]);

  const financialCore = useMemo(() => calculateFinancialCore({
    accounts,
    investments: assets,
    liabilities,
  }), [accounts, assets, liabilities]);

  const cashBalance = financialCore.cashBalance;
  const activeLiabilityBalance = financialCore.activeLiabilityBalance;
  const monthlyDebtPayment = financialCore.monthlyDebtPayment;
  const grossAssets = financialCore.grossAssets;
  const netWorth = financialCore.netWorth;
  const debtRatio = financialCore.debtRatio;
  const wealthScore = financialCore.wealthScore;
  const wealthStatus = financialCore.wealthStatus;
  const wealthRecommendation = financialCore.recommendation;

  const {
    aporteNumber,
    aportePlan,
  } = useInvestmentAporte({
    aporteValue,
    total,
    goals,
    distribution,
  });

  const monthlyLivingCost = useMemo(() => {
    // Filtrar closures fechados de PF
    const closedPF = closures
      .filter((c) => c.status === 'CLOSED')
      .sort((a, b) => b.month.localeCompare(a.month)); // Mais recentes primeiro

    if (closedPF.length === 0) {
      return {
        amount: 6000,
        isFallback: true,
      };
    }

    // Pegar até os últimos 6 closures fechados
    const recentClosures = closedPF.slice(0, 6);
    const totalExpenses = recentClosures.reduce((sum, c) => sum + (Number(c.expenses) || 0), 0);
    const average = totalExpenses / recentClosures.length;

    return {
      amount: average > 0 ? average : 6000,
      isFallback: average <= 0,
    };
  }, [closures]);

  const yieldMetrics = useMemo(() => {
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // Obter os últimos 12 meses (incluindo o atual) em formato YYYY-MM
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    let totalCurrentMonth = 0;
    let totalLast12M = 0;

    yields.forEach((y) => {
      if (!y.date || !y.amount) return;
      
      if (y.date.startsWith(currentYearMonth)) {
        totalCurrentMonth += Number(y.amount) || 0;
      }
      
      if (last12Months.some((ym) => y.date.startsWith(ym))) {
        totalLast12M += Number(y.amount) || 0;
      }
    });

    const averageMonthly = totalLast12M / 12;
    const targetLivingCost = monthlyLivingCost.amount;
    const progressPercent = targetLivingCost > 0 ? (averageMonthly / targetLivingCost) * 100 : 0;
    
    // Alvo FIRE = (despesas mensais * 12) / 0.04
    const targetNetWorth = (targetLivingCost * 12) / 0.04;

    return {
      totalCurrentMonth,
      totalLast12M,
      averageMonthly,
      targetIndependence: targetLivingCost,
      progressPercent,
      targetNetWorth,
      isLivingCostFallback: monthlyLivingCost.isFallback,
    };
  }, [yields, monthlyLivingCost]);

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-cyan-500/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-amber-100 bg-clip-text text-transparent">
            Investimentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie sua carteira de investimentos com inteligência
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setOpenYieldDialog(true)}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold h-9 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Lançar Provento
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-amber-500/10 border border-cyan-500/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Wealth Intelligence</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Proventos do Mês"
          value={money(yieldMetrics.totalCurrentMonth)}
          icon={Calendar}
          description="Recebido no mês vigente"
          glowColor="blue"
        />
        <StatCard
          title="Últimos 12 Meses"
          value={money(yieldMetrics.totalLast12M)}
          icon={CalendarDays}
          description="Total acumulado nos últimos 12 meses"
          glowColor="purple"
        />
        <StatCard
          title="Média Mensal"
          value={money(yieldMetrics.averageMonthly)}
          icon={TrendingUp}
          description="Média móvel dos últimos 12 meses"
          glowColor="green"
        />
        <StatCard
          title="Independência Financeira"
          value={`${yieldMetrics.progressPercent.toFixed(1)}%`}
          icon={Target}
          description={yieldMetrics.isLivingCostFallback ? "Meta estimada padrão" : "Meta baseada no seu custo de vida médio"}
          glowColor="orange"
        >
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(yieldMetrics.progressPercent, 100)}%` }}
            />
          </div>
          <div className="mt-3 space-y-1 text-[10px] text-zinc-500 font-light border-t border-white/5 pt-2">
            <div className="flex justify-between">
              <span>Média de Proventos:</span>
              <span className="font-semibold text-zinc-300">{money(yieldMetrics.averageMonthly)}/mês</span>
            </div>
            <div className="flex justify-between">
              <span>Meta Mensal:</span>
              <span className="font-semibold text-zinc-300">{money(yieldMetrics.targetIndependence)}/mês</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.03] pt-1 mt-1 text-amber-400/80 font-medium">
              <span>Alvo FIRE:</span>
              <span>{money(yieldMetrics.targetNetWorth)}</span>
            </div>
          </div>
        </StatCard>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
    <TabsList className="bg-transparent border-b border-white/10 rounded-none w-full justify-start gap-1 p-0 h-auto">
      <TabsTrigger 
        value="ativos"
        className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-300 data-[state=active]:shadow-[inset_0_-2px_0_2px_#22d3ee] rounded-t-md px-5 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 ease-out data-[state=active]:duration-200"
      >
        <span className="relative">ATIVOS</span>
      </TabsTrigger>
      <TabsTrigger 
        value="metas"
        className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-300 data-[state=active]:shadow-[inset_0_-2px_0_2px_#22d3ee] rounded-t-md px-5 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 ease-out data-[state=active]:duration-200"
      >
        <span className="relative">METAS</span>
      </TabsTrigger>
      <TabsTrigger 
        value="aportar"
        className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-300 data-[state=active]:shadow-[inset_0_-2px_0_2px_#22d3ee] rounded-t-md px-5 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 ease-out data-[state=active]:duration-200"
      >
        <span className="relative">APORTAR</span>
      </TabsTrigger>
      <TabsTrigger 
        value="proventos"
        className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-300 data-[state=active]:shadow-[inset_0_-2px_0_2px_#22d3ee] rounded-t-md px-5 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 ease-out data-[state=active]:duration-200"
      >
        <span className="relative">PROVENTOS</span>
      </TabsTrigger>
      <TabsTrigger
        value="calculadoras"
        onClick={() => router.push('/investimentos/calculadoras')}
        className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-300 data-[state=active]:shadow-[inset_0_-2px_0_2px_#22d3ee] rounded-t-md px-5 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 ease-out data-[state=active]:duration-200"
      >
        <span className="relative">CALCULADORAS</span>
      </TabsTrigger>
      <TabsTrigger 
        value="perguntas"
        className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-300 data-[state=active]:shadow-[inset_0_-2px_0_2px_#22d3ee] rounded-t-md px-5 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 ease-out data-[state=active]:duration-200"
      >
        <span className="relative">PERGUNTAS</span>
      </TabsTrigger>
      <TabsTrigger 
        value="mercado"
        className="data-[state=active]:bg-transparent data-[state=active]:text-cyan-300 data-[state=active]:shadow-[inset_0_-2px_0_2px_#22d3ee] rounded-t-md px-5 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 ease-out data-[state=active]:duration-200"
      >
        <span className="relative">MERCADO</span>
      </TabsTrigger>
    </TabsList>

    {activeTab === 'ativos' && (
      <TabsContent value="ativos" className="space-y-8">
        <InvestmentAtivosTab
          search={search}
          setSearch={setSearch}
          editingTicker={editingTicker}
          setEditingTicker={setEditingTicker}
          prefillAporte={prefillAporte}
          prefillTicker={prefillTicker}
          setPrefillTicker={setPrefillTicker}
          assets={assets}
          netWorth={netWorth}
          wealthScore={wealthScore}
          wealthStatus={wealthStatus}
          activeLiabilityBalance={activeLiabilityBalance}
          monthlyDebtPayment={monthlyDebtPayment}
          wealthRecommendation={wealthRecommendation}
          classes={classes}
          filter={filter}
          setFilter={setFilter}
          filteredAssets={filteredAssets}
          total={total}
          distribution={distribution}
          money={money}
          getTypeLabel={getTypeLabel}
          getTypeBadgeStyle={getTypeBadgeStyle}
        />
      </TabsContent>
    )}

    {activeTab === 'metas' && (
      <TabsContent value="metas">
        <InvestmentGoalsTab
          goals={goals}
          selectedProfile={selectedProfile}
          applyInvestmentProfile={applyInvestmentProfile}
          setGoals={setGoals}
          handleResetGoals={handleResetGoals}
          handleSaveGoals={handleSaveGoals}
        />
      </TabsContent>
    )}

    {activeTab === 'aportar' && (
      <TabsContent value="aportar">
        <InvestmentAporteTab
          aporteValue={aporteValue}
          setAporteValue={setAporteValue}
          aporteNumber={aporteNumber}
          aportePlan={aportePlan}
          colors={colors}
          money={money}
          getTypeBadgeStyle={getTypeBadgeStyle}
          setPrefillAporte={setPrefillAporte}
        />
      </TabsContent>
    )}

    {activeTab === 'proventos' && (
      <TabsContent value="proventos">
        <InvestmentYieldsTab
          yields={yields}
          userId={user?.uid || ''}
          onRefresh={onRefresh}
        />
      </TabsContent>
    )}

    {activeTab === 'perguntas' && (
      <TabsContent value="perguntas">
        <InvestmentQuestionsTab />
      </TabsContent>
    )}

{activeTab === 'mercado' && (
      <TabsContent value="mercado">
        <MarketWatchTab 
          onAddToPortfolio={(ticker, name, type, price) => {
            setPrefillTicker({ ticker, name, type, price: price ?? undefined });
          }}
        />
      </TabsContent>
    )}
  </Tabs>

      <NewInvestmentDialog
        portfolioAssets={assets}
        prefill={prefillAporte}
        prefillTicker={prefillTicker}
        editingInvestment={editingInvestment}
        onClose={() => setPrefillTicker(null)}
        onCloseEditing={() => { setEditingInvestment(null); setEditingTicker(''); }}
        onRefresh={onRefresh}
      />

      <NewYieldDialog
        open={openYieldDialog}
        onOpenChange={setOpenYieldDialog}
        onRefresh={onRefresh}
      />
  </div>
);
}
