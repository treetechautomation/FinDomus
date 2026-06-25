'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/overview/stat-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, BarChart2, PieChart as PieIcon, Calendar, Target, Loader2, Info, ArrowUpRight } from 'lucide-react';
import { getB3Positions, getB3Income } from '@/services/firestore/b3-investments';
import type { InvestmentPosition, InvestmentIncome } from '@/types/import/b3';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
}

const colors = ['#5ED7FF', '#5AF2C1', '#FFF85A', '#F07AF5', '#6D9DFF', '#FF9C3A', '#BCA7FF', '#FF7C7C'];

const money = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function InvestmentB3DashboardTab({ userId }: Props) {
  const router = useRouter();
  const [positions, setPositions] = useState<InvestmentPosition[]>([]);
  const [income, setIncome] = useState<InvestmentIncome[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      try {
        setLoading(true);
        const [posData, incData] = await Promise.all([
          getB3Positions(userId),
          getB3Income(userId),
        ]);
        setPositions(posData);
        setIncome(incData);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard B3:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  // --- ANOS DE REFERÊNCIA ---
  const yearsWithPositions = useMemo(() => {
    const yrs = Array.from(new Set(positions.map((p) => p.year)));
    return yrs.sort((a, b) => b - a); // Mais recentes primeiro
  }, [positions]);

  const latestPositionsYear = useMemo(() => {
    return yearsWithPositions[0] || new Date().getFullYear();
  }, [yearsWithPositions]);

  const yearsWithIncome = useMemo(() => {
    const yrs = Array.from(new Set(income.map((i) => i.year)));
    return yrs.sort((a, b) => b - a); // Mais recentes primeiro
  }, [income]);

  const latestIncomeYear = useMemo(() => {
    return yearsWithIncome[0] || new Date().getFullYear();
  }, [yearsWithIncome]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const incomeYearToUse = useMemo(() => {
    const hasIncomeInCurrentYear = income.some((i) => i.year === currentYear);
    if (hasIncomeInCurrentYear) {
      return currentYear;
    }
    return yearsWithIncome.includes(latestIncomeYear) ? latestIncomeYear : currentYear;
  }, [income, currentYear, yearsWithIncome, latestIncomeYear]);

  // --- FILTRAGEM POR ANO ---
  const latestPositions = useMemo(() => {
    return positions.filter((p) => p.year === latestPositionsYear);
  }, [positions, latestPositionsYear]);

  const currentYearIncome = useMemo(() => {
    return income.filter((i) => i.year === incomeYearToUse);
  }, [income, incomeYearToUse]);

  // --- MÉTRICAS CHAVE ---
  const totalInvested = useMemo(() => {
    return latestPositions.reduce((sum, p) => sum + (p.marketValue || 0), 0);
  }, [latestPositions]);

  const assetCount = useMemo(() => {
    const uniqueTickers = new Set(latestPositions.map((p) => p.ticker));
    return uniqueTickers.size;
  }, [latestPositions]);

  const totalIncome = useMemo(() => {
    return currentYearIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [currentYearIncome]);

  const dividendYield = useMemo(() => {
    if (totalInvested <= 0) return 0;
    return (totalIncome / totalInvested) * 100;
  }, [totalIncome, totalInvested]);

  // --- DISPONIBILIZAR DADOS PARA FUTURA INTEGRAÇÃO ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).investmentSummary = {
        totalInvested,
        totalIncome,
        dividendYield,
        assetCount,
      };
    }
  }, [totalInvested, totalIncome, dividendYield, assetCount]);

  // --- AGRUPAMENTOS PARA GRÁFICOS ---

  // 1. Alocação por Classe (PieChart)
  const allocationByClass = useMemo(() => {
    const groups: Record<string, number> = {};
    latestPositions.forEach((pos) => {
      const type = pos.type || 'Outros';
      groups[type] = (groups[type] || 0) + (pos.marketValue || 0);
    });

    const data = Object.entries(groups).map(([name, value]) => ({
      name,
      value,
    }));

    // Sort descending by value
    return data.sort((a, b) => b.value - a.value);
  }, [latestPositions]);

  // 2. Alocação por Instituição (BarChart)
  const allocationByInstitution = useMemo(() => {
    const groups: Record<string, number> = {};
    latestPositions.forEach((pos) => {
      // Normalize institution name
      const inst = (pos.institution || 'Outros').replace(/\s*CCTVM\s*|\s*S\/A\s*/gi, '').trim();
      groups[inst] = (groups[inst] || 0) + (pos.marketValue || 0);
    });

    const data = Object.entries(groups).map(([name, value]) => ({
      name,
      value,
    }));

    return data.sort((a, b) => b.value - a.value);
  }, [latestPositions]);

  // 3. Top 10 Posições
  const top10Positions = useMemo(() => {
    const sorted = [...latestPositions].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
    return sorted.slice(0, 10).map((pos) => ({
      ticker: pos.ticker,
      name: pos.name,
      marketValue: pos.marketValue,
    })).reverse(); // Reverse for correct layout order in horizontal charts
  }, [latestPositions]);

  // 4. Proventos por Ano (LineChart)
  const incomeByYear = useMemo(() => {
    const groups: Record<number, number> = {};
    income.forEach((inc) => {
      groups[inc.year] = (groups[inc.year] || 0) + (inc.amount || 0);
    });

    const data = Object.entries(groups).map(([year, amount]) => ({
      year: Number(year),
      amount,
    }));

    return data.sort((a, b) => a.year - b.year);
  }, [income]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
        <p className="text-zinc-400 text-sm">Carregando dados da Área do Investidor B3...</p>
      </div>
    );
  }

  const hasData = positions.length > 0 || income.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 flex items-center justify-center border border-white/5">
          <Info className="h-10 w-10 text-cyan-400" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-semibold text-white">Nenhum dado B3 encontrado</h3>
          <p className="text-zinc-400 text-sm font-light">
            Importe o relatório anual consolidado da B3 para gerar seu dashboard executivo de custódia e proventos históricos.
          </p>
        </div>
        <Button
          onClick={() => router.push('/importar')}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
        >
          Ir para Central de Importações <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patrimônio Investido"
          value={money(totalInvested)}
          icon={Target}
          description={`Ano base: ${latestPositionsYear}`}
          glowColor="blue"
        />
        <StatCard
          title="Quantidade de Ativos"
          value={String(assetCount)}
          icon={TrendingUp}
          description="Ativos únicos custodiados"
          glowColor="purple"
        />
        <StatCard
          title="Proventos no Ano"
          value={money(totalIncome)}
          icon={Calendar}
          description={`Ano base: ${incomeYearToUse}`}
          glowColor="green"
        />
        <StatCard
          title="Dividend Yield Real"
          value={`${dividendYield.toFixed(2)}%`}
          icon={BarChart2}
          description="Rendimento real s/ patrimônio"
          glowColor="orange"
        />
      </div>

      {/* Gráficos Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico 1: Alocação por Classe */}
        <Card className="border-white/10 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-cyan-400" />
              Alocação por Classe
            </CardTitle>
            <CardDescription>Distribuição de custódia consolidada em {latestPositionsYear}</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            {allocationByClass.length > 0 ? (
              <div className="flex h-full items-center justify-between">
                <div className="w-[50%] h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationByClass}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {allocationByClass.map((entry, index) => (
                          <Cell key={entry.name} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => money(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-[45%] space-y-2 overflow-y-auto max-h-60 pr-2">
                  {allocationByClass.map((item, index) => {
                    const pct = totalInvested > 0 ? (item.value / totalInvested) * 100 : 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-zinc-400">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          {item.name}
                        </span>
                        <span className="font-semibold text-zinc-200">{pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                Sem posições de custódia disponíveis.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 2: Alocação por Instituição */}
        <Card className="border-white/10 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-purple-400" />
              Alocação por Instituição
            </CardTitle>
            <CardDescription>Volume custodiado por corretora em {latestPositionsYear}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {allocationByInstitution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationByInstitution}>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={(value: number) => money(value)} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                Sem posições de custódia disponíveis.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico 3: Top 10 Posições */}
        <Card className="border-white/10 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-amber-400" />
              Top 10 Posições
            </CardTitle>
            <CardDescription>Maiores ativos na custódia de {latestPositionsYear}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {top10Positions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Positions} layout="vertical" margin={{ left: 15, right: 15 }}>
                  <XAxis
                    type="number"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis dataKey="ticker" type="category" stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(value: number) => money(value)} />
                  <Bar dataKey="marketValue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                Sem posições de custódia disponíveis.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 4: Proventos por Ano */}
        <Card className="border-white/10 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              Evolução Histórica de Proventos
            </CardTitle>
            <CardDescription>Somatório anual de dividendos, JCP e rendimentos B3</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {incomeByYear.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeByYear}>
                  <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$ ${v.toFixed(0)}`}
                  />
                  <Tooltip formatter={(value: number) => money(value)} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                Sem proventos históricos disponíveis.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
