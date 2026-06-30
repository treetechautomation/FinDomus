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

  // 1. Encontrar a linha do cabeçalho (busca nas primeiras 15 linhas)
  let headerIndex = -1;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const lower = lines[i].toLowerCase();
    if (
      (lower.includes('data') || lower.includes('date') || lower === 'dia') &&
      (lower.includes('valor') || lower.includes('amount') || lower.includes('value') || lower.includes('estabelecimento') || lower.includes('descrição') || lower.includes('descricao') || lower.includes('título') || lower.includes('titulo'))
    ) {
      headerIndex = i;
      break;
    }
  }

  const headerLine = headerIndex !== -1 ? lines[headerIndex] : lines[0];
  const header = headerLine.toLowerCase();
  const delimiter = header.includes(';') ? ';' : ',';
  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase());

  // 2. Mapeamento por cabeçalhos (Metadata)
  let dateIndex = headers.findIndex(h => h.includes('data') || h.includes('date') || h === 'dia');
  let amountIndex = headers.findIndex(h => h.includes('valor') || h.includes('amount') || h.includes('value'));
  
  let titleIndex = headers.findIndex(h => 
    h.includes('estabelecimento') || 
    h.includes('descrição') || 
    h.includes('descricao') || 
    h.includes('title') || 
    h.includes('description') || 
    h.includes('histórico') || 
    h.includes('historico') || 
    h.includes('detalhes') ||
    h.includes('título') ||
    h.includes('titulo')
  );
  if (titleIndex === -1) {
    titleIndex = headers.findIndex(h => h.includes('identificador') || h.includes('memo') || h.includes('ref'));
  }
  
  const installmentIndex = headers.findIndex(h => h.includes('parcela') || h.includes('installment'));

  const dataLines = headerIndex !== -1 ? lines.slice(headerIndex + 1) : lines;

  // 3. Se falhar na identificação dos campos fundamentais, usar a heurística de valores
  if (dateIndex === -1 || amountIndex === -1 || titleIndex === -1) {
    // Procurar primeira linha com dados reais para inferir colunas
    const firstDataLine = dataLines.find((line) => {
      const parts = line.split(delimiter);
      return parts.some(p => /^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(p.trim()));
    }) || dataLines[0];

    if (firstDataLine) {
      const parts = firstDataLine.split(delimiter).map(p => p.trim());
      
      if (dateIndex === -1) {
        dateIndex = parts.findIndex(p => /^\d{2}[\/\-]\d{2}[\/\-]\d{2,4}$/.test(p));
      }
      
      if (amountIndex === -1) {
        amountIndex = parts.findIndex((p, idx) => {
          if (idx === dateIndex) return false;
          const clean = p.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
          const n = Number(clean);
          return !Number.isNaN(n) && clean !== '' && p.length > 0;
        });
      }

      if (titleIndex === -1) {
        let maxLength = -1;
        parts.forEach((p, idx) => {
          if (idx === dateIndex || idx === amountIndex || idx === installmentIndex) return;
          if (p.length > maxLength) {
            maxLength = p.length;
            titleIndex = idx;
          }
        });
      }
    }
  }

  // Carrega contexto 1 única vez antes do loop — zero I/O por linha
  const context = await buildClassificationContext(userId);

  const parsed = dataLines.map((line) => {
    // Ignorar linhas vazias ou de saldo
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('saldo anterior') || lowerLine.includes('saldo atual') || lowerLine.includes('saldo final') || lowerLine.includes('total de despesas')) {
      return null;
    }

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

    // Se o valor de data for um cabeçalho ou inválido, pular
    if (date.toLowerCase().includes('data') || date.toLowerCase().includes('date')) return null;

    const rawText =
      installmentText && installmentText !== '-'
        ? title + ' - Parcela ' + installmentText
        : title;

    return enrichInstallment(
      {
        ...(() => {
          const classified = classifyTransactionWithContext(rawText, amount > 0 ? -Math.abs(amount) : amount, context);
          // Fallback: se o classificador retornou "Outros", tenta keywords genéricas
          if (classified.category === 'Outros') {
            const text = rawText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (text.includes('netflix')) classified.category = 'Streaming / Assinaturas';
            else if (text.includes('uber')) classified.category = 'Uber / 99';
            else if (text.includes('ifood')) classified.category = 'Delivery';
            else if (text.includes('amazon')) classified.category = 'Compras';
            else if (text.includes('apple')) classified.category = 'Compras';
          }
          return classified;
        })(),
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
