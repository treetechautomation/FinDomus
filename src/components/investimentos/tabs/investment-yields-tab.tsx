'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  CalendarDays,
  Coins,
  TrendingUp,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { deleteInvestmentYield, type InvestmentYield } from '@/services/firestore/yields';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const YIELD_TYPE_LABELS: Record<string, string> = {
  DIVIDEND: 'Dividendo',
  JCP: 'Juros sobre Capital Próprio',
  FII: 'Rendimento FII',
  COUPON: 'Cupom',
  OTHER: 'Outro',
};

const YIELD_TYPE_COLORS: Record<string, string> = {
  DIVIDEND: 'bg-[#5ED7FF]/20 text-[#5ED7FF] border-[#5ED7FF]/30',
  JCP: 'bg-[#5AF2C1]/20 text-[#5AF2C1] border-[#5AF2C1]/30',
  FII: 'bg-[#FFF85A]/20 text-[#FFF85A] border-[#FFF85A]/30',
  COUPON: 'bg-[#F07AF5]/20 text-[#F07AF5] border-[#F07AF5]/30',
  OTHER: 'bg-[#BCA7FF]/20 text-[#BCA7FF] border-[#BCA7FF]/30',
};

type Props = {
  yields: InvestmentYield[];
  userId: string;
  onRefresh?: () => void;
};

const money = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md text-xs">
        <p className="font-semibold text-zinc-400 mb-1">{payload[0].payload.label}</p>
        <p className="font-extrabold text-cyan-400">
          {money(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function InvestmentYieldsTab({ yields, userId, onRefresh }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Total Acumulado
  const totalAccumulated = useMemo(() => {
    return yields.reduce((sum, y) => sum + (Number(y.amount) || 0), 0);
  }, [yields]);

  // 2. Proventos por Mês (Evolução Mensal nos últimos 12 meses ativos no histórico)
  const monthlyData = useMemo(() => {
    if (!yields || yields.length === 0) return [];
    
    const groups: Record<string, number> = {};
    
    yields.forEach((y) => {
      if (!y.date || !y.amount) return;
      const monthKey = y.date.substring(0, 7); // YYYY-MM
      groups[monthKey] = (groups[monthKey] || 0) + Number(y.amount);
    });

    const sortedMonths = Object.keys(groups).sort();
    
    return sortedMonths.map((month) => {
      const [year, m] = month.split('-');
      const label = `${m}/${year.substring(2)}`;
      return {
        monthKey: month,
        label,
        amount: groups[month],
      };
    });
  }, [yields]);

  // 3. Ranking de Ativos Pagadores
  const rankingData = useMemo(() => {
    if (!yields || yields.length === 0) return [];
    
    const groups: Record<string, { ticker: string; total: number; count: number }> = {};
    
    yields.forEach((y) => {
      if (!y.ticker || !y.amount) return;
      const t = y.ticker.toUpperCase();
      if (!groups[t]) {
        groups[t] = { ticker: t, total: 0, count: 0 };
      }
      groups[t].total += Number(y.amount) || 0;
      groups[t].count += 1;
    });

    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [yields]);

  const maxYieldAmount = useMemo(() => {
    return rankingData.length > 0 ? Math.max(...rankingData.map((r) => r.total), 1) : 1;
  }, [rankingData]);

  // 4. Últimos Lançamentos
  const lastYields = useMemo(() => {
    return [...yields].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [yields]);

  const handleDelete = async (yieldId: string) => {
    if (!userId || !yieldId) return;
    setDeletingId(yieldId);
    try {
      await deleteInvestmentYield(userId, yieldId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erro ao deletar provento:', error);
      window.alert('Erro ao excluir o provento.');
    } finally {
      setDeletingId(null);
    }
  };

  const hasData = yields && yields.length > 0;

  return (
    <div className="space-y-8">
      {/* Resumo do Total Acumulado */}
      <Card className="border-white/10 bg-gradient-to-br from-cyan-950/20 via-slate-950/40 to-slate-950/70 border backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/8 transition-colors duration-500" />
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/25">
              <Coins className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-400 tracking-wider uppercase">
                Total Geral Recebido
              </h2>
              <div className="text-3xl md:text-4xl font-black text-white mt-1 tracking-tight">
                {money(totalAccumulated)}
              </div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 font-light flex items-center gap-2 max-w-xs">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Valores consolidados a partir do histórico de lançamentos cadastrados na plataforma.</span>
          </div>
        </CardContent>
      </Card>

      {!hasData ? (
        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl py-16 text-center">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <Coins className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold text-white">Nenhum provento cadastrado</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-2">
              Lançe proventos e dividendos usando o botão "Lançar Provento" no canto superior direito para gerar relatórios e gráficos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grid de Gráficos e Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico Histórico */}
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden group">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                    <CalendarDays className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="tracking-wide">Evolução Mensal</span>
                </CardTitle>
                <CardDescription className="text-xs font-light">
                  Rendimentos agregados por mês de pagamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#a1a1aa', fontSize: 10 }}
                        tickFormatter={(value) => `R$ ${Number(value)}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                      <Bar
                        dataKey="amount"
                        fill="url(#yieldBarGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="yieldBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.85} />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Ranking Pagadores */}
            <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden group">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="tracking-wide">Ranking de Pagadores</span>
                </CardTitle>
                <CardDescription className="text-xs font-light">
                  Ativos ordenados pelo total de proventos pagos.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                {rankingData.map((item, index) => {
                  const percentOfMax = (item.total / maxYieldAmount) * 100;
                  return (
                    <div key={item.ticker} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 font-bold w-4 text-right">#{index + 1}</span>
                          <span className="font-extrabold text-white tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                            {item.ticker}
                          </span>
                          <span className="text-zinc-500 text-[10px]">
                            ({item.count} pagamentos)
                          </span>
                        </div>
                        <span className="font-bold text-cyan-300">
                          {money(item.total)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.02]">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentOfMax}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Lançamentos */}
          <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-base font-semibold text-foreground">
                Histórico Detalhado de Lançamentos
              </CardTitle>
              <CardDescription className="text-xs font-light">
                Lista de todos os rendimentos e proventos registrados.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-zinc-400 text-xs font-semibold">
                      <th className="p-4">Data</th>
                      <th className="p-4">Ativo</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Descrição</th>
                      <th className="p-4 text-right">Valor</th>
                      <th className="p-4 text-center w-20">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastYields.map((y) => {
                      const formattedDate = y.date
                        ? new Date(y.date + 'T00:00:00').toLocaleDateString('pt-BR')
                        : 'N/A';
                      return (
                        <tr
                          key={y.id}
                          className="border-b border-white/5 hover:bg-white/[0.02] text-xs transition-colors duration-200"
                        >
                          <td className="p-4 text-zinc-300 font-light">{formattedDate}</td>
                          <td className="p-4 font-bold text-white tracking-wider">{y.ticker}</td>
                          <td className="p-4">
                            <span
                              className={cn(
                                'text-[10px] font-semibold border px-2 py-0.5 rounded-full uppercase',
                                YIELD_TYPE_COLORS[y.type] || 'bg-muted border-border text-muted-foreground'
                              )}
                            >
                              {YIELD_TYPE_LABELS[y.type] || y.type}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400 font-light truncate max-w-xs">
                            {y.description || '-'}
                          </td>
                          <td className="p-4 text-right font-extrabold text-emerald-400">
                            {money(y.amount)}
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deletingId === y.id}
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja excluir o provento de ${y.ticker} (${money(y.amount)})?`)) {
                                  handleDelete(y.id!);
                                }
                              }}
                              className="h-7 w-7 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
