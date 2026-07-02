import type { DataContract } from './data-contract';

export interface LiabilitySnapshotData {
  totalLiabilities: number;
  monthlyCommitment: number;
  activeCount: number;
  paidOffCount: number;

  averageInterestRate: number;
  debtPressure: number;

  payoffProgress: {
    totalPaid: number;
    totalRemaining: number;
    percentComplete: number;
  };

  projection: Record<string, number>;

  topRisks: Array<{
    name: string;
    remainingBalance: number;
    installmentValue: number;
    remainingMonths: number;
  }>;
}

export interface LiabilitySnapshot extends DataContract {
  domain: 'liability';
  classification: 'ULTRA_CRITICO';
  data: LiabilitySnapshotData;
}
