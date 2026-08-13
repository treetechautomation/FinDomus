import type { KernelResult } from '@/core/finance/kernel';
import type { ActionPlanItem } from '@/core/finance/freedom-engine';
import { formatCurrency } from '@/core/finance/formatters';
import type { TransactionDTO } from '@/services/firestore/transactions';

export interface MobileHomeData {
  hero: {
    value: string;
    label: string;
    variation?: {
      value: string;
      direction: 'up' | 'down' | 'neutral';
    };
    supportingText?: string;
  };
  freedomIndex: {
    title: string;
    value: string;
    percent: number;
    supportingText: string;
    status: 'positive' | 'warning' | 'negative' | 'neutral';
  };
  insight?: {
    title: string;
    description: string;
    severity: 'info' | 'success' | 'warning' | 'negative';
    ctaLabel?: string;
  };
  nextAction?: {
    title: string;
    description: string;
    primaryLabel: string;
    secondaryLabel?: string;
  };
  kpis: {
    leftLabel: string;
    leftValue: string;
    rightLabel: string;
    rightValue: string;
    leftSupportingText?: string;
    rightSupportingText?: string;
  };
  transactions: Array<{
    title: string;
    subtitle: string;
    value: string;
  }>;
  loading: boolean;
}

function getPeriod(): 'manha' | 'tarde' | 'noite' {
  const hour = new Date().getHours();
  if (hour < 12) return 'manha';
  if (hour < 18) return 'tarde';
  return 'noite';
}

function getFreedomStatus(percent: number): 'positive' | 'warning' | 'negative' | 'neutral' {
  if (percent >= 60) return 'positive';
  if (percent >= 40) return 'warning';
  if (percent >= 20) return 'negative';
  return 'neutral';
}

function mapSeverity(
  type: string
): 'info' | 'success' | 'warning' | 'negative' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'negative'> = {
    alert: 'warning',
    behavior: 'info',
    recurrence: 'negative',
    subscription: 'info',
    forecast: 'success',
  };
  return map[type] ?? 'info';
}

function buildTransactionSubtitle(tx: TransactionDTO): string {
  const category = tx.category || '';
  const date = tx.dateISO
    ? new Date(tx.dateISO).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : '';
  return [category, date].filter(Boolean).join(' · ') || 'Transação';
}

function buildTransactionValue(tx: TransactionDTO): string {
  const amount = Number(tx.amount || 0);
  const prefix = tx.type === 'income' ? '+' : '-';
  const formatted = formatCurrency(Math.abs(amount));
  return `${prefix}${formatted}`;
}

export function buildMobileHomeData(params: {
  dashboard: any;
  kernel: KernelResult | null;
  contextTransactions: TransactionDTO[];
}): MobileHomeData {
  const { dashboard, kernel, contextTransactions } = params;

  const loading = !dashboard || !kernel;

  const hero = {
    value: dashboard ? formatCurrency(dashboard.total ?? 0) : 'R$ 0,00',
    label: 'Saldo Disponível',
    supportingText: dashboard ? 'Contas PF + PJ' : undefined,
  };

  const kpis = {
    leftLabel: 'Receita',
    leftValue: dashboard ? formatCurrency(dashboard.monthly?.income ?? 0) : 'R$ 0,00',
    rightLabel: 'Despesa',
    rightValue: dashboard ? formatCurrency(dashboard.monthly?.expenses ?? 0) : 'R$ 0,00',
    leftSupportingText: 'Este mês',
    rightSupportingText: 'Este mês',
  };

  const fi = kernel?.freedom?.index;
  const freedomIndex = {
    title: 'Freedom Index',
    value: fi ? `${fi.freedomIndex}/100` : '0/100',
    percent: fi?.freedomIndex ?? 0,
    supportingText: fi?.levelLabel ?? 'Rumo à liberdade financeira',
    status: getFreedomStatus(fi?.freedomIndex ?? 0),
  };

  const topInsight = kernel?.ai?.insights?.[0];
  const insight = topInsight
    ? {
        title: 'Domus IA',
        description: topInsight.description,
        severity: mapSeverity(topInsight.type),
        ctaLabel: 'Ver detalhes',
      }
    : undefined;

  const topAction = kernel?.freedom?.actions?.[0] as ActionPlanItem | undefined;
  const nextAction = topAction
    ? {
        title: topAction.title,
        description: topAction.description,
        primaryLabel: topAction.cta,
        secondaryLabel: 'Depois',
      }
    : undefined;

  const recentTx = (contextTransactions || [])
    .filter((t: TransactionDTO) => {
      const type = t.type;
      return type === 'income' || type === 'expense';
    })
    .sort((a: TransactionDTO, b: TransactionDTO) => {
      const da = a.dateISO || a.date || '';
      const db = b.dateISO || b.date || '';
      return db.localeCompare(da);
    })
    .slice(0, 5)
    .map((tx: TransactionDTO) => ({
      title: tx.description || 'Sem descrição',
      subtitle: buildTransactionSubtitle(tx),
      value: buildTransactionValue(tx),
    }));

  return {
    hero,
    freedomIndex,
    insight,
    nextAction,
    kpis,
    transactions: recentTx,
    loading,
  };
}

export function getPeriodGreeting(): { name: string; period: 'manha' | 'tarde' | 'noite' } {
  const period = getPeriod();
  return { name: '', period };
}
