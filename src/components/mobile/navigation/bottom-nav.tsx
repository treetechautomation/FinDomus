'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Landmark, TrendingUp, MessageCircle, MoreHorizontal, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Destination Definition ──────────────────────────────────────────────── */

interface NavDestination {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const DESTINATIONS: NavDestination[] = [
  { id: 'inicio', label: 'Início', href: '/', icon: LayoutDashboard },
  { id: 'financas', label: 'Finanças', href: '/financas', icon: Landmark },
  { id: 'investir', label: 'Investir', href: '/investimentos', icon: TrendingUp },
  { id: 'domus', label: 'Domus', href: '/domus', icon: MessageCircle },
  { id: 'mais', label: 'Mais', href: '/mais', icon: MoreHorizontal },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      className="flex items-center justify-around w-full backdrop-blur-fd-subtle"
      style={{
        height: 'var(--fd-bottom-nav-height)',
        background: 'color-mix(in srgb, var(--fd-color-canvas) 85%, transparent)',
        borderTop: '1px solid var(--fd-color-border-subtle)',
        WebkitBackdropFilter: 'var(--fd-blur-subtle)',
      }}
    >
      {DESTINATIONS.map((dest) => {
        const active = isActive(dest.href);
        return (
          <Link
            key={dest.id}
            href={dest.href}
            aria-label={dest.label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-fd-1 min-w-0 flex-1 select-none relative',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-fdl-action-focus focus-visible:ring-offset-1 focus-visible:rounded-fd-sm',
            )}
            style={{
              minHeight: '44px',
              paddingTop: 'var(--fd-space-1)',
              paddingBottom: 'var(--fd-space-1)',
              color: active
                ? 'var(--fd-color-action-primary)'
                : 'var(--fd-color-text-tertiary)',
              transition: 'color 200ms ease',
            }}
          >
            <dest.icon
              className="shrink-0"
              size={24}
            />

            <span
              className="transition-colors duration-200 fd-tabular-nums"
              style={{
                fontSize: '11px',
                fontWeight: active ? 600 : 500,
                lineHeight: 1.2,
              }}
            >
              {dest.label}
            </span>

            {/* Active indicator dot */}
            {active && (
              <span
                className="absolute rounded-full"
                style={{
                  top: 0,
                  width: '24px',
                  height: '3px',
                  background: 'var(--fd-color-action-primary)',
                  borderRadius: '0 0 4px 4px',
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
