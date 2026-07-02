import type { DataContract, SnapshotStatus, SnapshotHealth } from './data-contract';

export interface PlanningSnapshotData {
  freedomIndex: number;
  freedomLevel: string;
  freedomBreakdown: Record<string, number>;
  freedomTimeline: Array<{
    label: string;
    description: string;
    date: string;
    completed: boolean;
    icon: string;
  }>;
  actionPlan: Array<{
    title: string;
    description: string;
    priority: string;
    impactPts: number;
    impactR$: string;
    cta: string;
    href: string;
    effort: string;
  }>;

  emergencyReserve: {
    reserveAmount: number;
    essentialMonthlyExpenses: number;
    targetMonths: number;
    targetAmount: number;
    reserveGap: number;
    reservePercent: number;
    coveredMonths: number;
  };

  forecast: Array<{
    month: string;
    projectedBalance: number;
    projectedIncome: number;
    projectedExpenses: number;
  }>;

  wealthAnalysis: Array<{
    pilar: string;
    metaPercent: number;
    realizadoPercent: number;
    diferencaPercent: number;
    status: 'good' | 'warning' | 'danger';
  }>;

  dre: {
    receitaTotal: number;
    despesasOperacionais: number;
    essenciais: number;
    qualidadeVida: number;
    estiloVida: number;
    educacao: number;
    saude: number;
    construcaoPatrimonial: number;
    outros: number;
    taxaAcumulacao: number;
  };

  financialCore: {
    netWorth: number;
    cashBalance: number;
    monthlyDebtPayment: number;
  };

  monthlyProjection: Record<string, number>;

  insights: Array<{
    type: string;
    title: string;
    description: string;
    confidence?: number;
  }>;
}

export interface PlanningSnapshot extends DataContract {
  domain: 'planning';
  classification: 'CRITICO';
  data: PlanningSnapshotData;
}

export type { SnapshotStatus, SnapshotHealth };
