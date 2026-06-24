import {
  buildClassificationContext,
  classifyTransactionWithContext,
  type ParsedTransaction,
} from './transaction-classifier';

function parseAmountBR(value: string) {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;

  let clean = raw.replace(/[R$\s]/g, '');

  if (clean.includes(',') && clean.includes('.')) {
    const commaIndex = clean.indexOf(',');
    const dotIndex = clean.indexOf('.');
    if (commaIndex > dotIndex) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }

  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

function enrichInstallment(transaction: ParsedTransaction, rawText: string): ParsedTransaction {
  const text = String(rawText || '');

    const match =
      text.match(/(?:parcela\s*)?(\d{1,2})\/(\d{1,2})/i) ||
      text.match(/parcela\s+(\d{1,2})\s+de\s+(\d{1,2})/i) ||
      text.match(/\b(\d{1,2})\s+de\s+(\d{1,2})\b/i);

  const installmentCurrent = match ? Number(match[1]) : null;
  const installmentTotal = match ? Number(match[2]) : null;

  const installmentKey =
    installmentCurrent && installmentTotal
      ? (
          text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\bnupay\b/gi, '')
            .replace(/\bparcela\b/gi, '')
            .replace(/\d{1,2}\s+de\s+\d{1,2}/gi, '')
            .replace(/\d{1,2}\/\d{1,2}/g, '')
            .replace(/[^a-z0-9*]+/g, ' ')
            .trim()
          + ' ' +
          installmentTotal
        ).trim()
      : null;

  return {
    ...transaction,
    isInstallment: installmentCurrent !== null,
    installmentCurrent,
    installmentTotal,
    installmentKey,
  } as ParsedTransaction;
}

export async function parseNubankCSV(csv: string, userId?: string): Promise<ParsedTransaction[]> {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase();
  const delimiter = header.includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());

  // Encontrar índices dos campos por prioridade de palavra-chave
  const dateIndex = headers.findIndex(h => h.includes('data') || h.includes('date') || h === 'dia');
  const amountIndex = headers.findIndex(h => h.includes('valor') || h.includes('amount') || h.includes('value'));
  
  let titleIndex = headers.findIndex(h => 
    h.includes('estabelecimento') || 
    h.includes('descrição') || 
    h.includes('descricao') || 
    h.includes('title') || 
    h.includes('description') || 
    h.includes('histórico') || 
    h.includes('historico') || 
    h.includes('detalhes')
  );
  if (titleIndex === -1) {
    titleIndex = headers.findIndex(h => h.includes('identificador') || h.includes('memo') || h.includes('ref'));
  }
  
  const installmentIndex = headers.findIndex(h => h.includes('parcela') || h.includes('installment'));

  const dataLines = lines.slice(1);

  // Carrega contexto 1 única vez antes do loop — zero I/O por linha
  const context = await buildClassificationContext(userId);

  const parsed = dataLines.map((line) => {
    const parts = line.split(delimiter).map((part) => part.trim());

    if (parts.length < 2) return null;

    let date = "";
    let amount = 0;
    let title = "";
    let installmentText = "";

    if (dateIndex !== -1 && amountIndex !== -1) {
      date = parts[dateIndex] || "";
      amount = parseAmountBR(parts[amountIndex]);
      title = titleIndex !== -1 ? parts[titleIndex] : "";
      if (!title && parts.length > 2) {
        const otherPart = parts.find((p, idx) => idx !== dateIndex && idx !== amountIndex && p);
        title = otherPart || "Lançamento CSV";
      } else if (!title) {
        title = "Lançamento CSV";
      }
      installmentText = installmentIndex !== -1 ? parts[installmentIndex] : "";
    } else {
      // Fallback antigo: date,title,amount
      date = parts[0] || "";
      title = parts.slice(1, -1).join(delimiter).trim();
      amount = parseAmountBR(parts[parts.length - 1]);
    }

    if (!date || !title || Number.isNaN(amount)) return null;

    const rawText =
      installmentText && installmentText !== '-'
        ? title + ' - Parcela ' + installmentText
        : title;

    return enrichInstallment(
      {
        ...classifyTransactionWithContext(rawText, amount > 0 ? -Math.abs(amount) : amount, context),
        date,
      },
      rawText
    );
  });

  return parsed.filter(Boolean) as ParsedTransaction[];
}

export async function parseBankStatementText(text: string, userId?: string): Promise<ParsedTransaction[]> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const result: ParsedTransaction[] = [];

  // Carrega contexto 1 única vez antes do loop — zero I/O por linha
  const context = await buildClassificationContext(userId);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/saldo do dia|saldo anterior|s a l d o|informações adicionais|aplicações financeiras/i.test(line)) continue;

    const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})/);
    if (!dateMatch) continue;

    const amountMatch = line.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*\(([+-])\)/);
    if (!amountMatch) continue;

    const date = dateMatch[1];
    const amount = parseAmountBR(amountMatch[1]) * (amountMatch[2] === '-' ? -1 : 1);

    const next1 = lines[i + 1] || '';
    const next2 = lines[i + 2] || '';
    const rawText = `${line} ${next1} ${next2}`
      .replace(date, '')
      .replace(amountMatch[0], '')
      .trim();

    result.push(
      enrichInstallment(
        {
          ...classifyTransactionWithContext(rawText, amount, context),
          date,
        },
        rawText
      )
    );
  }

  return result;
}
