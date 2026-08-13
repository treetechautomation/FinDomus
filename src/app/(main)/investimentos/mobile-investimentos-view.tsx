'use client';

import React, { useMemo } from 'react';
import type { Investment } from '@/services/firestore/investments';
import { formatCurrency } from '@/core/finance/formatters';
import {
  HeroCard,
  MetricDualCard,
  ProgressCard,
  ListItemCard,
  ChipFilter,
  SearchBar,
  FAB,
  BottomSheet,
} from '@/components/mobile';
import { Plus, Landmark } from 'lucide-react';

type FilterId = 'todos' | 'renda-fixa' | 'renda-variavel' | 'fundos' | 'cripto';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'renda-fixa', label: 'Renda Fixa' },
  { id: 'renda-variavel', label: 'Renda Variável' },
  { id: 'fundos', label: 'Fundos' },
  { id: 'cripto', label: 'Cripto' },
];

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    'renda-fixa': 'Renda Fixa',
    'renda-variavel': 'Renda Variável',
    fundo: 'Fundo',
    cripto: 'Cripto',
    acao: 'Ação',
    fii: 'FII',
    tesouro: 'Tesouro',
    cdb: 'CDB',
    lci: 'LCI',
    lca: 'LCA',
  };
  return map[type] || type;
}

function normalizeType(type: string): FilterId {
  const t = (type || '').toLowerCase();
  if (t.includes('fixa') || t === 'cdb' || t === 'lci' || t === 'lca' || t === 'tesouro') return 'renda-fixa';
  if (t.includes('variavel') || t === 'acao' || t === 'fii') return 'renda-variavel';
  if (t.includes('fundo')) return 'fundos';
  if (t.includes('cripto')) return 'cripto';
  return 'todos';
}

export function MobileInvestimentosView({
  loading,
  kernel,
  investments,
}: {
  loading: boolean;
  kernel: any;
  investments: Investment[];
}) {
  const [activeFilter, setActiveFilter] = React.useState<FilterId>('todos');
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [newInv, setNewInv] = React.useState({ name: '', type: 'renda-fixa', value: '' });

  const fc = kernel?.financialCore;
  const investedValue = fc?.investmentValue ?? 0;
  const profitPercent = fc?.investmentProfitPercent ?? 0;
  const diversification = kernel?.freedom?.index?.breakdown?.diversificationNormalized ?? 0;

  const filtered = useMemo(() => {
    let list = [...investments];

    if (activeFilter !== 'todos') {
      list = list.filter((inv) => normalizeType(inv.type) === activeFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (inv) =>
          (inv.ticker || '').toLowerCase().includes(q) ||
          (inv.institution || '').toLowerCase().includes(q) ||
          (inv.type || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => Number(b.currentValue || 0) - Number(a.currentValue || 0));
    return list;
  }, [investments, activeFilter, search]);

  const profitDirection = profitPercent >= 0 ? ('up' as const) : ('down' as const);

  return (
    <div className="flex flex-col gap-fd-4 pb-fd-4" role="main" aria-label="Investimentos">
      {/* ─── HeroCard ─────────────────────────────────────────────── */}
      <div className="pt-fd-3">
        <HeroCard
          value={formatCurrency(investedValue)}
          label="Patrimônio Investido"
          variation={{
            value: `${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(1)}%`,
            direction: profitDirection,
          }}
          supportingText={`${investments.length} ${investments.length === 1 ? 'ativo' : 'ativos'}`}
          className="rounded-fd-md"
          loading={loading}
        />
      </div>

      {/* ─── MetricDualCard ───────────────────────────────────────── */}
      <div>
        <MetricDualCard
          leftLabel="Rentabilidade"
          leftValue={`${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(1)}%`}
          rightLabel="Total de Ativos"
          rightValue={investments.length}
          className="rounded-fd-md"
          loading={loading}
        />
      </div>

      {/* ─── ProgressCard (Diversificação) ────────────────────────── */}
      <div>
        <ProgressCard
          title="Diversificação"
          value={`${diversification}/100`}
          percent={diversification}
          supportingText="Índice de diversificação"
          status={diversification >= 60 ? 'positive' : diversification >= 30 ? 'warning' : 'negative'}
          className="rounded-fd-md"
          loading={loading}
        />
      </div>

      {/* ─── ChipFilter ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-fd-2">
        {FILTERS.map((f) => (
          <ChipFilter
            key={f.id}
            label={f.label}
            active={activeFilter === f.id}
            onClick={() => setActiveFilter(f.id)}
          />
        ))}
      </div>

      {/* ─── SearchBar ────────────────────────────────────────────── */}
      <div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome, ticker ou instituição..."
          loading={loading}
        />
      </div>

      {/* ─── Lista de Investimentos ────────────────────────────────── */}
      <div className="flex flex-col gap-fd-2">
        <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
          {activeFilter === 'todos'
            ? 'Todos os investimentos'
            : FILTERS.find((f) => f.id === activeFilter)?.label}
          {search && ` · "${search}"`}
        </span>

        {filtered.length === 0 && !loading && (
          <span className="fd-body" style={{ color: 'var(--fd-color-text-tertiary)' }}>
            Nenhum investimento encontrado.
          </span>
        )}

        <div className="flex flex-col gap-fd-1">
          {filtered.map((inv, i) => {
            const current = Number(inv.currentValue || 0);
            const contributed = Number(inv.contributions || 0);

            return (
              <ListItemCard
                key={inv.id || `${inv.ticker || inv.institution}-${i}`}
                title={inv.ticker || inv.institution || 'Investimento'}
                subtitle={`${typeLabel(inv.type)} · ${inv.institution || ''}`}
                value={formatCurrency(current)}
                description={
                  contributed > 0
                    ? `Aportado: ${formatCurrency(contributed)}`
                    : undefined
                }
                icon={
                  <Landmark
                    size={16}
                    style={{ color: 'var(--fd-color-text-secondary)' }}
                    aria-hidden
                  />
                }
                showChevron
                className="rounded-fd-md"
                loading={loading}
              />
            );
          })}
        </div>
      </div>

      {/* ─── FAB + BottomSheet ─────────────────────────────────────── */}
      <FAB
        icon={<Plus size={24} />}
        label="Novo"
        onClick={() => setSheetOpen(true)}
      />

      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Novo investimento"
        description="Interface de demonstração — sem persistência"
        maxHeight="medium"
      >
        <div className="flex flex-col gap-fd-4 p-fd-4">
          <div className="flex gap-fd-2">
            <ChipFilter
              label="Renda Fixa"
              active={newInv.type === 'renda-fixa'}
              onClick={() => setNewInv((p) => ({ ...p, type: 'renda-fixa' }))}
            />
            <ChipFilter
              label="Renda Variável"
              active={newInv.type === 'renda-variavel'}
              onClick={() => setNewInv((p) => ({ ...p, type: 'renda-variavel' }))}
            />
          </div>

          <div className="flex flex-col gap-fd-1">
            <label className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
              Nome / Ticker
            </label>
            <input
              type="text"
              value={newInv.name}
              onChange={(e) => setNewInv((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: PETR4, Tesouro Selic"
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
              Valor
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={newInv.value}
              onChange={(e) => setNewInv((p) => ({ ...p, value: e.target.value }))}
              placeholder="0,00"
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
