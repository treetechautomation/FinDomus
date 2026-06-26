import { NormalizedBrokerImport, NormalizedBrokerImportMetrics } from './broker-types';

export function validateBrokerImport(normalized: NormalizedBrokerImport): NormalizedBrokerImport {
  const startTime = Date.now();
  const warnings: string[] = [...normalized.warnings];
  const errors: string[] = [...normalized.errors];

  // 1. Document Level Validation
  if (
    normalized.positions.length === 0 &&
    normalized.income.length === 0 &&
    normalized.transactions.length === 0
  ) {
    errors.push('Documento não contém posições, proventos ou transações válidas.');
  }

  if (normalized.metadata.confidence < 0.75) {
    warnings.push(`Confiança da detecção está baixa (${(normalized.metadata.confidence * 100).toFixed(0)}%). Verifique se o layout está correto.`);
  }

  if (normalized.metadata.format !== 'PDF' && !normalized.metadata.schemaKey) {
    errors.push('Layout de planilha (XLSX/CSV) não possui esquema correspondente configurado.');
  }

  if (normalized.metadata.documentType === 'UNKNOWN') {
    errors.push('Tipo de documento não reconhecido (UNKNOWN).');
  }

  if (normalized.metadata.broker === 'UNKNOWN') {
    errors.push('Corretora não reconhecida (UNKNOWN).');
  }

  // Metrics initializations
  let totalMarketValue = 0;
  let totalIncome = 0;
  let totalTransactionsAmount = 0;
  let buyCount = 0;
  let sellCount = 0;

  // 2. Positions Validation
  normalized.positions.forEach(p => {
    totalMarketValue += p.marketValue || 0;

    if (!p.ticker) {
      errors.push(`[Posição] Ativo com ticker vazio.`);
    }
    if (p.quantity <= 0) {
      errors.push(`[Posição ${p.ticker || 'Sem Ticker'}] Quantidade deve ser maior que zero (valor: ${p.quantity}).`);
    }
    if (p.marketValue < 0) {
      errors.push(`[Posição ${p.ticker || 'Sem Ticker'}] Valor de mercado não pode ser negativo (valor: ${p.marketValue}).`);
    }
    if (!p.year || p.year < 1900 || p.year > 2100) {
      errors.push(`[Posição ${p.ticker || 'Sem Ticker'}] Ano inválido ou ausente (valor: ${p.year}).`);
    }

    if (p.averagePrice === 0 || p.averagePrice === undefined || p.averagePrice === null) {
      warnings.push(`[Posição ${p.ticker || 'Sem Ticker'}] Preço médio ausente ou zerado.`);
    }
    if (p.currentPrice === 0 || p.currentPrice === undefined || p.currentPrice === null) {
      warnings.push(`[Posição ${p.ticker || 'Sem Ticker'}] Preço atual ausente ou zerado.`);
    }
    if (!p.institution) {
      warnings.push(`[Posição ${p.ticker || 'Sem Ticker'}] Instituição financeira vazia.`);
    }
    if (p.assetType === 'UNKNOWN') {
      warnings.push(`[Posição ${p.ticker || 'Sem Ticker'}] Classe de ativo desconhecida (UNKNOWN).`);
    }
  });

  // 3. Income Validation
  normalized.income.forEach(inc => {
    totalIncome += inc.amount || 0;

    if (!inc.ticker) {
      errors.push(`[Provento] Lançamento com ticker vazio.`);
    }
    if (inc.amount <= 0) {
      errors.push(`[Provento ${inc.ticker || 'Sem Ticker'}] Valor líquido deve ser maior que zero (valor: ${inc.amount}).`);
    }
    if (!inc.year || inc.year < 1900 || inc.year > 2100) {
      errors.push(`[Provento ${inc.ticker || 'Sem Ticker'}] Ano inválido ou ausente (valor: ${inc.year}).`);
    }

    if (inc.incomeType === 'UNKNOWN') {
      warnings.push(`[Provento ${inc.ticker || 'Sem Ticker'}] Tipo de rendimento desconhecido (UNKNOWN).`);
    }
    if (!inc.paymentDate) {
      warnings.push(`[Provento ${inc.ticker || 'Sem Ticker'}] Data de pagamento ausente.`);
    }
  });

  // 4. Transactions Validation
  normalized.transactions.forEach(t => {
    totalTransactionsAmount += t.grossAmount || 0;

    const op = String(t.operation).toUpperCase();
    if (op === 'C' || op.includes('COMPRA')) {
      buyCount++;
    } else if (op === 'V' || op.includes('VENDA')) {
      sellCount++;
    }

    if (!t.ticker) {
      errors.push(`[Transação] Ativo com ticker vazio.`);
    }
    if (t.quantity <= 0) {
      errors.push(`[Transação ${t.ticker || 'Sem Ticker'}] Quantidade operada inválida (valor: ${t.quantity}).`);
    }
    if (t.price <= 0) {
      errors.push(`[Transação ${t.ticker || 'Sem Ticker'}] Preço unitário inválido (valor: ${t.price}).`);
    }
    if (t.grossAmount <= 0) {
      errors.push(`[Transação ${t.ticker || 'Sem Ticker'}] Valor bruto da operação inválido (valor: ${t.grossAmount}).`);
    }
    if (!['C', 'V', 'COMPRA', 'VENDA'].some(o => op.includes(o))) {
      errors.push(`[Transação ${t.ticker || 'Sem Ticker'}] Operação inválida (valor: ${t.operation}).`);
    }
    if (!t.date || !t.date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      errors.push(`[Transação ${t.ticker || 'Sem Ticker'}] Data de operação inválida ou mal formatada (valor: ${t.date}).`);
    }

    if (t.fees === undefined || t.fees === null) {
      warnings.push(`[Transação ${t.ticker || 'Sem Ticker'}] Taxas ausentes.`);
    }
    if (t.taxes === undefined || t.taxes === null) {
      warnings.push(`[Transação ${t.ticker || 'Sem Ticker'}] Impostos ausentes.`);
    }
    if (t.netAmount === undefined || t.netAmount === null) {
      warnings.push(`[Transação ${t.ticker || 'Sem Ticker'}] Valor líquido ausente.`);
    }
  });

  // Calculate execution time of validation
  const validationTimeMs = Date.now() - startTime;
  const totalProcessingTimeMs = normalized.metrics.processingTimeMs + validationTimeMs;

  const metrics: NormalizedBrokerImportMetrics = {
    positionsCount: normalized.positions.length,
    incomeCount: normalized.income.length,
    transactionsCount: normalized.transactions.length,
    totalMarketValue,
    totalIncome,
    totalTransactionsAmount,
    buyCount,
    sellCount,
    warningsCount: warnings.length,
    errorsCount: errors.length,
    processingTimeMs: totalProcessingTimeMs
  };

  return {
    ...normalized,
    warnings,
    errors,
    metrics
  };
}
