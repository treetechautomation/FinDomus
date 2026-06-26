import * as XLSX from 'xlsx';
import { BrokerImportResult, BrokerPosition, BrokerIncome, BrokerTransaction } from './broker-types';
import { BROKER_LAYOUTS } from './layouts/registry';

export function parseB3BrokerXlsx(buffer: Buffer, schemaKey: string, fileName: string): BrokerImportResult {
  const startTime = Date.now();
  const result: BrokerImportResult = {
    detected: {
      source: 'UNKNOWN',
      documentType: 'UNKNOWN',
      format: 'XLSX',
      schemaKey,
      confidence: 1.0,
      reason: 'Schema pré-definido pelo layout catálogo.'
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

  try {
    const layout = BROKER_LAYOUTS.find(l => l.id === schemaKey);
    if (!layout) {
      throw new Error(`Layout/Schema de corretora não encontrado no catálogo: ${schemaKey}`);
    }

    result.detected.source = layout.broker;
    result.detected.documentType = layout.documentType;
    result.detected.layoutName = layout.id;
    result.detected.version = layout.version;

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = layout.sheetName || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Aba "${sheetName}" não encontrada no arquivo.`);
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    if (!rows || rows.length === 0) {
      throw new Error('Nenhuma linha encontrada no documento.');
    }

    result.detected.totalLines = rows.length;

    let year = new Date().getFullYear();
    const yearMatch = fileName.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    // Locate the header row to dynamic check column mapping
    const headerRowIndex = findHeaderRowIndex(rows, layout.columns);
    const headerRow = rows[headerRowIndex] || [];
    
    // Resolve start row index
    let currentStartRow = headerRowIndex + 1;
    if (layout.startRowOffset !== undefined) {
      currentStartRow = layout.startRowOffset;
    }

    // Number parser helper
    const parseVal = (val: any): number => {
      if (val === undefined || val === null || val === '-') return 0;
      if (typeof val === 'number') return val;
      const clean = String(val).replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
      return parseFloat(clean) || 0;
    };

    // Date parser helper
    const parseDateVal = (val: any): { dateStr: string; yearVal: number } => {
      if (val === undefined || val === null) {
        const today = new Date().toLocaleDateString('pt-BR');
        return { dateStr: today, yearVal: year };
      }
      
      // If serial Excel date
      if (typeof val === 'number' && val > 30000 && val < 60000) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const jsDate = new Date(excelEpoch.getTime() + val * 86400000);
        const day = String(jsDate.getUTCDate()).padStart(2, '0');
        const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        const yearNum = jsDate.getUTCFullYear();
        return { dateStr: `${day}/${month}/${yearNum}`, yearVal: yearNum };
      }

      const str = String(val).trim();
      const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        return { dateStr: str, yearVal: parseInt(match[3], 10) };
      }
      return { dateStr: str, yearVal: year };
    };

    // 1. DYNAMIC CUSTODY VERTICAL SECTIONS (XP CUSTODY)
    if (layout.documentType === 'CUSTODY' && layout.sections && layout.sections.length > 0) {
      let currentSectionIndex = -1;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = row[0] ? String(row[0]).trim() : '';

        // Check if we hit the stop anchor
        if (
          layout.stopRowAnchor &&
          row.some(cell => cell && String(cell).toLowerCase().includes(layout.stopRowAnchor!.toLowerCase()))
        ) {
          break;
        }

        // Detect if row matches any of the section markers
        const sectionMatchIdx = layout.sections.findIndex(sec => 
          firstCell.toLowerCase() === sec.anchor.toLowerCase() ||
          firstCell.toLowerCase().startsWith(sec.anchor.toLowerCase())
        );

        if (sectionMatchIdx !== -1) {
          currentSectionIndex = sectionMatchIdx;
          continue;
        }

        // Skip headers, totals and empty rows
        if (row.some(c => typeof c === 'string' && c.includes('% Alocação'))) continue;
        if (firstCell === '' || firstCell.toLowerCase().includes('total') || firstCell.includes('Anderson Maranhao')) {
          continue;
        }

        if (currentSectionIndex !== -1) {
          const section = layout.sections[currentSectionIndex];
          
          // Merge columns mapping with section overrides
          const mergedColumns = {
            ...layout.columns,
            ...(section.columns || {})
          };

          // Map indexes
          const colIndices = buildColumnIndexMap(headerRow, mergedColumns);

          const tickerOrName = firstCell;
          let ticker = tickerOrName;
          
          if (section.tickerResolver === 'split_space') {
            ticker = tickerOrName.split(' ')[0].trim();
          } else if (section.tickerResolver === 'first_word') {
            ticker = tickerOrName.split(/\s+/)[0].trim();
          } else if (section.tickerResolver === 'direct') {
            ticker = tickerOrName.substring(0, 10).trim();
          }

          const rawMarketValue = colIndices.marketValue !== undefined ? row[colIndices.marketValue] : undefined;
          const marketValue = parseVal(rawMarketValue);

          let quantity = 1;
          let averagePrice = 0;
          let currentPrice = 0;

          // Parse raw columns using the mapped indexes
          const rawQty = colIndices.quantity !== undefined ? row[colIndices.quantity] : undefined;
          const rawAvgPrice = colIndices.averagePrice !== undefined ? row[colIndices.averagePrice] : undefined;
          const rawCurrPrice = colIndices.currentPrice !== undefined ? row[colIndices.currentPrice] : undefined;

          quantity = rawQty !== undefined ? parseVal(rawQty) : 1;
          averagePrice = rawAvgPrice !== undefined ? parseVal(rawAvgPrice) : 0;
          currentPrice = rawCurrPrice !== undefined ? parseVal(rawCurrPrice) : 0;

          // Handle custom calculations mapped to the section
          if (section.calculate?.averagePrice === 'applied_div_quantity') {
            averagePrice = quantity > 0 ? averagePrice / quantity : 0;
          }
          if (section.calculate?.currentPrice === 'market_div_quantity') {
            currentPrice = quantity > 0 ? marketValue / quantity : 0;
          }

          // Safe defaults for current price
          if (currentPrice === 0 && marketValue > 0) {
            currentPrice = quantity > 0 ? marketValue / quantity : marketValue;
          }

          const dedupeKey = `broker_position_\${userId}*${layout.broker}*${year}*${ticker}*${section.assetType}`;

          result.positions.push({
            source: layout.broker,
            broker: layout.broker,
            documentType: 'CUSTODY',
            ticker,
            name: tickerOrName,
            assetType: section.assetType,
            institution: 'XP INVESTIMENTOS CCTVM S/A', // fallback
            quantity,
            averagePrice,
            currentPrice,
            marketValue,
            year,
            dedupeKey
          });
        }
      }
    } else {
      // 2. FLAT LAYOUT TABLE (XP LEDGER, BTG LEDGER, ETC.)
      const colIndices = buildColumnIndexMap(headerRow, layout.columns);

      for (let i = currentStartRow; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // Skip totals and meta
        const checkTotal = row[0] ? String(row[0]).trim() : '';
        if (checkTotal === 'Total' || checkTotal === 'Saldo Diário') continue;

        // Check if date exists and is valid
        const rawDate = colIndices.date !== undefined ? row[colIndices.date] : undefined;
        if (rawDate === undefined || rawDate === null) continue;

        const { dateStr, yearVal } = parseDateVal(rawDate);
        if (!dateStr || !dateStr.match(/^\d/)) continue;

        // Parse fields
        const rawOp = colIndices.operation !== undefined ? row[colIndices.operation] : '';
        const operationType = String(rawOp).trim();

        const rawProduct = colIndices.ticker !== undefined ? row[colIndices.ticker] : '';
        const rawDesc = colIndices.description !== undefined ? row[colIndices.description] : '';
        
        const productString = String(rawProduct || rawDesc).trim();
        const descriptionString = String(rawDesc).trim();

        // Extract ticker from product/description string
        let ticker = 'UNKNOWN';
        if (productString) {
          const tickerParts = productString.split(' - ');
          ticker = tickerParts[0].trim();
          // Regex fallback if ticker is too long or contains spaces
          if (ticker.length > 8 || ticker.includes(' ')) {
            const tickerMatch = productString.match(/\b([A-Z0-9]{4,6})\b/);
            if (tickerMatch) {
              ticker = tickerMatch[1];
            }
          }
        }

        const quantity = colIndices.quantity !== undefined ? parseVal(row[colIndices.quantity]) : 1;
        const price = colIndices.averagePrice !== undefined ? parseVal(row[colIndices.averagePrice]) : 0;
        const amount = colIndices.amount !== undefined ? parseVal(row[colIndices.amount]) : 0;

        // Income detection
        const isIncome = ['Dividendo', 'Juros Sobre Capital Próprio', 'Rendimento', 'JSCP', 'Proventos', 'Juros S/ Capital'].some(t =>
          operationType.toLowerCase().includes(t.toLowerCase()) || 
          descriptionString.toLowerCase().includes(t.toLowerCase())
        );

        if (isIncome) {
          const matchedType = operationType.toLowerCase().includes('juros') || descriptionString.toLowerCase().includes('juros') || descriptionString.toLowerCase().includes('jscp') 
            ? 'Juros Sobre Capital Próprio' 
            : 'Dividendo';
            
          const dedupeKey = `broker_income_\${userId}*${layout.broker}*${yearVal}*${ticker}*${matchedType}_${Math.abs(amount)}`;
          
          result.dividends.push({
            source: layout.broker,
            broker: layout.broker,
            ticker,
            type: matchedType,
            amount: Math.abs(amount),
            date: dateStr,
            year: yearVal,
            dedupeKey
          });
        } else {
          // Regular transaction
          const normOp = amount < 0 || operationType.toLowerCase().includes('venda') || operationType.toLowerCase().includes('resgate') ? 'V' : 'C';
          const finalPrice = price || Math.abs(amount);
          
          const dedupeKey = `broker_tx_\${userId}*${layout.broker}*${dateStr}*${ticker}*${normOp}*${quantity}*${finalPrice}_${Math.abs(amount)}`;
          
          result.transactions.push({
            source: layout.broker,
            broker: layout.broker,
            ticker,
            operation: normOp,
            quantity: quantity || 1,
            price: finalPrice,
            amount: Math.abs(amount),
            date: dateStr,
            dedupeKey
          });
        }
      }
    }

  } catch (err: any) {
    result.errors.push(`Erro no Universal XLSX/CSV Parser: ${err.message}`);
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
function findHeaderRowIndex(rows: any[][], columnsConfig: Record<string, any>): number {
  if (!columnsConfig || Object.keys(columnsConfig).length === 0) return 0;
  
  const maxSearch = Math.min(30, rows.length);
  let bestRowIndex = 0;
  let maxMatches = -1;

  for (let r = 0; r < maxSearch; r++) {
    const row = rows[r];
    if (!row) continue;
    
    let matches = 0;
    for (const key of Object.keys(columnsConfig)) {
      const colConfig = columnsConfig[key];
      if (!colConfig || !colConfig.aliases) continue;
      
      const found = row.some(cell => {
        if (cell === undefined || cell === null) return false;
        const cellStr = String(cell).toLowerCase().trim();
        return colConfig.aliases.some((alias: string) => cellStr === alias.toLowerCase().trim() || cellStr.includes(alias.toLowerCase().trim()));
      });
      if (found) matches++;
    }
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestRowIndex = r;
    }
  }
  
  return bestRowIndex;
}

function buildColumnIndexMap(
  headerRow: any[],
  columnsConfig: Record<string, any>
): Record<string, number> {
  const map: Record<string, number> = {};
  
  for (const key of Object.keys(columnsConfig)) {
    const colConfig = columnsConfig[key];
    if (!colConfig) continue;
    
    let foundIndex = -1;
    if (headerRow) {
      for (let c = 0; c < headerRow.length; c++) {
        const cell = headerRow[c];
        if (cell === undefined || cell === null) continue;
        const cellStr = String(cell).toLowerCase().trim();
        const aliasMatch = colConfig.aliases.some((alias: string) => 
          cellStr === alias.toLowerCase().trim() ||
          cellStr.includes(alias.toLowerCase().trim())
        );
        if (aliasMatch) {
          foundIndex = c;
          break;
        }
      }
    }
    
    if (foundIndex === -1 && colConfig.index !== undefined) {
      foundIndex = colConfig.index;
    }
    
    map[key] = foundIndex;
  }
  
  return map;
}
