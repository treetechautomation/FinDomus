import {
  normalizeText,
  inferCategoryFromDescription,
  isBlacklistedCategory,
  buildClassificationContext,
  classifyTransactionWithContext,
  type ParsedTransaction,
  type ClassificationContext,
} from './transaction-classifier';

function getTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>([^<\r\n]+)`));
  return match ? match[1].trim() : '';
}

// OFX.5 — Fase B. `text.split('<STMTTRN>')` só corta cada bloco na tag de
// ABERTURA seguinte — nunca na de FECHAMENTO `</STMTTRN>`. Para a última
// transação de um arquivo (sem próximo `<STMTTRN>` para limitar o corte), o
// "bloco" se estendia até o fim do arquivo inteiro, absorvendo
// `</BANKTRANLIST>`, `<LEDGERBAL>` e `<BALLIST>` — fazendo getTag() enxergar
// tags que pertencem ao resumo do extrato, não à transação. Truncar cada
// bloco no seu próprio `</STMTTRN>` (quando presente) elimina a causa
// estrutural para qualquer banco, sem depender do conteúdo específico do
// que vaza (funciona independente de existir ou não um BALLIST depois).
export function extractStmttrnBlocks(text: string): string[] {
  return text
    .split('<STMTTRN>')
    .slice(1)
    .map((chunk) => {
      const closeIdx = chunk.indexOf('</STMTTRN>');
      return closeIdx === -1 ? chunk : chunk.slice(0, closeIdx);
    });
}

// Replica localmente a regra de identidade interna já usada por
// classifyTransactionWithContext (transaction-classifier.ts), sem alterar aquele
// módulo compartilhado com CSV/PDF/Pluggy. Serve só para distinguir um
// type='transfer' com evidência real de conta própria de um type='transfer'
// vindo apenas do match textual genérico de isTransfer().
function hasInternalIdentityMatch(text: string, context: ClassificationContext) {
  const norm = normalizeText(text);
  return context.accountIdentities.some((identity) => {
    if (!identity.isActive) return false;
    const aliases = [identity.normalizedName, ...(identity.aliases || [])];
    return aliases.some((alias) => alias && norm.includes(alias));
  });
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

// OFX.4 — Fase B.2 (mantida na Fase B.5 como segunda camada de defesa).
// A causa estrutural que fazia a última STMTTRN de um arquivo herdar o NAME
// do <BALLIST> foi corrigida na origem em extractStmttrnBlocks() (OFX.5 —
// Fase B): cada bloco agora é truncado no seu próprio </STMTTRN>, então
// getTag(block, 'NAME') não alcança mais o BALLIST. Esta função continua
// existindo como proteção adicional para o cenário em que um banco realmente
// preencha o NAME de uma transação com o mesmo texto de um rótulo de saldo
// (dado genuíno, não vazamento de parsing) — extrai os rótulos uma única vez
// por arquivo e permite ignorar esse NAME só na hora de montar o texto de
// CLASSIFICAÇÃO (a descrição exibida ao usuário não muda). Não é uma lista
// fixa de palavras: é uma comparação estrutural contra o que o próprio
// arquivo declara como rótulo de saldo, então generaliza para qualquer banco.
function extractBallistLabels(fullText: string): Set<string> {
  const labels = new Set<string>();
  const ballistMatch = fullText.match(/<BALLIST>([\s\S]*?)<\/BALLIST>/i);
  if (!ballistMatch) return labels;
  const nameMatches = ballistMatch[1].matchAll(/<NAME>([^<\r\n]*)/gi);
  for (const m of nameMatches) {
    const label = normalizeText(m[1]).trim();
    if (label) labels.add(label);
  }
  return labels;
}

// Extraído de parseOFX para permitir teste determinístico e isolado (sem I/O),
// dado um `context` já carregado. Comportamento idêntico ao anterior — mesma lógica,
// apenas fatiada em função própria.
export function resolveOfxTransaction(
  block: string,
  context: ClassificationContext,
  ballistLabels?: Set<string>
): ParsedTransaction | null {
      const rawAmount = getTag(block, "TRNAMT");
      const amount = parseImportAmount(rawAmount);

      const rawName = getTag(block, "NAME");
      const rawMemo = getTag(block, "MEMO");
      const fitId = getTag(block, "FITID");
      const trnType = getTag(block, "TRNTYPE").toUpperCase();

      // Descrição exibida ao usuário — comportamento preservado (NAME tem prioridade).
      const memo =
        isUsefulDescription(rawName) ? rawName :
        isUsefulDescription(rawMemo) ? rawMemo :
        fitId ||
        "Lançamento OFX";

      // NAME que reaproveita um rótulo de saldo do próprio arquivo (ex.:
      // "RENDIMENTO LIQUIDO") não é informação sobre ESTA transação — não deve
      // contaminar o texto de classificação, mesmo que a descrição exibida
      // (acima) continue priorizando NAME por política já existente.
      const nameIsBallistArtifact = Boolean(
        ballistLabels?.has(normalizeText(rawName).trim())
      );

      // Texto usado só para CLASSIFICAR: une NAME + MEMO quando ambos trazem
      // informação útil e distinta (ex.: NAME genérico do banco + MEMO com o
      // favorecido/fornecedor real), sem alterar a descrição exibida acima.
      const nameUseful = isUsefulDescription(rawName) && !nameIsBallistArtifact;
      const memoUseful = isUsefulDescription(rawMemo);
      const classificationText =
        nameUseful && memoUseful && normalizeText(rawName) !== normalizeText(rawMemo)
          ? `${rawName} ${rawMemo}`
          : (nameUseful ? rawName : (memoUseful ? rawMemo : memo));

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

      // Classifica usando o motor unificado (compartilhado com CSV/PDF/Pluggy — não alterado)
      const classified = classifyTransactionWithContext(classificationText, amount, context);
      let category = classified.category;
      let type = classified.type;

      // Natureza financeira do OFX (TRNTYPE + TRNAMT) tem precedência sobre uma
      // keyword textual genérica de transferência. Só sobrescreve quando o
      // 'transfer' NÃO veio de identidade interna comprovada (conta própria/família),
      // preservando a regra de transferência interna já existente.
      if (type === 'transfer' && !hasInternalIdentityMatch(classificationText, context)) {
        if (trnType === 'CREDIT' && amount > 0) {
          type = 'income';
        } else if (trnType === 'DEBIT' && amount < 0) {
          type = 'expense';
        }
      }

      if (category === "Outros") {
        const fallback = inferCategoryFromMemo(normalizeText(classificationText));
        if (fallback) {
          category = fallback;
        }
      }

      const installment = extractInstallmentData(memo);

      const hasIdentity = hasInternalIdentityMatch(classificationText, context);

      return {
        date,
        description: memo,
        merchant: memo,
        externalId: fitId || undefined,
        amount: Math.abs(amount),
        originalAmount: amount,
        ...installment,
        category,
        type,
        hasIdentityMatch: hasIdentity,
      } as unknown as ParsedTransaction;
}

// ACCOUNTS.IMPORT.BALANCE.1D — metadata de IDENTIDADE da conta bancária (não
// de transação). Domínio deliberadamente separado de ParsedTransaction e de
// `parseOFX()`: extrair aqui não altera o retorno/comportamento já existente
// do parser de transações (nenhum chamador de parseOFX precisa mudar).
//
// `externalAccountId` (ACCTID do OFX) NÃO é o `accountId` interno do
// FinDomus — são identidades de domínios diferentes; nomeado explicitamente
// para não confundir os dois. Saldo (LEDGERBAL/BALAMT/DTASOF) pertence à
// fase 1E — não é extraído aqui.
export type OfxAccountMetadata = {
  bankId?: string;
  externalAccountId?: string;
  accountType?: string;
  org?: string;
  fid?: string;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
};

function sliceBetween(text: string, openTag: string, closeTag: string, fallbackEndTag?: string): string {
  const openIdx = text.search(new RegExp(`<${openTag}>`, 'i'));
  if (openIdx === -1) return '';
  const afterOpen = text.slice(openIdx + openTag.length + 2);
  const closeIdx = afterOpen.search(new RegExp(`</${closeTag}>`, 'i'));
  if (closeIdx !== -1) return afterOpen.slice(0, closeIdx);
  if (fallbackEndTag) {
    const fallbackIdx = afterOpen.search(new RegExp(`<${fallbackEndTag}>`, 'i'));
    if (fallbackIdx !== -1) return afterOpen.slice(0, fallbackIdx);
  }
  return afterOpen;
}

export function parseOfxAccountMetadata(text: string): OfxAccountMetadata {
  const fiBlock = sliceBetween(text, 'FI', 'FI', 'SONRS');
  const bankAcctBlock = sliceBetween(text, 'BANKACCTFROM', 'BANKACCTFROM', 'BANKTRANLIST');
  const tranListHeaderBlock = sliceBetween(text, 'BANKTRANLIST', 'BANKTRANLIST', 'STMTTRN');
  const stmtrsHeaderBlock = sliceBetween(text, 'STMTRS', 'STMTRS', 'BANKTRANLIST');

  return {
    bankId: getTag(bankAcctBlock, 'BANKID') || undefined,
    externalAccountId: getTag(bankAcctBlock, 'ACCTID') || undefined,
    accountType: getTag(bankAcctBlock, 'ACCTTYPE') || undefined,
    org: getTag(fiBlock, 'ORG') || undefined,
    fid: getTag(fiBlock, 'FID') || undefined,
    currency: getTag(stmtrsHeaderBlock, 'CURDEF') || undefined,
    periodStart: getTag(tranListHeaderBlock, 'DTSTART') || undefined,
    periodEnd: getTag(tranListHeaderBlock, 'DTEND') || undefined,
  };
}

export async function parseOFX(text: string, userId?: string): Promise<ParsedTransaction[]> {
  const context = await buildClassificationContext(userId);
  const ballistLabels = extractBallistLabels(text);

  const transactions = extractStmttrnBlocks(text)
    .map((block) => resolveOfxTransaction(block, context, ballistLabels))
    .filter(
      (item): item is ParsedTransaction =>
        Boolean(item && item.date && item.amount)
    );

  return transactions;
}
