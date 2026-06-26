import * as XLSX from 'xlsx';
import { BrokerImportResult, BrokerPosition, BrokerIncome, BrokerTransaction } from './broker-types';
import { BROKER_SCHEMAS } from './broker-schemas';

export function parseB3BrokerXlsx(buffer: Buffer, schemaKey: string, fileName: string): BrokerImportResult {
  const result: BrokerImportResult = {
    detected: {
      source: 'UNKNOWN',
      documentType: 'UNKNOWN',
      format: 'XLSX',
      schemaKey,
      confidence: 1.0,
      reason: 'Schema pre-definido.'
    },
    positions: [],
    dividends: [],
    transactions: [],
    errors: [],
    metrics: {
      positionsCount: 0,
      incomeCount: 0,
      transactionsCount: 0,
      executionTimeMs: 0
    }
  };

  const startTime = Date.now();

  try {
    const schema = BROKER_SCHEMAS[schemaKey];
    if (!schema) {
      throw new Error(`Esquema de corretora não encontrado: ${schemaKey}`);
    }

    result.detected.source = schema.source;
    result.detected.documentType = schema.documentType;

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[schema.sheetName];
    if (!sheet) {
      throw new Error(`Aba "${schema.sheetName}" não encontrada no arquivo.`);
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    if (!rows || rows.length === 0) {
      throw new Error('Nenhuma linha encontrada no documento.');
    }

    let year = new Date().getFullYear();
    const yearMatch = fileName.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    // 1. XP CUSTODY XLSX
    if (schemaKey === 'XP_CUSTODY_XLSX') {
      let currentAssetType = 'UNKNOWN';

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = row[0] ? String(row[0]).trim() : '';

        // Detect current asset section
        if (firstCell === 'Ações' || firstCell === 'Açoes') {
          currentAssetType = 'ACOES';
          continue;
        }
        if (firstCell === 'Tesouro Direto') {
          currentAssetType = 'TESOURO';
          continue;
        }
        if (firstCell === 'Fundos de Investimentos' || firstCell === 'Fundos') {
          currentAssetType = 'FII';
          continue;
        }
        if (firstCell === 'Renda Fixa') {
          currentAssetType = 'RENDA_FIXA';
          continue;
        }

        // Skip headers, totals and blanks
        if (row.some(c => typeof c === 'string' && c.includes('% Alocação'))) continue;
        if (firstCell === '' || firstCell.toLowerCase().includes('total') || firstCell.includes('Anderson Maranhao')) {
          continue;
        }

        if (currentAssetType !== 'UNKNOWN') {
          const parseVal = (val: any) => {
            if (val === undefined || val === null || val === '-') return 0;
            if (typeof val === 'number') return val;
            const clean = String(val).replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
            return parseFloat(clean) || 0;
          };

          const tickerOrName = firstCell;
          const marketValue = parseVal(row[1]);

          let quantity = 1;
          let averagePrice = 0;
          let currentPrice = 0;

          if (currentAssetType === 'ACOES') {
            quantity = parseVal(row[6]);
            averagePrice = parseVal(row[4]);
            currentPrice = parseVal(row[5]);
          } else if (currentAssetType === 'TESOURO') {
            quantity = parseVal(row[4]);
            const totalApplied = parseVal(row[3]);
            averagePrice = quantity > 0 ? totalApplied / quantity : 0;
            currentPrice = quantity > 0 ? marketValue / quantity : 0;
          } else if (currentAssetType === 'FII' || currentAssetType === 'RENDA_FIXA') {
            quantity = 1;
            averagePrice = parseVal(row[5]);
            currentPrice = marketValue;
          }

          const ticker = currentAssetType === 'ACOES' ? tickerOrName.split(' ')[0] : tickerOrName.substring(0, 10);
          const dedupeKey = `broker_position_\${userId}*XP*${year}*${ticker}*${currentAssetType}`;

          result.positions.push({
            source: 'XP',
            broker: 'XP',
            documentType: 'CUSTODY',
            ticker,
            name: tickerOrName,
            assetType: currentAssetType,
            institution: 'XP INVESTIMENTOS CCTVM S/A',
            quantity,
            averagePrice,
            currentPrice,
            marketValue,
            year,
            dedupeKey
          });
        }
      }
    }

    // 2. XP LEDGER (MOVIMENTAÇÃO) XLSX
    if (schemaKey === 'XP_LEDGER_XLSX') {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[0] || row[0] === 'Total') continue;

        const dateStr = String(row[1]).trim();
        const operationType = String(row[2]).trim();
        const product = String(row[3]).trim();
        const quantity = parseFloat(String(row[5])) || 0;
        const price = parseFloat(String(row[6])) || 0;
        const amount = parseFloat(String(row[7])) || 0;
        const ticker = product.split(' - ')[0].trim();

        const dateParts = dateStr.split('/');
        const rowYear = dateParts[2] ? parseInt(dateParts[2], 10) : year;
        const isIncome = ['Dividendo', 'Juros Sobre Capital Próprio', 'Rendimento'].includes(operationType);

        if (isIncome) {
          const dedupeKey = `broker_income_\${userId}*XP*${rowYear}*${ticker}*${operationType}_${amount}`;
          result.dividends.push({
            source: 'XP',
            broker: 'XP',
            ticker,
            type: operationType,
            amount,
            date: dateStr,
            year: rowYear,
            dedupeKey
          });
        } else {
          const dedupeKey = `broker_tx_\${userId}*XP*${dateStr}*${ticker}*${operationType}*${quantity}*${price}_${amount}`;
          result.transactions.push({
            source: 'XP',
            broker: 'XP',
            ticker,
            operation: operationType,
            quantity,
            price,
            amount,
            date: dateStr,
            fees: 0,
            dedupeKey
          });
        }
      }
    }

    // 3. BTG LEDGER (EXTRATO) XLSX
    if (schemaKey === 'BTG_LEDGER_XLSX') {
      for (let i = 11; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[1] || row[5] === 'Saldo Diário') continue;

        const dateTimeStr = String(row[1]).trim();
        const dateStr = dateTimeStr.split(' ')[0];
        const category = String(row[2]).trim();
        const transactionType = String(row[3]).trim();
        const description = String(row[5]).trim();
        const amount = parseFloat(String(row[9])) || 0;

        const tickerMatch = description.match(/\b([A-Z0-9]{4,6})\b/);
        const ticker = tickerMatch ? tickerMatch[1] : 'UNKNOWN';

        const dateParts = dateStr.split('/');
        const rowYear = dateParts[2] ? parseInt(dateParts[2], 10) : year;

        const isIncome = ['Rendimento', 'JSCP', 'Dividendo', 'Proventos'].some(t => 
          description.includes(t) || transactionType.includes(t) || category.includes(t)
        );

        if (isIncome) {
          const type = description.includes('Juros') || description.includes('JSCP') ? 'Juros Sobre Capital Próprio' : 'Dividendo';
          const dedupeKey = `broker_income_\${userId}*BTG*${rowYear}*${ticker}*${type}_${amount}`;
          result.dividends.push({
            source: 'BTG',
            broker: 'BTG',
            ticker,
            type,
            amount: Math.abs(amount),
            date: dateStr,
            year: rowYear,
            dedupeKey
          });
        } else {
          const dedupeKey = `broker_tx_\${userId}*BTG*${dateStr}*${ticker}*${transactionType}*${amount}`;
          result.transactions.push({
            source: 'BTG',
            broker: 'BTG',
            ticker,
            operation: amount < 0 ? 'V' : 'C',
            quantity: 1,
            price: Math.abs(amount),
            amount: Math.abs(amount),
            date: dateStr,
            dedupeKey
          });
        }
      }
    }

  } catch (err: any) {
    result.errors.push(`Erro XLSX parser: ${err.message}`);
  }

  result.metrics = {
    positionsCount: result.positions.length,
    incomeCount: result.dividends.length,
    transactionsCount: result.transactions.length,
    executionTimeMs: Date.now() - startTime
  };

  return result;
}
