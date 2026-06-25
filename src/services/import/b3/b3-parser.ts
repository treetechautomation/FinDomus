import { B3Position, B3Dividend, B3ParseResult } from '@/types/import/b3';

export function parseB3Pdf(text: string): B3ParseResult {
  const result: B3ParseResult = { positions: [], dividends: [], errors: [] };
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let currentYear = new Date().getFullYear();
  let currentSection = '';
  
  let buffer = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract Year
    const yearMatch = line.match(/^Data:\s*(\d{4})/i);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1], 10);
      continue;
    }
    
    // Identify Section
    if (line.startsWith('Posição - Ações') || line === 'Posição - Ações') { currentSection = 'ACOES'; continue; }
    if (line.startsWith('Posição - FII') || line.includes('Fundo de Investimento Imobiliário')) { currentSection = 'FII'; continue; }
    if (line.startsWith('Posição - ETF') || line.includes('Exchange Traded Fund')) { currentSection = 'ETF'; continue; }
    if (line.startsWith('Posição - BDR') || line.includes('Brazilian Depositary Receipts')) { currentSection = 'BDR'; continue; }
    if (line.startsWith('Posição - Tesouro Direto')) { currentSection = 'TESOURO'; continue; }
    if (line.startsWith('Posição - LCI') || line.includes('Letras de Crédito')) { currentSection = 'RENDA_FIXA'; continue; }
    if (line.startsWith('Proventos recebidos')) { currentSection = 'PROVENTOS'; continue; }
    if (line.startsWith('Reembolsos de empréstimos de ativos')) { currentSection = 'OUTROS'; continue; }
    
    // Ignore headers and irrelevant footers
    if (
      line.startsWith('Produto') || 
      line.startsWith('Total') || 
      (line.startsWith('R$') && !buffer) ||
      line.startsWith('As informações disponíveis na Área') || 
      line.startsWith('acesse investidor') || 
      line.includes('Relatório anual consolidado') ||
      line.includes('CPF/CNPJ:') ||
      line === 'Posição'
    ) {
      continue;
    }
    
    // Multiline buffer accumulation
    if (!buffer) {
       // Start buffer if it looks like a known row start
       if (line.match(/^[A-Z0-9]{3,6}\b/) || line.startsWith('Tesouro ') || currentSection === 'PROVENTOS') {
           buffer = line;
       }
    } else {
       buffer += ' ' + line;
    }
    
    // Check if buffer is complete (ends with a value like R$ 1.500,00)
    if (buffer) {
       if (buffer.match(/R\$\s*[\d.,]+\s*$/)) {
           try {
             processRow(buffer, currentSection, currentYear, result);
           } catch (err: any) {
             result.errors.push(`Erro ao processar linha: ${buffer} - ${err.message}`);
           }
           buffer = ''; // reset buffer
       }
    }
  }
  
  return result;
}

function processRow(row: string, section: string, year: number, result: B3ParseResult) {
  const parseMoney = (str: string) => {
    const clean = str.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };
  
  if (section === 'PROVENTOS') {
    // Example: BBAS3 Dividendo R$ 12,80
    // Example: ABCB4 Juros Sobre Capital Próprio R$ 57,30
    const match = row.match(/^([A-Z0-9]{4,6})\s+(.+?)\s+R\$\s*([\d.,]+)$/);
    if (match) {
      result.dividends.push({
        id: crypto.randomUUID(),
        ticker: match[1],
        tipo: match[2].trim(),
        valor: parseMoney(match[3]),
        ano: year
      });
    }
  } else if (section === 'TESOURO') {
     // Tesouro IPCA+ 2026 BANCO BTG PACTUAL S/A 15/08/2026 0,51 R$ 1.493,30 R$ 1.523,49
     const match = row.match(/^(Tesouro .+?)\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.,]+)\s+R\$\s*[\d.,]+\s+R\$\s*([\d.,]+)$/);
     if (match) {
        result.positions.push({
          id: crypto.randomUUID(),
          ticker: match[1].trim(),
          nome: match[1].trim(),
          tipo: 'TESOURO',
          instituicao: match[2].trim(),
          quantidade: parseMoney(match[4]),
          preco: 0,
          valorAtualizado: parseMoney(match[5]),
          ano: year
        });
     }
  } else if (['ACOES', 'FII', 'ETF', 'BDR'].includes(section)) {
     // Match typical format: BBAS3 - BCO BRASIL S.A. ON BANCO BTG PACTUAL S/A 515 R$ 28,85 R$ 14.857,75
     const match = row.match(/^([A-Z0-9]{4,6})\s*-\s*(.+?)\s+(ON|PN|PNB|PNA|Cotas|BDR|Internacional)\s+(.+?)\s+([\d.,]+)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)$/);
     if (match) {
        result.positions.push({
          id: crypto.randomUUID(),
          ticker: match[1],
          nome: match[2].trim(),
          tipo: section,
          instituicao: match[4].trim(),
          quantidade: parseMoney(match[5]),
          preco: parseMoney(match[6]),
          valorAtualizado: parseMoney(match[7]),
          ano: year
        });
     } else {
        // Fallback for cases without explicit Type (ON/PN/Cotas)
        const matchFallback = row.match(/^([A-Z0-9]{4,6})\s*-\s*(.+?)\s+([\d.,]+)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)$/);
        if (matchFallback) {
             result.positions.push({
              id: crypto.randomUUID(),
              ticker: matchFallback[1],
              nome: matchFallback[2].trim(),
              tipo: section,
              instituicao: 'Desconhecida',
              quantidade: parseMoney(matchFallback[3]),
              preco: parseMoney(matchFallback[4]),
              valorAtualizado: parseMoney(matchFallback[5]),
              ano: year
            });
        }
     }
  } else if (section === 'RENDA_FIXA') {
     // LCI - BANCO INTER S/A INTER DISTRIBUIDORA ... 09/06/2022 200000 R$ 0,01 R$ 2.201,02
     const match = row.match(/^(.+?)\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+([\d.,]+)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)$/);
     if (match) {
         result.positions.push({
          id: crypto.randomUUID(),
          ticker: 'RENDA FIXA',
          nome: match[1].trim(),
          tipo: section,
          instituicao: match[2].trim(),
          quantidade: parseMoney(match[4]),
          preco: parseMoney(match[5]),
          valorAtualizado: parseMoney(match[6]),
          ano: year
        });
     }
  }
}
