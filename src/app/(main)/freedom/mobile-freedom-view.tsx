'use client';

import { useMemo, useState } from 'react';
import type { KernelResult } from '@/core/finance/kernel';
import type { FinancialAIInsight } from '@/core/finance/financial-ai-engine';
import type { ActionPlanItem } from '@/core/finance/freedom-engine';
import {
  HeroCard,
  ProgressCard,
  MetricDualCard,
  ListItemCard,
  InsightCard,
  ActionCard,
  FAB,
  BottomSheet,
} from '@/components/mobile';
import {
  Shield,
  TrendingUp,
  PiggyBank,
  Wallet,
  DollarSign,
  BarChart3,
  Layers,
  Info,
} from 'lucide-react';

interface Pillar {
  key: string;
  label: string;
  percent: number;
  icon: React.ReactNode;
  description: string;
}

function mapSeverity(type: string): 'info' | 'success' | 'warning' | 'negative' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'negative'> = {
    alert: 'warning',
    behavior: 'info',
    recurrence: 'negative',
    subscription: 'info',
    forecast: 'success',
  };
  return map[type] ?? 'info';
}

export interface MobileFreedomViewProps {
  kernel: KernelResult | null;
  loading: boolean;
  showQuickActions?: boolean;
}

export function MobileFreedomView({
  kernel,
  loading: isLoading,
  showQuickActions = true,
}: MobileFreedomViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const fi = kernel?.freedom?.index;
  const actions: ActionPlanItem[] = kernel?.freedom?.actions || [];
  const insights: FinancialAIInsight[] = kernel?.ai?.insights || [];

  const pillars: Pillar[] = useMemo(() => {
    if (!fi?.breakdown) return [];
    const b = fi.breakdown;
    const iconStyle = (color: string) => ({ color: `var(--fd-color-state-${color})` });
    return [
      { key: 'debtPayoffPercent', label: 'Quitação de Dívidas', percent: b.debtPayoffPercent, icon: <Shield size={16} style={iconStyle('positive')} />, description: 'Progresso na quitação de passivos' },
      { key: 'incomeFreedomPercent', label: 'Liberdade de Renda', percent: b.incomeFreedomPercent, icon: <DollarSign size={16} style={iconStyle('positive')} />, description: 'Receita vs. despesas essenciais' },
      { key: 'emergencyReservePercent', label: 'Reserva de Emergência', percent: b.emergencyReservePercent, icon: <PiggyBank size={16} style={iconStyle('positive')} />, description: 'Cobertura de meses de gastos' },
      { key: 'netWorthPercent', label: 'Patrimônio Líquido', percent: b.netWorthPercent, icon: <Wallet size={16} style={iconStyle('positive')} />, description: 'Progresso do patrimônio alvo' },
      { key: 'investmentRatePercent', label: 'Taxa de Investimento', percent: b.investmentRatePercent, icon: <TrendingUp size={16} style={iconStyle('positive')} />, description: 'Percentual da renda investido' },
      { key: 'passiveIncomePercent', label: 'Renda Passiva', percent: b.passiveIncomePercent, icon: <BarChart3 size={16} style={iconStyle('positive')} />, description: 'Cobertura de gastos por renda passiva' },
      { key: 'diversificationNormalized', label: 'Diversificação', percent: b.diversificationNormalized, icon: <Layers size={16} style={iconStyle('positive')} />, description: 'Distribuição entre classes de ativos' },
    ];
  }, [fi]);

  return (
    <div className="flex flex-col gap-fd-4 pb-fd-4" role="main" aria-label="Freedom Index">
      {/* ─── HeroCard ─────────────────────────────────────────────── */}
      <div className="pt-fd-3">
        <HeroCard
          value={fi ? `${fi.freedomIndex}` : '0'}
          label="Freedom Index"
          supportingText={fi?.levelLabel || 'Carregando...'}
          className="rounded-fd-md"
          loading={isLoading}
        />
      </div>

      {/* ─── ProgressCard ────────────────────────────────────────── */}
      <div>
        <ProgressCard
          title="Índice Geral"
          value={`${fi?.freedomIndex ?? 0}/100`}
          percent={fi?.freedomIndex ?? 0}
          supportingText={fi?.levelLabel ?? ''}
          status={
            (fi?.freedomIndex ?? 0) >= 60 ? 'positive' :
            (fi?.freedomIndex ?? 0) >= 40 ? 'warning' : 'negative'
          }
          className="rounded-fd-md"
          loading={isLoading}
        />
      </div>

      {/* ─── MetricDualCard ───────────────────────────────────────── */}
      <div>
        <MetricDualCard
          leftLabel="Nível"
          leftValue={fi?.levelLabel ?? '—'}
          rightLabel="Evolução"
          rightValue={fi?.trendPoints ? `${fi.trendPoints >= 0 ? '+' : ''}${fi.trendPoints} pts` : '—'}
          className="rounded-fd-md"
          loading={isLoading}
        />
      </div>

      {/* ─── 7 Pilares ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-fd-2">
        <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
          7 pilares do Freedom Index
        </span>
        <div className="flex flex-col gap-fd-1">
          {pillars.map((pillar) => (
            <ListItemCard
              key={pillar.key}
              title={pillar.label}
              subtitle={pillar.description}
              value={`${Math.round(pillar.percent)}%`}
              icon={pillar.icon}
              className="rounded-fd-md"
              loading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* ─── Insights ─────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <div className="flex flex-col gap-fd-2">
          <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
            Insights da Domus
          </span>
          <div className="flex flex-col gap-fd-1">
            {insights.slice(0, 3).map((insight, i) => (
              <InsightCard
                key={`insight-${i}`}
                title={insight.title}
                description={insight.description}
                severity={mapSeverity(insight.type)}
                className="rounded-fd-md"
                loading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Plano de Ações ───────────────────────────────────────── */}
      {actions.length > 0 && (
        <div className="flex flex-col gap-fd-2">
          <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
            Plano de ações ({actions.length})
          </span>
          <div className="flex flex-col gap-fd-1">
            {actions.slice(0, 5).map((action, i) => (
              <ActionCard
                key={`action-${i}`}
                title={action.title}
                description={action.description}
                primaryLabel={action.cta}
                onPrimaryClick={() => {}}
                className="rounded-fd-md"
                loading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── FAB ──────────────────────────────────────────────────── */}
      {showQuickActions && (
        <>
          <FAB
            icon={<Info size={24} />}
            label="Como melhorar"
            onClick={() => setSheetOpen(true)}
          />

          <BottomSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            title="Como melhorar seu Freedom Index"
            description="Interface de demonstração"
            maxHeight="medium"
          >
            <div className="flex flex-col gap-fd-4 p-fd-4">
              <p className="fd-body" style={{ color: 'var(--fd-color-text-primary)' }}>
                O Freedom Index mede seu progresso rumo à liberdade financeira em 7 dimensões. Para melhorar:
              </p>
              <div className="flex flex-col gap-fd-2">
                {pillars.map((p) => (
                  <div key={p.key} className="flex items-center gap-fd-2">
                    {p.icon}
                    <span className="fd-body" style={{ color: 'var(--fd-color-text-secondary)' }}>
                      {p.label}: {Math.round(p.percent)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="fd-supporting" style={{ color: 'var(--fd-color-text-tertiary)' }}>
                Consulte a Domus IA para recomendações personalizadas baseadas nos seus dados reais.
              </p>
            </div>
          </BottomSheet>
        </>
      )}
    </div>
  );
}
