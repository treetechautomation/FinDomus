import {
  CreditCard,
  Landmark,
  ReceiptText,
  Scale,
  RefreshCcw,
  Building2,
  FileText,
  Calculator,
  TrendingUp,
  BarChart3,
  Upload,
  Settings,
  Crown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type MaisGroup = 'financeiro' | 'gestao' | 'inteligencia' | 'sistema';

export interface MaisItem {
  title: string;
  description: string;
  href: string;
  group: MaisGroup;
  icon: LucideIcon;
  keywords: string[];
}

export const GROUP_LABELS: Record<MaisGroup, string> = {
  financeiro: 'Financeiro',
  gestao: 'Gestão',
  inteligencia: 'Inteligência',
  sistema: 'Sistema',
};

export const MAIS_ITEMS: MaisItem[] = [
  {
    title: 'Contas',
    description: 'Contas bancárias e saldos',
    href: '/contas',
    group: 'financeiro',
    icon: Landmark,
    keywords: ['banco', 'saldo', 'corrente', 'poupança', 'carteira'],
  },
  {
    title: 'Cartões',
    description: 'Cartões de crédito e faturas',
    href: '/cartoes',
    group: 'financeiro',
    icon: CreditCard,
    keywords: ['crédito', 'fatura', 'débito', 'limite'],
  },
  {
    title: 'Parcelas',
    description: 'Compras parceladas pendentes',
    href: '/parcelas',
    group: 'financeiro',
    icon: ReceiptText,
    keywords: ['parcela', 'prestação', 'financiamento'],
  },
  {
    title: 'Passivos',
    description: 'Dívidas, empréstimos e financiamentos',
    href: '/passivos',
    group: 'financeiro',
    icon: Scale,
    keywords: ['dívida', 'empréstimo', 'juros', 'amortização'],
  },
  {
    title: 'Assinaturas',
    description: 'Assinaturas e serviços recorrentes',
    href: '/assinaturas',
    group: 'financeiro',
    icon: RefreshCcw,
    keywords: ['netflix', 'spotify', 'streaming', 'recorrente'],
  },
  {
    title: 'Planejamento',
    description: 'Metas, orçamento e estratégia',
    href: '/planejamento',
    group: 'gestao',
    icon: TrendingUp,
    keywords: ['meta', 'orçamento', 'objetivo', 'wealth'],
  },
  {
    title: 'Empresas',
    description: 'Gestão de empresas e CNPJs',
    href: '/empresas',
    group: 'gestao',
    icon: Building2,
    keywords: ['cnpj', 'empresa', 'pj', 'dash pj'],
  },
  {
    title: 'Fiscal & Contábil',
    description: 'Obrigações fiscais e impostos',
    href: '/fiscal-contabil',
    group: 'gestao',
    icon: FileText,
    keywords: ['imposto', 'darf', 'das', 'contábil', 'fiscal'],
  },
  {
    title: 'Imposto de Renda',
    description: 'Preparação e simulação IRPF',
    href: '/imposto-de-renda',
    group: 'gestao',
    icon: Calculator,
    keywords: ['irpf', 'declaração', 'restituição', 'leão'],
  },
  {
    title: 'Freedom Index',
    description: 'Índice de liberdade financeira',
    href: '/freedom',
    group: 'inteligencia',
    icon: TrendingUp,
    keywords: ['liberdade', 'score', 'pilares', 'independência'],
  },
  {
    title: 'Relatórios',
    description: 'Relatórios financeiros e DRE',
    href: '/relatorios',
    group: 'inteligencia',
    icon: BarChart3,
    keywords: ['dre', 'balanço', 'relatório', 'exportar'],
  },
  {
    title: 'Importações',
    description: 'Importar extratos OFX, PDF e CSV',
    href: '/importacoes',
    group: 'inteligencia',
    icon: Upload,
    keywords: ['ofx', 'pdf', 'csv', 'extrato', 'banco'],
  },
  {
    title: 'Configurações',
    description: 'Preferências, privacidade e conta',
    href: '/configuracoes',
    group: 'sistema',
    icon: Settings,
    keywords: ['senha', 'email', 'privacidade', 'tema', 'notificações'],
  },
  {
    title: 'Planos',
    description: 'Planos e assinatura FinDomus',
    href: '/planos',
    group: 'sistema',
    icon: Crown,
    keywords: ['pro', 'premium', 'assinatura', 'upgrade'],
  },
];
