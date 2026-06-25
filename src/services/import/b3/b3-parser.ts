import { B3Position, B3Dividend, B3ParseResult } from '@/types/import/b3';

export function parseB3Pdf(text: string): B3ParseResult {
  const result: B3ParseResult = { positions: [], dividends: [], errors: [] };
  
  const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const parseMoney = (str: string) => {
    const clean = str.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  try {
    const normalized = text.replace(/\s+/g, ' ').trim();
    
    let currentYear = new Date().getFullYear();
    const yearMatch = normalized.match(/Data:\s*(\d{4})/i);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1], 10);
    }

    const posStartIndex = normalized.indexOf('Posição');
    const provStartIndex = normalized.indexOf('Proventos recebidos');
    const reimbStartIndex = normalized.indexOf('Reembolsos de empréstimos de ativos');

    let positionsText = '';
    let incomeText = '';

    if (posStartIndex !== -1) {
      const endPosIndex = provStartIndex !== -1 ? provStartIndex : normalized.length;
      positionsText = normalized.substring(posStartIndex, endPosIndex);
    }

    if (provStartIndex !== -1) {
      const endProvIndex = reimbStartIndex !== -1 ? reimbStartIndex : normalized.length;
      incomeText = normalized.substring(provStartIndex, endProvIndex);
    }

    // 1. Actions, FII, ETF, BDR Regex
    const posRegex = /([A-Z0-9]{4,6})\s*-\s*(.+?)\s+(ON|PN|PNB|PNA|Cotas|BDR|Internacional)\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)/gi;
    let match;
    while ((match = posRegex.exec(positionsText)) !== null) {
      const typeLabel = match[3];
      let section = 'ACOES';
      if (['ON', 'PN', 'PNB', 'PNA'].includes(typeLabel)) {
        section = 'ACOES';
      } else if (typeLabel === 'Cotas') {
        section = 'FII';
      } else if (typeLabel === 'Internacional') {
        section = 'ETF';
      } else {
        section = typeLabel.toUpperCase(); // e.g. BDR
      }

      result.positions.push({
        id: generateId(),
        ticker: match[1],
        nome: match[2].trim(),
        tipo: section,
        instituicao: match[4].trim(),
        quantidade: parseMoney(match[5]),
        preco: parseMoney(match[6]),
        valorAtualizado: parseMoney(match[7]),
        ano: currentYear
      });
    }

    // 2. Tesouro Regex
    const tesouroRegex = /(Tesouro\s+(?:IPCA\+|Prefixado|Selic|Rendimento|IGPM\+|IPCA)\s+\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+(?:[.,]\d+)?)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)/gi;
    while ((match = tesouroRegex.exec(positionsText)) !== null) {
      result.positions.push({
        id: generateId(),
        ticker: match[1].trim(),
        nome: match[1].trim(),
        tipo: 'TESOURO',
        instituicao: match[2].trim(),
        quantidade: parseMoney(match[4]),
        preco: 0,
        valorAtualizado: parseMoney(match[6]),
        ano: currentYear
      });
    }

    // 3. LCI/Renda Fixa Regex
    const lciRegex = /(LCI\s*-\s*.+?)\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+(?:[.,]\d+)?)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)/gi;
    while ((match = lciRegex.exec(positionsText)) !== null) {
      result.positions.push({
        id: generateId(),
        ticker: 'RENDA FIXA',
        nome: match[1].trim(),
        tipo: 'RENDA_FIXA',
        instituicao: match[2].trim(),
        quantidade: parseMoney(match[4]),
        preco: parseMoney(match[5]),
        valorAtualizado: parseMoney(match[6]),
        ano: currentYear
      });
    }

    // 4. Dividends Regex
    const incomeRegex = /([A-Z0-9]{4,6})\s+(Dividendo|Juros Sobre Capital Próprio|Rendimento)\s+R\$\s*([\d.,]+)/gi;
    while ((match = incomeRegex.exec(incomeText)) !== null) {
      result.dividends.push({
        id: generateId(),
        ticker: match[1],
        tipo: match[2],
        valor: parseMoney(match[3]),
        ano: currentYear
      });
    }

  } catch (err: any) {
    result.errors.push(`Erro geral no parser B3: ${err.message}`);
  }

  return {
    positions: result.positions,
    dividends: result.dividends,
    errors: result.errors,
    rawTextLength: text.length,
    positionsCount: result.positions.length,
    incomeCount: result.dividends.length
  };
}
