import * as XLSX from 'xlsx';
import { BrokerDetectedDocument } from './broker-types';

export function detectBrokerDocument(
  buffer: Buffer,
  fileName: string,
  fileType: string,
  pdfText?: string
): BrokerDetectedDocument {
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  // 1. XLSX Detection
  if (fileExt === '.xlsx' || fileExt === '.xls' || fileType.includes('sheet') || fileType.includes('excel')) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      
      if (sheetNames.includes('Sua carteira')) {
        return {
          source: 'XP',
          documentType: 'CUSTODY',
          format: 'XLSX',
          schemaKey: 'XP_CUSTODY_XLSX',
          confidence: 1.0,
          reason: 'Identificada aba "Sua carteira" correspondente à custódia da XP Investimentos.'
        };
      }
      
      if (sheetNames.includes('Movimentação')) {
        return {
          source: 'XP',
          documentType: 'LEDGER',
          format: 'XLSX',
          schemaKey: 'XP_LEDGER_XLSX',
          confidence: 1.0,
          reason: 'Identificada aba "Movimentação" correspondente às movimentações da XP Investimentos.'
        };
      }
      
      if (sheetNames.includes('Extrato')) {
        const sheet = workbook.Sheets['Extrato'];
        const sheetText = JSON.stringify(sheet);
        if (sheetText.includes('Extrato de conta corrente') || sheetText.includes('Cliente:') || sheetText.includes('Lançamentos:')) {
          return {
            source: 'BTG',
            documentType: 'LEDGER',
            format: 'XLSX',
            schemaKey: 'BTG_LEDGER_XLSX',
            confidence: 1.0,
            reason: 'Identificada aba "Extrato" correspondente ao extrato de conta do BTG Pactual.'
          };
        }
      }
    } catch (e: any) {
      // Fallback in case of read error
    }
  }

  // 2. PDF Detection (using extracted text)
  if ((fileExt === '.pdf' || fileType.includes('pdf')) && pdfText) {
    const collapsed = pdfText.replace(/\s+/g, '').toUpperCase();
    
    if (collapsed.includes('NOTADENEGOCIAÇÃO') || collapsed.includes('NOTADENEGOCIAÇAO') || collapsed.includes('NOTADECORRETAGEM') || collapsed.includes('NOTADECORRETORAS')) {
      let source: 'XP' | 'BTG' | 'CLEAR' | 'RICO' | 'INTER' | 'UNKNOWN' = 'UNKNOWN';
      let reason = 'Identificada Nota de Negociação padrão Sinacor.';
      
      if (collapsed.includes('XPINVESTIMENTOS')) {
        source = 'XP';
        reason = 'Identificada Nota de Negociação padrão Sinacor da XP Investimentos.';
      } else if (collapsed.includes('RICOBROKER') || collapsed.includes('RICOINVESTIMENTOS')) {
        source = 'RICO';
        reason = 'Identificada Nota de Negociação padrão Sinacor da Rico.';
      } else if (collapsed.includes('CLEARCORRETORA')) {
        source = 'CLEAR';
        reason = 'Identificada Nota de Negociação padrão Sinacor da Clear.';
      } else if (collapsed.includes('BTGPACTUAL')) {
        source = 'BTG';
        reason = 'Identificada Nota de Negociação padrão Sinacor do BTG Pactual.';
      } else if (collapsed.includes('BANCOINTER')) {
        source = 'INTER';
        reason = 'Identificada Nota de Negociação padrão Sinacor do Banco Inter.';
      }
      
      return {
        source,
        documentType: 'BROKERAGE_NOTE',
        format: 'PDF',
        schemaKey: null,
        confidence: 0.95,
        reason
      };
    }
  }

  // 3. Fallback
  return {
    source: 'UNKNOWN',
    documentType: 'UNKNOWN',
    format: fileExt === '.pdf' ? 'PDF' : fileExt === '.csv' ? 'CSV' : 'XLSX',
    schemaKey: null,
    confidence: 0.0,
    reason: 'Documento de corretora não reconhecido ainda.'
  };
}
