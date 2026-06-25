import { B3Position, B3Dividend, B3ParseResult } from '@/types/import/b3';
import * as XLSX from 'xlsx';

export function parseB3Xlsx(buffer: Buffer, fileName: string): B3ParseResult {
  const result: B3ParseResult = { positions: [], dividends: [], errors: [] };

  const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    let year = new Date().getFullYear();
    const yearMatch = fileName.match(/(\d{4})/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    }

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      if (!rows || rows.length < 2) return;

      if (sheetName.includes('Posição - Ações')) {
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;
          
          const produto = row[0];
          if (!produto || produto === 'Total' || String(produto).trim() === '') continue;
          
          const ticker = row[3] ? String(row[3]).trim() : '';
          if (!ticker) continue;

          const rawTipo = row[6] ? String(row[6]).trim() : 'ON';
          let tipo = 'ACOES';
          if (['ON', 'PN', 'PNB', 'PNA'].includes(rawTipo)) {
            tipo = 'ACOES';
          } else if (rawTipo === 'Cotas') {
            tipo = 'FII';
          } else if (rawTipo === 'Internacional') {
            tipo = 'ETF';
          } else {
            tipo = rawTipo.toUpperCase();
          }

          const name = String(produto).split(' - ')[1]?.trim() || String(produto).trim();

          result.positions.push({
            id: generateId(),
            ticker,
            nome: name,
            tipo,
            instituicao: row[1] ? String(row[1]).trim() : '',
            quantidade: parseFloat(String(row[8])) || 0,
            preco: parseFloat(String(row[12])) || 0,
            valorAtualizado: parseFloat(String(row[13])) || 0,
            ano: year
          });
        }
      } else if (sheetName.includes('Posição - Tesouro Direto')) {
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const produto = row[0];
          if (!produto || produto === 'Total' || String(produto).trim() === '') continue;

          result.positions.push({
            id: generateId(),
            ticker: String(produto).trim(),
            nome: String(produto).trim(),
            tipo: 'TESOURO',
            instituicao: row[1] ? String(row[1]).trim() : '',
            quantidade: parseFloat(String(row[5])) || 0,
            preco: 0,
            valorAtualizado: parseFloat(String(row[12])) || 0,
            ano: year
          });
        }
      } else if (sheetName.includes('Posição - Renda Fixa')) {
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const produto = row[0];
          if (!produto || produto === 'Total' || String(produto).trim() === '') continue;

          const precoVal = parseFloat(String(row[15])) || parseFloat(String(row[13])) || 0;
          const valorVal = parseFloat(String(row[16])) || parseFloat(String(row[14])) || 0;

          result.positions.push({
            id: generateId(),
            ticker: 'RENDA FIXA',
            nome: String(produto).trim(),
            tipo: 'RENDA_FIXA',
            instituicao: row[1] ? String(row[1]).trim() : '',
            quantidade: parseFloat(String(row[8])) || 0,
            preco: precoVal,
            valorAtualizado: valorVal,
            ano: year
          });
        }
      } else if (sheetName.includes('Proventos Recebidos')) {
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const produto = row[0];
          if (!produto || produto === 'Total' || String(produto).trim() === '') continue;

          result.dividends.push({
            id: generateId(),
            ticker: String(produto).trim(),
            tipo: row[1] ? String(row[1]).trim() : '',
            valor: parseFloat(String(row[2])) || 0,
            ano: year
          });
        }
      }
    });

  } catch (err: any) {
    result.errors.push(`Erro XLSX parser: ${err.message}`);
  }

  return {
    positions: result.positions,
    dividends: result.dividends,
    errors: result.errors,
    rawTextLength: buffer.length,
    positionsCount: result.positions.length,
    incomeCount: result.dividends.length
  };
}
