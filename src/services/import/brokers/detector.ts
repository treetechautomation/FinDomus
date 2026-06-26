import * as XLSX from 'xlsx';
import { BrokerDetectedDocument } from './broker-types';
import { BROKER_LAYOUTS } from './layouts/registry';

export function detectBrokerDocument(
  buffer: Buffer,
  fileName: string,
  fileType: string,
  pdfText?: string
): BrokerDetectedDocument {
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  // 1. Inspect Sheet names if it is an Excel workbook
  const isExcel = fileExt === '.xlsx' || fileExt === '.xls' || fileType.includes('sheet') || fileType.includes('excel');
  let sheetNames: string[] = [];

  if (isExcel) {
    try {
      // Fast read of sheet names
      const quickWorkbook = XLSX.read(buffer, { type: 'buffer', bookSheets: true });
      sheetNames = (quickWorkbook.SheetNames || []).map(s => s.trim());
    } catch (e) {
      // Ignore errors
    }
  }

  // 2. Inspect CSV contents if applicable
  const isCsv = fileExt === '.csv' || fileType.includes('csv');
  let csvText = '';
  if (isCsv) {
    try {
      csvText = buffer.toString('utf-8');
    } catch (e) {
      // Ignore errors
    }
  }

  // 3. Iterate registered layouts and evaluate signatures
  for (const layout of BROKER_LAYOUTS) {
    // Check format compatibility
    if (layout.format === 'XLSX' && !isExcel) continue;
    if (layout.format === 'CSV' && !isCsv) continue;
    if (layout.format === 'PDF' && fileExt !== '.pdf' && !fileType.includes('pdf')) continue;

    // Check sheet existence signatures
    if (layout.sheetSignatures && layout.sheetSignatures.length > 0) {
      const allSheetsMatched = layout.sheetSignatures.every(sig =>
        sheetNames.some(name => name.toLowerCase() === sig.toLowerCase())
      );
      if (!allSheetsMatched) continue;
    }

    // Check textual content signatures (in CSV / PDF or inside Excel sheets)
    if (layout.textSignatures && layout.textSignatures.length > 0) {
      let documentContent = '';
      if (layout.format === 'PDF' && pdfText) {
        documentContent = pdfText.toUpperCase().replace(/\s+/g, '');
      } else if (layout.format === 'CSV') {
        documentContent = csvText.toUpperCase().replace(/\s+/g, '');
      } else if (layout.format === 'XLSX') {
        try {
          const workbook = XLSX.read(buffer, { type: 'buffer' });
          const sheet = workbook.Sheets[layout.sheetName || workbook.SheetNames[0]];
          if (sheet) {
            documentContent = JSON.stringify(sheet).toUpperCase().replace(/\s+/g, '');
          }
        } catch (e) {
          // Ignore Excel read errors during signature evaluation
        }
      }

      const allSignaturesMatch = layout.textSignatures.every(sig => {
        const cleanSig = sig.toUpperCase().replace(/\s+/g, '');
        return documentContent.includes(cleanSig);
      });

      if (!allSignaturesMatch) continue;
    }

    // Match found!
    return {
      source: layout.broker,
      documentType: layout.documentType,
      format: layout.format,
      schemaKey: layout.id,
      confidence: layout.confidence,
      reason: `Mecanismo de assinaturas identificou o layout ${layout.id} (${layout.broker} - ${layout.documentType} - Versão ${layout.version}).`,
      layoutName: layout.id,
      version: layout.version
    };
  }

  // 4. Fallback: Sinacor PDF Nota de Negociação
  if ((fileExt === '.pdf' || fileType.includes('pdf')) && pdfText) {
    const collapsed = pdfText.replace(/\s+/g, '').toUpperCase();

    if (
      collapsed.includes('NOTADENEGOCIAÇÃO') ||
      collapsed.includes('NOTADENEGOCIAÇAO') ||
      collapsed.includes('NOTADECORRETAGEM') ||
      collapsed.includes('NOTADECORRETORAS')
    ) {
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
        reason,
        layoutName: 'SINACOR_PDF',
        version: 'Padrão'
      };
    }
  }

  // No match
  return {
    source: 'UNKNOWN',
    documentType: 'UNKNOWN',
    format: fileExt === '.pdf' ? 'PDF' : fileExt === '.csv' ? 'CSV' : 'XLSX',
    schemaKey: null,
    confidence: 0.0,
    reason: 'Documento de corretora não reconhecido ainda pelas assinaturas do catálogo.',
    layoutName: 'UNKNOWN',
    version: 'N/A'
  };
}
