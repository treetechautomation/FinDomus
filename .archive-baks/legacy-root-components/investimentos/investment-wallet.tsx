'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import type { Investment, Account, Liability } from '@/services/firestore/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateFinancialCore } from '@/core/finance/financial-core';
import { useInvestmentMetrics } from '@/hooks/investimentos/use-investment-metrics';
import { useInvestmentAporte } from '@/hooks/investimentos/use-investment-aporte';

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

export function InvestmentWallet({ investments }: { investments: Investment[] }) {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [editingTicker, setEditingTicker] = useState('');
  const [aporteValue, setAporteValue] = useState('1000');
  const [activeTab, setActiveTab] = useState('ativos');
  const [prefillAporte, setPrefillAporte] = useState<{ type: string; amount: number } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
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
    async function loadWealthData() {
      const [{ getAccountsWithBalance }, { getLiabilities }] = await Promise.all([
          import('@/services/firestore/accounts'),
        import('@/services/firestore/liabilities'),
      ]);

      const [accountsData, liabilitiesData] = await Promise.all([
        getAccountsWithBalance(),
        getLiabilities(),
      ]);

      setAccounts(accountsData || []);
      setLiabilities(liabilitiesData || []);
    }

    loadWealthData();
  }, []);

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
    const total = goals.reduce((sum, g) => sum + g.value, 0);

    if (total !== 100) {
      window.alert('A soma das metas precisa ser 100%.');
      return;
    }

    try {
      const { saveInvestmentGoals } = await import('@/services/firestore');
      await saveInvestmentGoals(goals);
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

  
return (
  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
    <TabsList className="bg-transparent border-b border-yellow-500/40 rounded-none w-full justify-start gap-8">
      <TabsTrigger value="ativos">ATIVOS</TabsTrigger>
      <TabsTrigger value="metas">METAS</TabsTrigger>
      <TabsTrigger value="aportar">APORTAR</TabsTrigger>
      <TabsTrigger
        value="calculadoras"
        onClick={() => router.push('/investimentos/calculadoras')}
      >
        CALCULADORAS
      </TabsTrigger>
      <TabsTrigger value="perguntas">PERGUNTAS</TabsTrigger>
    </TabsList>

    {activeTab === 'ativos' && (
      <TabsContent value="ativos" className="space-y-8">
        <InvestmentAtivosTab
          search={search}
          setSearch={setSearch}
          editingTicker={editingTicker}
          setEditingTicker={setEditingTicker}
          prefillAporte={prefillAporte}
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

    {activeTab === 'perguntas' && (
      <TabsContent value="perguntas">
        <InvestmentQuestionsTab />
      </TabsContent>
    )}
  </Tabs>
);

}
