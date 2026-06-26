import { BrokerImportResult } from './broker-types';

export function parseSinacorPdf(text: string): BrokerImportResult {
  const result: BrokerImportResult = {
    detected: {
      source: 'UNKNOWN',
      documentType: 'BROKERAGE_NOTE',
      format: 'PDF',
      schemaKey: null,
      confidence: 0.95,
      reason: 'Nota de corretagem padrão Sinacor detectada.'
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
    // Detect broker from text
    const collapsedText = text.replace(/\s+/g, '').toUpperCase();
    if (collapsedText.includes('XPINVESTIMENTOS')) {
      result.detected.source = 'XP';
    } else if (collapsedText.includes('RICOBROKER') || collapsedText.includes('RICOINVESTIMENTOS')) {
      result.detected.source = 'RICO';
    } else if (collapsedText.includes('CLEARCORRETORA')) {
      result.detected.source = 'CLEAR';
    } else if (collapsedText.includes('BTGPACTUAL')) {
      result.detected.source = 'BTG';
    }

    const lines = text.split('\n');
    let pregaoDate = '';

    // Search for Date of Operation: "Data pregão 02/02/2026"
    for (const line of lines) {
      const cleanedLine = line.replace(/([A-Z0-9])\s(?=[A-Z0-9])/gi, '$1').trim();
      const dateMatch = cleanedLine.match(/Data pregão\s*(\d{2}\/\d{2}\/\d{4})/i);
      if (dateMatch) {
        pregaoDate = dateMatch[1];
        break;
      }
    }

    if (!pregaoDate) {
      pregaoDate = new Date().toLocaleDateString('pt-BR');
    }

    // Collapse single spaces globally to handle character-spaced PDF text
    const collapsed = text.replace(/(?<!\s)\s(?!\s)/g, '');

    // Split by 1-BOVESPA to process individual transaction rows
    const parts = collapsed.split('1-BOVESPA');

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const match = part.match(/^(.*?)(@?\d[\d.,]*\d,\d{2})\s+([CD])/i);
      if (!match) continue;

      const prefix = match[1].trim();
      const numbersStr = match[2];

      const parsedNums = parseSpacedNumbers(numbersStr);
      if (!parsedNums) continue;

      // The operation (C/V) is the first character in the prefix
      const operation = prefix.charAt(0).toUpperCase();

      // Clean the title description to get raw stock name
      const titleSpec = prefix
        .replace(/^V/i, '')
        .replace(/^C/i, '')
        .replace(/VVISTA/gi, '')
        .replace(/VISTA/gi, '')
        .replace(/VFRA/gi, '')
        .replace(/FRA/gi, '')
        .replace(/IONARIO/gi, '')
        .replace(/\bC\b/g, '')
        .trim();

      const partsOfTitle = titleSpec.split(/\s{2,}/).filter(Boolean);
      const rawName = partsOfTitle[0] || 'UNKNOWN';
      const ticker = inferTickerFromName(rawName);

      const dedupeKey = `broker_tx_\${userId}*${result.detected.source}*${pregaoDate}*${ticker}*${operation}*${parsedNums.quantity}*${parsedNums.price}_${parsedNums.amount}`;

      result.transactions.push({
        source: result.detected.source,
        broker: result.detected.source,
        ticker,
        operation,
        quantity: parsedNums.quantity,
        price: parsedNums.price,
        amount: parsedNums.amount,
        date: pregaoDate,
        dedupeKey
      });
    }

  } catch (err: any) {
    result.errors.push(`Erro no Sinacor PDF parser: ${err.message}`);
  }

  result.metrics = {
    positionsCount: result.positions.length,
    incomeCount: result.dividends.length,
    transactionsCount: result.transactions.length,
    executionTimeMs: Date.now() - startTime
  };

  return result;
}

// Helpers
function parseSpacedNumbers(str: string): { quantity: number; price: number; amount: number } | null {
  const s = str.replace('@', '').replace(/\s+/g, '');
  const commaIdx = s.indexOf(',');
  if (commaIdx === -1) return null;

  const cents = s.substring(commaIdx + 1, commaIdx + 3);
  const amountStr = s.substring(commaIdx + 3);

  const cleanVal = (valStr: string) => {
    const clean = valStr.replace(/[^\d-]/g, '').replace(/\./g, '');
    if (valStr.includes(',')) {
      const parts = valStr.split(',');
      const integer = parts[0].replace(/[^\d-]/g, '');
      const decimals = parts[1].substring(0, 2);
      return parseFloat(`${integer}.${decimals}`) || 0;
    }
    return parseFloat(valStr) || 0;
  };

  const amount = cleanVal(amountStr);
  const beforeComma = s.substring(0, commaIdx);

  let bestDiff = Infinity;
  let bestResult = { quantity: 1, price: 0, amount };

  for (let len = 1; len < beforeComma.length; len++) {
    const qStr = beforeComma.substring(0, len);
    const pIntStr = beforeComma.substring(len);

    const quantity = parseFloat(qStr);
    const price = parseFloat(`${pIntStr}.${cents}`);

    if (isNaN(quantity) || isNaN(price)) continue;

    const calcAmount = quantity * price;
    const diff = Math.abs(calcAmount - amount);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestResult = { quantity, price, amount };
    }
  }

  return bestResult;
}

function inferTickerFromName(name: string): string {
  const cleanName = name.toUpperCase().replace(/\s+/g, '');
  if (cleanName.includes('VALE')) return 'VALE3';
  if (cleanName === 'BA' || cleanName.includes('BCOBRASIL') || cleanName.includes('BANCOBRASIL')) return 'BBAS3';
  if (cleanName.includes('PETR')) return 'PETR4';
  if (cleanName.includes('ITUB') || cleanName.includes('ITAUBANCO')) return 'ITUB4';
  if (cleanName.includes('BBDC') || cleanName.includes('BRADESCO')) return 'BBDC4';
  if (cleanName.includes('MGLU') || cleanName.includes('MAGAZINELUIZA')) return 'MGLU3';
  return name.substring(0, 6).toUpperCase();
}
