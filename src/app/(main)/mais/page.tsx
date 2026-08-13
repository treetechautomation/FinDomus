'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ListItemCard, SearchBar, ChipFilter, usePageHeader } from '@/components/mobile';
import {
  MAIS_ITEMS,
  GROUP_LABELS,
  type MaisGroup,
} from '@/app/(main)/mais/mais-items';

const FILTERS: { id: MaisGroup | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'gestao', label: 'Gestão' },
  { id: 'inteligencia', label: 'Inteligência' },
  { id: 'sistema', label: 'Sistema' },
];

export default function MaisPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState<MaisGroup | 'todos'>('todos');
  const [search, setSearch] = React.useState('');

  usePageHeader({ title: 'Mais' });

  const filtered = useMemo(() => {
    let list = [...MAIS_ITEMS];

    if (activeFilter !== 'todos') {
      list = list.filter((item) => item.group === activeFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeFilter, search]);

  const grouped = useMemo(() => {
    const map = new Map<MaisGroup, typeof MAIS_ITEMS>();
    for (const item of filtered) {
      const group = map.get(item.group) || [];
      group.push(item);
      map.set(item.group, group);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-fd-4 pb-fd-4" role="main" aria-label="Mais">
      {/* ─── Title ───────────────────────────────────────────────── */}
      <div className="pt-fd-3">
        <h1
          className="fd-heading-1"
          style={{ color: 'var(--fd-color-text-primary)' }}
        >
          Mais
        </h1>
        <p
          className="fd-body mt-fd-1"
          style={{ color: 'var(--fd-color-text-secondary)' }}
        >
          Todos os módulos do FinDomus
        </p>
      </div>

      {/* ─── SearchBar ────────────────────────────────────────────── */}
      <div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Pesquisar módulos..."
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

      {/* ─── Grouped List ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <span
          className="fd-body"
          style={{ color: 'var(--fd-color-text-tertiary)' }}
        >
          Nenhum módulo encontrado.
        </span>
      )}

      {Array.from(grouped.entries()).map(([group, items]) => (
        <div key={group} className="flex flex-col gap-fd-2">
          <span
            className="fd-caption"
            style={{ color: 'var(--fd-color-text-secondary)' }}
          >
            {GROUP_LABELS[group]}
          </span>
          <div className="flex flex-col gap-fd-1">
            {items.map((item) => (
              <ListItemCard
                key={item.href}
                title={item.title}
                subtitle={item.description}
                icon={
                  <item.icon
                    size={16}
                    style={{ color: 'var(--fd-color-text-secondary)' }}
                    aria-hidden
                  />
                }
                showChevron
                onClick={() => router.push(item.href)}
                className="rounded-fd-md"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
