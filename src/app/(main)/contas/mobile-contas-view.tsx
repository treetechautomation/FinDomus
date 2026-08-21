'use client';

import React, { useMemo } from 'react';
import type { Account } from '@/services/firestore/accounts';
import { formatCurrency } from '@/core/finance/formatters';
import {
  HeroCard,
  MetricDualCard,
  ListItemCard,
  ChipFilter,
  SearchBar,
  FAB,
  BottomSheet,
} from '@/components/mobile';
import { Plus, Landmark, Wallet, Building2 } from 'lucide-react';

type FilterId = 'todos' | 'checking' | 'savings' | 'investment' | 'pj';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'checking', label: 'Corrente' },
  { id: 'savings', label: 'Poupança' },
  { id: 'investment', label: 'Investimento' },
  { id: 'pj', label: 'PJ' },
];

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    checking: 'Conta Corrente',
    salary: 'Conta Salário',
    savings: 'Poupança',
    wallet: 'Carteira',
    investment: 'Investimento',
    credit_card: 'Cartão',
  };
  return map[type] || type;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0] || 'CT').substring(0, 2).toUpperCase();
}

function AccountIcon({ type }: { type: string }) {
  const style = (color: string) => ({
    color: `var(--fd-color-state-${color})`,
    width: '16px',
    height: '16px',
  });

  if (type === 'wallet') return <Wallet size={16} style={style('positive')} />;
  if (type === 'investment') return <Landmark size={16} style={style('positive')} />;
  if (type === 'credit_card') return <Landmark size={16} style={style('warning')} />;
  return <Building2 size={16} style={style('positive')} />;
}

export function MobileContasView({ accounts, loading }: { accounts: Account[]; loading: boolean }) {
  const [activeFilter, setActiveFilter] = React.useState<FilterId>('todos');
  const [search, setSearch] = React.useState('');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [newAccount, setNewAccount] = React.useState({
    name: '',
    type: 'checking',
    owner: 'PF' as 'PF' | 'PJ',
  });

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0),
    [accounts]
  );

  const mainAccount = useMemo(() => {
    const pf = accounts.filter((a) => a.owner === 'PF');
    if (pf.length === 0) return accounts[0];
    const checking = pf.find((a) => a.type === 'checking');
    return checking || pf[0];
  }, [accounts]);

  const filtered = useMemo(() => {
    let list = [...accounts];

    if (activeFilter === 'checking') list = list.filter((a) => a.type === 'checking');
    else if (activeFilter === 'savings') list = list.filter((a) => a.type === 'savings');
    else if (activeFilter === 'investment') list = list.filter((a) => a.type === 'investment');
    else if (activeFilter === 'pj') list = list.filter((a) => a.owner === 'PJ');

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));
    return list;
  }, [accounts, activeFilter, search]);

  return (
    <div className="flex flex-col gap-fd-4 pb-fd-4" role="main" aria-label="Contas">
      {/* ─── HeroCard ─────────────────────────────────────────────── */}
      <div className="pt-fd-3">
        <HeroCard
          value={formatCurrency(totalBalance)}
          label="Saldo total"
          supportingText={`${accounts.length} ${accounts.length === 1 ? 'conta' : 'contas'}`}
          className="rounded-fd-md"
          loading={loading}
        />
      </div>

      {/* ─── MetricDualCard ───────────────────────────────────────── */}
      <div>
        <MetricDualCard
          leftLabel="Contas"
          leftValue={accounts.length}
          rightLabel="Principal"
          rightValue={mainAccount?.name || '—'}
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
          placeholder="Buscar contas..."
          loading={loading}
        />
      </div>

      {/* ─── Lista de Contas ──────────────────────────────────────── */}
      <div className="flex flex-col gap-fd-2">
        <span className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
          {activeFilter === 'todos'
            ? 'Todas as contas'
            : activeFilter === 'pj'
              ? 'Contas PJ'
              : `Contas ${FILTERS.find((f) => f.id === activeFilter)?.label}`}
          {search && ` · "${search}"`}
        </span>

        {filtered.length === 0 && !loading && (
          <span className="fd-body" style={{ color: 'var(--fd-color-text-tertiary)' }}>
            Nenhuma conta encontrada.
          </span>
        )}

        <div className="flex flex-col gap-fd-1">
          {filtered.map((account, i) => (
            <ListItemCard
              key={account.id || `${account.name}-${i}`}
              title={account.name}
              subtitle={`${typeLabel(account.type)}${account.owner === 'PJ' ? ' · PJ' : ''}`}
              value={formatCurrency(Number(account.balance || 0))}
              avatar={
                <span
                  className="text-[10px] font-bold"
                  style={{ color: 'var(--fd-color-text-primary)' }}
                >
                  {getInitials(account.name)}
                </span>
              }
              icon={<AccountIcon type={account.type} />}
              showChevron
              className="rounded-fd-md"
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* ─── FAB + BottomSheet ─────────────────────────────────────── */}
      <FAB
        icon={<Plus size={24} />}
        label="Nova"
        onClick={() => setSheetOpen(true)}
      />

      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Nova conta"
        description="Interface de demonstração — sem persistência"
        maxHeight="medium"
      >
        <div className="flex flex-col gap-fd-4 p-fd-4">
          <div className="flex gap-fd-2">
            <ChipFilter
              label="PF"
              active={newAccount.owner === 'PF'}
              onClick={() => setNewAccount((p) => ({ ...p, owner: 'PF' }))}
            />
            <ChipFilter
              label="PJ"
              active={newAccount.owner === 'PJ'}
              onClick={() => setNewAccount((p) => ({ ...p, owner: 'PJ' }))}
            />
          </div>

          <div className="flex gap-fd-2">
            <ChipFilter
              label="Corrente"
              active={newAccount.type === 'checking'}
              onClick={() => setNewAccount((p) => ({ ...p, type: 'checking' }))}
            />
            <ChipFilter
              label="Poupança"
              active={newAccount.type === 'savings'}
              onClick={() => setNewAccount((p) => ({ ...p, type: 'savings' }))}
            />
          </div>

          <div className="flex flex-col gap-fd-1">
            <label className="fd-caption" style={{ color: 'var(--fd-color-text-secondary)' }}>
              Nome
            </label>
            <input
              type="text"
              value={newAccount.name}
              onChange={(e) => setNewAccount((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Nubank, Itaú Corrente"
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
