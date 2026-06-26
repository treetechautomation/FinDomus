import { 
  BrokerImportResult, 
  NormalizedBrokerImport, 
  NormalizedBrokerPosition, 
  NormalizedBrokerIncome, 
  NormalizedBrokerTransaction 
} from './broker-types';

export function normalizeBrokerImport(
  raw: BrokerImportResult, 
  fileName: string, 
  userId?: string
): NormalizedBrokerImport {
  const broker = raw.detected.source;
  const user = userId || 'preview';
  const currentYear = new Date().getFullYear();

  // Determine doc year from filename if possible, otherwise use current or from raw
  let fileYear = currentYear;
  const yearMatch = fileName.match(/(\d{4})/);
  if (yearMatch) {
    fileYear = parseInt(yearMatch[1], 10);
  }

  // 1. Map Positions
  const positions: NormalizedBrokerPosition[] = raw.positions.map(p => {
    const ticker = p.ticker || '';
    const assetType = p.assetType || 'UNKNOWN';
    const year = p.year || fileYear;
    
    // Position dedupeKey standard:
    // broker_position_${userId || "preview"}_${broker}_${year}_${ticker}_${assetType}
    const dedupeKey = `broker_position_${user}_${broker}_${year}_${ticker}_${assetType}`;

    return {
      source: p.source || broker,
      broker: p.broker || broker,
      documentType: p.documentType || 'CUSTODY',
      ticker,
      assetType,
      name: p.name || '',
      institution: p.institution || '',
      quantity: p.quantity,
      averagePrice: p.averagePrice,
      currentPrice: p.currentPrice,
      marketValue: p.marketValue,
      currency: 'BRL',
      year,
      dedupeKey,
      raw: p
    };
  });

  // 2. Map Income
  const income: NormalizedBrokerIncome[] = raw.dividends.map(d => {
    const ticker = d.ticker || '';
    const incomeType = d.type || 'UNKNOWN';
    const year = d.year || fileYear;
    const amount = d.amount || 0;

    // Income dedupeKey standard:
    // broker_income_${userId || "preview"}_${broker}_${year}_${ticker}_${incomeType}_${amount}
    const dedupeKey = `broker_income_${user}_${broker}_${year}_${ticker}_${incomeType}_${amount}`;

    return {
      source: d.source || broker,
      broker: d.broker || broker,
      ticker,
      incomeType,
      amount,
      currency: 'BRL',
      paymentDate: d.date,
      year,
      dedupeKey,
      raw: d
    };
  });

  // 3. Map Transactions
  const transactions: NormalizedBrokerTransaction[] = raw.transactions.map(t => {
    const ticker = t.ticker || '';
    const operation = t.operation || 'UNKNOWN';
    const quantity = t.quantity || 0;
    const price = t.price || 0;
    const grossAmount = t.amount || 0;
    const date = t.date || '';

    // Transaction dedupeKey standard:
    // broker_tx_${userId || "preview"}_${broker}_${date}_${ticker}_${operation}_${quantity}_${price}_${grossAmount}
    const dedupeKey = `broker_tx_${user}_${broker}_${date}_${ticker}_${operation}_${quantity}_${price}_${grossAmount}`;

    const fees = t.fees || 0;
    const netAmount = grossAmount - fees;

    return {
      source: t.source || broker,
      broker: t.broker || broker,
      ticker,
      operation,
      quantity,
      price,
      grossAmount,
      netAmount,
      fees,
      taxes: 0,
      date,
      currency: 'BRL',
      dedupeKey,
      raw: t
    };
  });

  // Generate metadata
  const metadata = {
    source: raw.detected.source,
    broker: raw.detected.source,
    format: raw.detected.format,
    documentType: raw.detected.documentType,
    schemaKey: raw.detected.schemaKey,
    confidence: raw.detected.confidence,
    fileName,
    year: fileYear,
    generatedAt: new Date().toISOString()
  };

  // Validation engine will populate metrics and messages, initialize them empty
  return {
    metadata,
    positions,
    income,
    transactions,
    warnings: raw.warnings || [],
    errors: raw.errors || [],
    metrics: {
      positionsCount: positions.length,
      incomeCount: income.length,
      transactionsCount: transactions.length,
      totalMarketValue: 0,
      totalIncome: 0,
      totalTransactionsAmount: 0,
      buyCount: 0,
      sellCount: 0,
      warningsCount: 0,
      errorsCount: 0,
      processingTimeMs: raw.metrics.executionTimeMs
    }
  };
}
