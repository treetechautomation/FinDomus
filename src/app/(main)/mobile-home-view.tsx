'use client';

import React from 'react';
import {
  HeroCard,
  InsightCard,
  ActionCard,
  MetricDualCard,
  ProgressCard,
  ListItemCard,
} from '@/components/mobile';
import type { MobileHomeData } from '@/app/(main)/mobile-home-data';
import { getPeriodGreeting } from '@/app/(main)/mobile-home-data';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

function TransactionIcon({ value }: { value: string }) {
  const isPositive = value.startsWith('+');

  if (isPositive) {
    return (
      <TrendingUp
        size={16}
        strokeWidth={2.5}
        style={{ color: 'var(--fd-color-state-positive)' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <TrendingDown
      size={16}
      strokeWidth={2.5}
      style={{ color: 'var(--fd-color-state-negative)' }}
      aria-hidden="true"
    />
  );
}

export function MobileHomeView({ data }: { data: MobileHomeData }) {
  const { user } = useAuth();
  const { period } = getPeriodGreeting();
  const name = user?.displayName || user?.email?.split('@')[0] || '';

  const greetingMap: Record<string, string> = {
    manha: 'Bom dia',
    tarde: 'Boa tarde',
    noite: 'Boa noite',
  };
  const greetingText = name
    ? `${greetingMap[period]}, ${name}`
    : greetingMap[period];

  return (
    <div
      className="flex flex-col gap-fd-4"
      role="main"
      aria-label="Tela inicial"
    >
      {/* ─── Saudação ──────────────────────────────────────────────── */}
      <div className="pt-fd-3">
        <h1
          className="fd-heading-1"
          style={{ color: 'var(--fd-color-text-primary)' }}
        >
          {greetingText}
        </h1>
      </div>

      {/* ─── HeroCard ─────────────────────────────────────────────── */}
      <div>
        <HeroCard
          value={data.hero.value}
          label={data.hero.label}
          variation={data.hero.variation}
          supportingText={data.hero.supportingText}
          className="rounded-fd-md"
          loading={data.loading}
        />
      </div>

      {/* ─── Freedom Index ────────────────────────────────────────── */}
      <div>
        <ProgressCard
          title={data.freedomIndex.title}
          value={data.freedomIndex.value}
          percent={data.freedomIndex.percent}
          supportingText={data.freedomIndex.supportingText}
          status={data.freedomIndex.status}
          className="rounded-fd-md"
          loading={data.loading}
        />
      </div>

      {/* ─── InsightCard (Domus IA) ────────────────────────────────── */}
      {data.insight && (
        <div>
          <InsightCard
            title={data.insight.title}
            description={data.insight.description}
            severity={data.insight.severity}
            ctaLabel={data.insight.ctaLabel}
            className="rounded-fd-md"
            loading={data.loading}
          />
        </div>
      )}

      {/* ─── Próxima Ação ──────────────────────────────────────────── */}
      {data.nextAction && (
        <div>
          <ActionCard
            title={data.nextAction.title}
            description={data.nextAction.description}
            primaryLabel={data.nextAction.primaryLabel}
            onPrimaryClick={() => {}}
            secondaryLabel={data.nextAction.secondaryLabel}
            onSecondaryClick={() => {}}
            className="rounded-fd-md"
            loading={data.loading}
          />
        </div>
      )}

      {/* ─── KPIs ──────────────────────────────────────────────────── */}
      <div>
        <MetricDualCard
          leftLabel={data.kpis.leftLabel}
          leftValue={data.kpis.leftValue}
          rightLabel={data.kpis.rightLabel}
          rightValue={data.kpis.rightValue}
          leftSupportingText={data.kpis.leftSupportingText}
          rightSupportingText={data.kpis.rightSupportingText}
          className="rounded-fd-md"
          loading={data.loading}
        />
      </div>

      {/* ─── Últimas Movimentações ─────────────────────────────────── */}
      <div className="flex flex-col gap-fd-2">
        <span
          className="fd-caption"
          style={{ color: 'var(--fd-color-text-secondary)' }}
        >
          Últimas movimentações
        </span>

        {data.transactions.length === 0 && !data.loading && (
          <span
            className="fd-body"
            style={{ color: 'var(--fd-color-text-tertiary)' }}
          >
            Nenhuma movimentação no período.
          </span>
        )}

        <div className="flex flex-col gap-fd-1">
          {data.transactions.map((tx, index) => (
            <ListItemCard
              key={`${tx.title}-${index}`}
              title={tx.title}
              subtitle={tx.subtitle}
              value={tx.value}
              icon={<TransactionIcon value={tx.value} />}
              showChevron
              className="rounded-fd-md"
              loading={data.loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
