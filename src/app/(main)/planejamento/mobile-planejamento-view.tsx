'use client';

import React, { useMemo } from 'react';
import { formatCurrency } from '@/core/finance/formatters';
import type { WealthCategory } from '@/core/finance/wealth-engine';
import type { ActionPlanItem } from '@/core/finance/freedom-engine';
import type { FinancialAIInsight } from '@/core/finance/financial-ai-engine';
import type { PFWealthAnalysis } from '@/core/finance/wealth-engine';
import {
  HeroCard,
  ProgressCard,
  MetricDualCard,
  ListItemCard,
  ChipFilter,
  FAB,
  BottomSheet,
  ActionCard,
} from '@/components/mobile';
import { Plus, Shield, TrendingDown } from 'lucide-react';

type TabId = 'visao-geral' | 'estrategia' | 'metas' | 'orcamento';

const TABS: { id: TabId; label: string }[] = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'estrategia', label: 'Estratégia' },
  { id: 'metas', label: 'Metas' },
  { id: 'orcamento', label: 'Orçamento' },
];

export function MobilePlanejamentoView({
  loading,
  kernel,
  wealthCategories,
}: {
  loading: boolean;
  kernel: any;
  wealthCategories: WealthCategory[];
}) {
  const [activeTab, setActiveTab] = React.useState<TabId>('visao-geral');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState({ name: '', percent: 0 });

  const fc = kernel?.financialCore;
  const freedom = kernel?.freedom;
  const wealth = kernel?.wealth;
  const actions: ActionPlanItem[] = freedom?.actions || [];
  const wealthAnalysis: PFWealthAnalysis[] = wealth?.analysis || [];

  const netWorth = fc?.netWorth ?? 0;
  const grossAssets = fc?.grossAssets ?? 0;
  const liabilities = fc?.activeLiabilityBalance ?? 0;
  const freedomIndex = freedom?.index?.freedomIndex ?? 0;
  const freedomLevel = freedom?.index?.levelLabel ?? 'Indisponível';

  const statusLabel = useMemo(() => {
    if (freedomIndex >= 60) return 'positive' as const;
    if (freedomIndex >= 40) return 'warning' as const;
    if (freedomIndex >= 20) return 'negative' as const;
    return 'neutral' as const;
  }, [freedomIndex]);

  return (
    <div className="flex flex-col gap-fd-4 pb-fd-4" role="main" aria-label="Planejamento">
      {/* ─── HeroCard ─────────────────────────────────────────────── */}
      <div className="pt-fd-3">
        <HeroCard
          value={formatCurrency(netWorth)}
          label="Patrimônio Líquido"
          supportingText="Net Worth"
          className="rounded-fd-md"
          loading={loading}
        />
      </div>

      {/* ─── ProgressCard (Freedom Index) ─────────────────────────── */}
      <div>
        <ProgressCard
          title="Freedom Index"
          value={`${freedomIndex}/100`}
          percent={freedomIndex}
          supportingText={freedomLevel}
          status={statusLabel}
          className="rounded-fd-md"
          loading={loading}
        />
      </div>

      {/* ─── MetricDualCard ───────────────────────────────────────── */}
      <div>
        <MetricDualCard
          leftLabel="Ativos"
          leftValue={formatCurrency(grossAssets)}
          rightLabel="Passivos"
          rightValue={formatCurrency(liabilities)}
          className="rounded-fd-md"
          loading={loading}
        />
      </div>

      {/* ─── ChipFilter Tabs ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-fd-2">
        {TABS.map((tab) => (
          <ChipFilter
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* ─── Tab Content ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-fd-2">
        {activeTab === 'visao-geral' && (
          <>
            <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
              Visão geral
            </span>
            <div className="flex flex-col gap-fd-1">
              <ListItemCard
                title="Patrimônio Líquido"
                subtitle="Ativos - Passivos"
                value={formatCurrency(netWorth)}
                icon={
                  <Shield size={16} style={{ color: 'var(--fd-color-state-positive)' }} aria-hidden />
                }
                className="rounded-fd-md"
                loading={loading}
              />
              <ListItemCard
                title="Ativos Totais"
                subtitle="Contas + investimentos"
                value={formatCurrency(grossAssets)}
                className="rounded-fd-md"
                loading={loading}
              />
              <ListItemCard
                title="Passivos Totais"
                subtitle="Dívidas e financiamentos"
                value={formatCurrency(liabilities)}
                icon={
                  <TrendingDown size={16} style={{ color: 'var(--fd-color-state-negative)' }} aria-hidden />
                }
                className="rounded-fd-md"
                loading={loading}
              />
              <ListItemCard
                title="Dívida Mensal"
                subtitle="Comprometimento mensal"
                value={formatCurrency(fc?.monthlyDebtPayment ?? 0)}
                className="rounded-fd-md"
                loading={loading}
              />
            </div>
          </>
        )}

        {activeTab === 'estrategia' && (
          <>
            <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
              Plano de ação ({actions.length} {actions.length === 1 ? 'ação' : 'ações'})
            </span>
            {actions.length === 0 && !loading && (
              <span className="fd-body" style={{ color: 'var(--fd-color-text-tertiary)' }}>
                Nenhuma ação disponível.
              </span>
            )}
            <div className="flex flex-col gap-fd-1">
              {actions.map((action, i) => (
                <ActionCard
                  key={`action-${i}`}
                  title={action.title}
                  description={action.description}
                  primaryLabel={action.cta}
                  onPrimaryClick={() => {}}
                  className="rounded-fd-md"
                  loading={loading}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'metas' && (
          <>
            <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
              Metas de alocação ({wealthCategories.length} {wealthCategories.length === 1 ? 'categoria' : 'categorias'})
            </span>
            {wealthCategories.length === 0 && !loading && (
              <span className="fd-body" style={{ color: 'var(--fd-color-text-tertiary)' }}>
                Nenhuma meta definida.
              </span>
            )}
            <div className="flex flex-col gap-fd-1">
              {wealthCategories.map((cat) => (
                <ProgressCard
                  key={cat.id}
                  title={cat.name}
                  value={`${cat.percentage}%`}
                  percent={cat.percentage}
                  supportingText="Meta de alocação"
                  status="positive"
                  className="rounded-fd-md"
                  loading={loading}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'orcamento' && (
          <>
            <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
              Análise patrimonial
            </span>
            {wealthAnalysis.length === 0 && !loading && (
              <span className="fd-body" style={{ color: 'var(--fd-color-text-tertiary)' }}>
                Nenhuma análise disponível.
              </span>
            )}
            <div className="flex flex-col gap-fd-1">
              {wealthAnalysis.map((item, i) => (
                <ListItemCard
                  key={`wa-${i}`}
                  title={item.pilar}
                  subtitle={`Real: ${item.realizadoPercent}% · Meta: ${item.metaPercent}% · Dif: ${item.diferencaPercent}%`}
                  value={item.status === 'good' ? 'OK' : item.status === 'warning' ? '⚠' : '✗'}
                  className="rounded-fd-md"
                  loading={loading}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── FAB + BottomSheet ─────────────────────────────────────── */}
      <FAB
        icon={<Plus size={24} />}
        label="Meta"
        onClick={() => setSheetOpen(true)}
      />

      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Nova meta"
        description="Interface de demonstração — sem persistência"
        maxHeight="medium"
      >
        <div className="flex flex-col gap-fd-4 p-fd-4">
          <div className="flex flex-col gap-fd-1">
            <label className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
              Nome da meta
            </label>
            <input
              type="text"
              value={newGoal.name}
              onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Reserva de emergência"
              className="fd-body px-fd-3 py-fd-2"
              style={{
                border: '1px solid var(--fd-color-border-default)',
                borderRadius: 'var(--fd-radius-control)',
                color: 'var(--fd-color-text-primary)',
                minHeight: '44px',
                caretColor: 'var(--fd-color-action-primary)',
                backgroundColor: 'var(--fd-color-surface-raised)',
              }}
            />
          </div>

          <div className="flex flex-col gap-fd-1">
            <label className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
              Percentual alvo
            </label>
            <input
              type="number"
              value={newGoal.percent || ''}
              onChange={(e) => setNewGoal((p) => ({ ...p, percent: Number(e.target.value) }))}
              placeholder="0"
              className="fd-body px-fd-3 py-fd-2"
              style={{
                border: '1px solid var(--fd-color-border-default)',
                borderRadius: 'var(--fd-radius-control)',
                color: 'var(--fd-color-text-primary)',
                minHeight: '44px',
                caretColor: 'var(--fd-color-action-primary)',
                backgroundColor: 'var(--fd-color-surface-raised)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="fd-button-text"
            style={{
              backgroundColor: 'var(--fd-color-action-primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--fd-radius-control)',
              minHeight: '44px',
              padding: 'var(--fd-space-2) var(--fd-space-4)',
              textAlign: 'center',
            }}
          >
            Salvar (demonstração)
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
