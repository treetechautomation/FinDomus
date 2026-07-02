import type { DataContract, SnapshotStatus, SnapshotHealth } from './data-contract';

export interface DashboardSnapshotData {
  totalPF: number;
  totalPJ: number;
  totalInvestments: number;
  totalLiabilities: number;
  netWorth: number;

  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;

  freedomIndex: number;
  freedomLevel: string;
  freedomBreakdown: Record<string, number>;

  allocation: Array<{ name: string; value: number; fill: string }>;
  monthlyFlow: Array<{ month: string; income: number; expenses: number }>;
}

export interface DashboardSnapshot extends DataContract {
  domain: 'dashboard';
  classification: 'ULTRA_CRITICO';
  data: DashboardSnapshotData;
}

export type { SnapshotStatus, SnapshotHealth };
