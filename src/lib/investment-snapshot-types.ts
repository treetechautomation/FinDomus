import type { DataContract, SnapshotStatus, SnapshotHealth } from './data-contract';

export interface InvestmentSnapshotData {
  totalInvested: number;
  totalMarketValue: number;
  totalProfit: number;
  profitPercent: number;

  dividendYield: number;
  yieldOnCost: number;
  totalDividendsReceived: number;

  healthScore: number;
  healthGrade: string;

  diversificationScore: number;

  allocationByClass: Array<{ name: string; value: number; percent: number }>;
  allocationByInstitution: Array<{ name: string; value: number }>;
  allocationByOrigin: Array<{ name: string; value: number }>;

  topAssets: Array<{
    ticker: string;
    name: string;
    assetClass: string;
    marketValue: number;
    profitPercent: number;
    participationPercent: number;
  }>;

  riskAlerts: string[];
  insights: string[];
}

export interface InvestmentSnapshot extends DataContract {
  domain: 'investment';
  classification: 'ULTRA_CRITICO';
  data: InvestmentSnapshotData;
}

export type { SnapshotStatus, SnapshotHealth };
