'use client';

import { useEffect, useState } from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';

type Insight = {
  type: 'recurrence' | 'subscription' | 'forecast' | 'alert' | 'behavior';
  title: string;
  description: string;
  confidence?: number;
};

type AIResult = {
  recurringDetected: number;
  subscriptions: number;
  projectedNextMonth: number;
  financialHealthScore: number;
  insights: Insight[];
};

export function AiInsightsCard() {
  const [data, setData] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const token = auth.currentUser ? await getIdToken(auth.currentUser) : null;
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('/api/ai/insights', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar insights da IA');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao carregar insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Card className="rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-xl animate-pulse h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <BrainCircuit className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-xs">IA analisando sua carteira e despesas...</p>
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="rounded-3xl border border-rose-500/10 bg-rose-500/5 h-48 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
        <p className="text-xs text-zinc-400 mb-4">Não foi possível carregar os insights inteligentes.</p>
        <Button onClick={loadInsights} variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
          <RefreshCw className="h-3 w-3" /> Tentar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.03)] transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.01] to-transparent pointer-events-none" />
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-zinc-400 text-sm font-semibold tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            INSIGHTS FINANCEIROS DA IA (GEMINI)
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">Análise baseada em hábitos, contratos e projeções automáticas.</CardDescription>
        </div>
        <Button
          onClick={loadInsights}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-full"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 pt-1">
        <div className="flex flex-col sm:flex-row items-center gap-5 shrink-0">
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="38" className="stroke-slate-800/50" strokeWidth="6" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="#f59e0b"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 - (data.financialHealthScore / 100) * (2 * Math.PI * 38)}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.3))' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{data.financialHealthScore}</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-lg font-bold tracking-tight text-amber-400">
              {data.financialHealthScore >= 85 ? 'Excelente Saúde' : data.financialHealthScore >= 65 ? 'Saúde Estável' : 'Atenção Necessária'}
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
              {data.financialHealthScore >= 85 
                ? 'Seu comportamento e previsões estão ideais. Continue mantendo o controle das saídas.'
                : data.financialHealthScore >= 65 
                  ? 'Existem alguns pontos de atenção no fluxo futuro, mas a saúde geral é positiva.'
                  : 'Projeção futura de caixa negativo ou passivos altos detectados.'}
            </p>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          {data.insights.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 max-h-[140px] overflow-y-auto pr-1">
              {data.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-white/5 bg-slate-900/30 text-xs leading-relaxed text-zinc-300 flex items-start gap-2.5 hover:border-amber-500/20 transition-all duration-300"
                >
                  <div className="mt-0.5 shrink-0">
                    {insight.type === 'alert' ? (
                      <AlertCircle className="h-4 w-4 text-rose-500" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[11px] text-zinc-200">{insight.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{insight.description}</p>
                    {insight.confidence && (
                      <span className="inline-block text-[8px] bg-white/5 border border-white/10 text-zinc-400 rounded px-1 mt-1">
                        confiança: {(insight.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/20 text-zinc-400 text-xs text-center">
              A IA analisou seus dados e não encontrou anomalias ou recorrências complexas para apontar.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
