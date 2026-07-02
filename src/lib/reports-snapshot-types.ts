import type { DataContract } from './data-contract';

export interface ReportsSnapshotData {
  owner: 'PF' | 'PJ';
  monthKey: string;

  income: number;
  expenses: number;
  balance: number;

  dre: {
    receitaBruta: number;
    impostos: number;
    receitaLiquida: number;
    despesas: number;
    pessoas: number;
    proLabore: number;
    outros: number;
    lucroBruto: number;
    lucroOperacional: number;
    lucroLiquido: number;
  } | null;

  byCategory: Record<string, number>;

  transactionCount: number;

  openingBalance: number;
  closingBalance: number;
}

export interface ReportsSnapshot extends DataContract {
  domain: 'reports';
  classification: 'ULTRA_CRITICO';
  owner: 'PF' | 'PJ';
  monthKey: string;
  data: ReportsSnapshotData;
}
