'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/core/finance/formatters';
import type { TransactionDTO } from '@/services/firestore/transactions';
import {
  HeroCard,
  MetricDualCard,
  ListItemCard,
  ChipFilter,
  SearchBar,
  FAB,
  BottomSheet,
} from '@/components/mobile';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';

type FilterId = 'todos' | 'receitas' | 'despesas' | 'transferencias';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'receitas', label: 'Receitas' },
  { id: 'despesas', label: 'Despesas' },
  { id: 'transferencias', label: 'Transferências' },
];

interface NewTransactionForm {
  description: string;
  amount: string;
  type: 'income' | 'expense';
}

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

function buildSubtitle(tx: TransactionDTO): string {
  const category = tx.category || '';
  const date = tx.dateISO
    ? new Date(tx.dateISO).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : '';
  return [category, date].filter(Boolean).join(' · ') || 'Transação';
}

function buildTxValue(tx: TransactionDTO): string {
  const amount = Number(tx.amount || 0);
  const prefix = tx.type === 'income' ? '+' : '-';
  return `${prefix}${formatCurrency(Math.abs(amount))}`;
}

export interface MobileFinancasViewProps {
  dashboard: any;
  transactions: TransactionDTO[];
  loading: boolean;
  showQuickAdd?: boolean;
}

export function MobileFinancasView({
  dashboard,
  transactions,
  loading,
  showQuickAdd = true,
}: MobileFinancasViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('todos');
  const [search, setSearch] = useState('');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [newTx, setNewTx] = useState<NewTransactionForm>({
    description: '',
    amount: '',
    type: 'expense',
  });

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (activeFilter === 'receitas') {
      list = list.filter((t) => t.type === 'income');
    } else if (activeFilter === 'despesas') {
      list = list.filter((t) => t.type === 'expense');
    } else if (activeFilter === 'transferencias') {
      list = list.filter((t) => t.type === 'transfer');
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          (t.description || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const da = a.dateISO || a.date || '';
      const db = b.dateISO || b.date || '';
      return db.localeCompare(da);
    });

    return list;
  }, [transactions, activeFilter, search]);

  const heroValue = dashboard ? formatCurrency(dashboard.total ?? 0) : 'R$ 0,00';
  const incomeValue = dashboard ? formatCurrency(dashboard.monthly?.income ?? 0) : 'R$ 0,00';
  const expenseValue = dashboard ? formatCurrency(dashboard.monthly?.expenses ?? 0) : 'R$ 0,00';

  return (
    <div
      className="flex flex-col gap-fd-4 pb-fd-4"
      role="main"
      aria-label="Fluxo de Caixa"
    >
      {/* ─── HeroCard ─────────────────────────────────────────────── */}
      <div className="pt-fd-3">
        <HeroCard
          value={heroValue}
          label="Saldo atual"
          supportingText="Contas PF + PJ"
          className="rounded-fd-md"
          loading={loading}
        />
      </div>

      {/* ─── MetricDualCard ───────────────────────────────────────── */}
      <div>
        <MetricDualCard
          leftLabel="Receitas"
          leftValue={incomeValue}
          rightLabel="Despesas"
          rightValue={expenseValue}
          leftSupportingText="Este mês"
          rightSupportingText="Este mês"
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
          placeholder="Buscar por descrição ou categoria..."
          loading={loading}
        />
      </div>

      {/* ─── Lista de Movimentações ────────────────────────────────── */}
      <div className="flex flex-col gap-fd-2">
        <span
          className="fd-caption"
          style={{ color: 'var(--fd-color-text-secondary)' }}
        >
          {activeFilter === 'todos'
            ? 'Todas as movimentações'
            : activeFilter === 'receitas'
              ? 'Receitas'
              : activeFilter === 'despesas'
                ? 'Despesas'
                : 'Transferências'}
          {search && ` · "${search}"`}
        </span>

        {filtered.length === 0 && !loading && (
          <span
            className="fd-body"
            style={{ color: 'var(--fd-color-text-tertiary)' }}
          >
            Nenhuma movimentação encontrada.
          </span>
        )}

        <div className="flex flex-col gap-fd-1">
          {filtered.map((tx, i) => (
            <ListItemCard
              key={tx.id || `${tx.description}-${i}`}
              title={tx.description || 'Sem descrição'}
              subtitle={buildSubtitle(tx)}
              value={buildTxValue(tx)}
              icon={<TransactionIcon value={buildTxValue(tx)} />}
              showChevron
              className="rounded-fd-md"
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* ─── FAB + BottomSheet ─────────────────────────────────────── */}
      {showQuickAdd && (
        <>
          <FAB
            icon={<Plus size={24} />}
            label="Novo"
            onClick={() => setSheetOpen(true)}
          />

          <BottomSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            title="Novo lançamento"
            description="Interface de demonstração — sem persistência"
            maxHeight="medium"
          >
            <div className="flex flex-col gap-fd-4 p-fd-4">
              <div className="flex gap-fd-2">
                <ChipFilter
                  label="Despesa"
                  active={newTx.type === 'expense'}
                  onClick={() => setNewTx((p) => ({ ...p, type: 'expense' }))}
                />
                <ChipFilter
                  label="Receita"
                  active={newTx.type === 'income'}
                  onClick={() => setNewTx((p) => ({ ...p, type: 'income' }))}
                />
              </div>

              <div className="flex flex-col gap-fd-1">
                <label
                  className="fd-caption"
                  style={{ color: 'var(--fd-color-text-secondary)' }}
                >
                  Descrição
                </label>
                <input
                  type="text"
                  value={newTx.description}
                  onChange={(e) =>
                    setNewTx((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Ex: Supermercado"
                  className="fd-surface-raised fd-body px-fd-3 py-fd-2"
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
                <label
                  className="fd-caption"
                  style={{ color: 'var(--fd-color-text-secondary)' }}
                >
                  Valor
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newTx.amount}
                  onChange={(e) =>
                    setNewTx((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="0,00"
                  className="fd-surface-raised fd-body px-fd-3 py-fd-2"
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
        </>
      )}
    </div>
  );
}
