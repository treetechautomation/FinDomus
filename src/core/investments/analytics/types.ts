export interface AllocationItem {
  name: string;
  value: number;
  percentage: number;
}

export interface AllocationBreakdown {
  byClass: AllocationItem[];
  byInstitution: AllocationItem[];
  byOrigin: AllocationItem[];
  byCurrency: AllocationItem[];
  bySector: AllocationItem[];
}

export interface AssetPerformance {
  ticker: string;
  name: string;
  invested: number;
  marketValue: number;
  profit: number;
  profitPercent: number;
}

export interface GroupPerformance {
  name: string;
  invested: number;
  marketValue: number;
  profit: number;
  profitPercent: number;
}

export interface PerformanceAnalytics {
  totalInvested: number;
  totalMarketValue: number;
  totalProfit: number;
  totalProfitPercent: number;
  byAsset: AssetPerformance[];
  byInstitution: GroupPerformance[];
  byOrigin: GroupPerformance[];
}

export interface YearlyDividend {
  year: number;
  amount: number;
}

export interface ClassDividend {
  name: string;
  amount: number;
}

export interface AssetDividend {
  ticker: string;
  amount: number;
}

export interface DividendAnalytics {
  totalReceived: number;
  dividendYield: number; // %
  yieldOnCost: number; // %
  byYear: YearlyDividend[];
  byClass: ClassDividend[];
  byAsset: AssetDividend[];
}

export interface ConcentrationAlert {
  type: 'asset' | 'institution' | 'sector' | 'currency' | 'country';
  name: string;
  percentage: number;
  threshold: number;
  severity: 'info' | 'warning' | 'danger';
  message: string;
}

export interface RiskAnalytics {
  concentrationAlerts: ConcentrationAlert[];
  diversificationScore: number; // 0-100
  liquidityPercent: number; // %
  assetConcentration: AllocationItem[];
  institutionConcentration: AllocationItem[];
  sectorConcentration: AllocationItem[];
  countryConcentration: AllocationItem[];
}

export interface HealthPillarScore {
  name: string;
  score: number; // 0-20
  maxScore: number; // 20
  feedback: string;
}

export interface HealthScoreResult {
  score: number; // 0-100
  grade: string; // A+, A, B, C, D, F
  pilars: {
    diversification: HealthPillarScore;
    concentration: HealthPillarScore;
    liquidity: HealthPillarScore;
    dividends: HealthPillarScore;
    risk: HealthPillarScore;
  };
}

export interface InsightMessage {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  category: string;
}

export interface InvestmentAnalytics {
  allocation: AllocationBreakdown;
  performance: PerformanceAnalytics;
  dividends: DividendAnalytics;
  risk: RiskAnalytics;
  health: HealthScoreResult;
  insights: InsightMessage[];
  lastGenerated: string;
}
