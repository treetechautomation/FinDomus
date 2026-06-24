import { normalizeText, type ParsedTransaction } from './transaction-classifier';
import { getCategories } from '@/services/firestore/categories';

function getTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>([^<\r\n]+)`));
  return match ? match[1].trim() : '';
}

function formatOfxDate(value: string) {
  const raw = value.slice(0, 8);
  if (raw.length !== 8) return '';
  return `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`;
}

function isCreditCardPayment(descLower: string) {
  return (
    descLower.includes('pagamento recebido') ||
    descLower.includes('pagamento em') ||
    descLower.includes('pagamento de fatura')
  );
}

function inferCategoryFromMemo(descLower: string) {
    if (descLower.includes('gol linhas')) {
      return 'Viagem';
    }

  if (
    descLower.includes('milkymoo') ||
    descLower.includes('pao da serra') ||
    descLower.includes('grill lanchonete')
  ) {
    return 'Alimentação';
  }

  if (
    descLower.includes('america restaurant') ||
    descLower.includes('restaurant') ||
    descLower.includes('berbigao') ||
    descLower.includes('companhia do churras')
  ) {
    return 'Restaurante';
  }

  if (
    descLower.includes('atacadao') ||
    descLower.includes('panamil')
  ) {
    return 'Supermercado';
  }

  if (descLower.includes('dosecerta')) {
    return 'Farmácia';
  }

  if (descLower.includes('beach park')) {
    return 'Lazer';
  }

  if (descLower.includes('comunidade catolica')) {
    return 'Doações';
  }

  if (descLower.includes('edicoesshalom')) {
    return 'Livros';
  }

  if (descLower.includes('liritty')) {
    return 'Compras';
  }

  if (
    descLower.includes('99 pop') ||
    /pop\s+\d{1,2}/i.test(descLower)
  ) {
    return 'Transporte';
  }

  if (descLower.includes('printsolutions')) {
    return 'Serviços';
  }

  if (
    descLower.includes('viuva') ||
    descLower.includes('saulo vala') ||
    descLower.includes('andrade tavares')
  ) {
    return 'Prestação de contas';
  }

  if (descLower.includes('j sleiman')) {
    return 'Compras';
  }

    if (descLower.includes('rede tetra')) {
      return 'Combustível';
    }

    if (descLower.includes('rede varejao')) return 'Supermercado';

    if (
      descLower.includes('aqua rio') ||
      descLower.includes('ingresse') ||
      descLower.includes('summer santa rosa')
    ) return 'Lazer';

    if (
      descLower.includes('casa e video') ||
      descLower.includes('cea ipm') ||
      descLower.includes('figueira silva') ||
      descLower.includes('baby festas') ||
      descLower.includes('big nectar')
    ) return 'Compras';

    if (descLower.includes('rdsaude')) return 'Farmácia';

    if (
      descLower.includes('ddtrioburgers') ||
      descLower.includes('mvg gohan')
    ) return 'Restaurante';

    if (
      descLower.includes('sophia de almeida') ||
      descLower.includes('esphera anima')
    ) return 'Prestação de contas';

    return null;
}

function extractInstallmentData(description: string) {
  const match = String(description || '').match(
  /(?:parcela\s+(\d+)\s*\/\s*(\d+)|\((\d+)\s*\/\s*(\d+)\))/i
);

  if (!match) {
    return {
      isInstallment: false,
      installmentCurrent: null,
      installmentTotal: null,
      remainingInstallments: null,
      installmentKey: null,
    };
  }

  const current = Number(match[1] || match[3]);
  const total = Number(match[2] || match[4]);

  const normalized = String(description || '')
    .replace(/-\s*parcela\s+\d+\s*\/\s*\d+/i, '')
    .trim()
    .toLowerCase();

  return {
    isInstallment: true,
    installmentCurrent: current,
    installmentTotal: total,
    remainingInstallments: Math.max(total - current, 0),
    installmentKey: normalized,
  };
}

function parseImportAmount(value: string | number | null | undefined): number {
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

function isUsefulDescription(value?: string | null): boolean {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^\d+$/.test(text)) return false;
  if (/^[\d\s.\-_/]+$/.test(text)) return false;
  return true;
}

export async function parseOFX(text: string, userId?: string): Promise<ParsedTransaction[]> {
  const categories = (await getCategories(userId)) as Array<{ name: string; keywords?: string[] }>;

  const transactions = text
    .split('<STMTTRN>')
    .slice(1)
    .map((block) => {
      const rawAmount = getTag(block, "TRNAMT");
      const amount = parseImportAmount(rawAmount);

      const rawName = getTag(block, "NAME");
      const rawMemo = getTag(block, "MEMO");
      const fitId = getTag(block, "FITID");

      const memo =
        isUsefulDescription(rawName) ? rawName :
        isUsefulDescription(rawMemo) ? rawMemo :
        fitId ||
        "Lançamento OFX";

      const date = formatOfxDate(getTag(block, 'DTPOSTED'));
      const descLower = normalizeText(memo);

      // IGNORAR LINHAS DE SALDO BB
      if (
        descLower.includes('saldo do dia') ||
        descLower.includes('saldo anterior') ||
        descLower.includes('saldo final')
      ) {
        return null;
      }

      const type: 'income' | 'expense' = amount >= 0 ? "income" : "expense";
      let category = inferCategoryFromMemo(descLower) || "Outros";

      if (category === "Outros") {
        for (const cat of categories) {
          if (!cat.keywords) continue;

          if (cat.keywords.some((k: string) => normalizeText(memo).includes(normalizeText(k)))) {
            category = cat.name;
            break;
          }
        }
      }

      const installment = extractInstallmentData(memo);

      return {
        date,
        description: memo,
        merchant: memo,
        externalId: fitId || undefined,
        amount: Math.abs(amount),
        ...installment,
        category,
        type,
      } as unknown as ParsedTransaction;
    })
    .filter(
      (item): item is ParsedTransaction =>
        Boolean(item && item.date && item.amount)
    );

  return transactions;
}
