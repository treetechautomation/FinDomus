import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCategories, type Category } from '@/services/firestore/categories';
import {
  getLearnedCategory,
  buildLearningFingerprint,
} from '@/core/finance/category-learning-engine';
import {
  getAccountIdentities,
  type AccountIdentity,
} from '@/services/firestore/account-identities';

export type ParsedTransaction = {
  date: string;
  description: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
};

export function normalizeText(text: string) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isTransfer(text: string) {
  const t = normalizeText(text);
  return (
    t.includes("pix enviado") ||
    t.includes("transferencia") ||
    t.includes("transferência")
  );
}

async function classifyByLearning(text: string, userId?: string) {

  const learned = await getLearnedCategory(text);

  if (learned?.category) {
    return learned.category;
  }

  const categories = await getCategories(userId);

  for (const cat of categories) {
    if (!cat.keywords) continue;

    if (cat.keywords.some((k: string) => text.includes(k))) {
      return cat.name;
    }
  }

  return null;
}



// 🔥 identidades financeiras internas
async function classifyInternalTransfer(
  text: string
) {

  const identities =
    await getAccountIdentities();

  for (const identity of identities) {

    if (!identity.isActive) continue;

    const aliases = [
      identity.normalizedName,
      ...(identity.aliases || []),
    ];

    const matched = aliases.some(
      (alias: string) =>
        alias &&
        text.includes(alias)
    );

    if (matched) {
      return {
        category: 'Transferencia',
        type: 'transfer',
      };
    }
  }

  return null;
}


// Fallback IA local — síncrono, sem I/O
function classifyByAISync(text: string): string | null {
  if (text.includes('mercado') || text.includes('supermercado')) return 'Supermercado';
  if (text.includes('posto') || text.includes('gasolina')) return 'Transporte';
  if (text.includes('farmacia')) return 'Saúde';
  return null;
}

// 🔥 NOVO: fallback IA simples (wrapper async para compatibilidade)
async function classifyByAI(text: string) {
  return classifyByAISync(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXTO DE CLASSIFICAÇÃO — carregado 1 única vez por sessão de importação
// ─────────────────────────────────────────────────────────────────────────────

export type ClassificationContext = {
  /** Lista de categorias com keywords — carregada 1 vez */
  categories: Category[];
  /** Identidades financeiras (contas próprias/família) — carregada 1 vez */
  accountIdentities: AccountIdentity[];
  /** Map fingerprint → category com todo o aprendizado — carregado 1 vez */
  learningMap: Map<string, string>;
};

/**
 * Carrega o contexto necessário para classificar transações em memória.
 * Deve ser chamado UMA VEZ antes do loop de importação.
 * Executa 3 queries em paralelo: categories, identities e category_learning.
 */
export async function buildClassificationContext(userId?: string): Promise<ClassificationContext> {
  const [categories, accountIdentities, learningSnap] = await Promise.all([
    getCategories(userId),
    getAccountIdentities(),
    getDocs(collection(db, 'category_learning')),
  ]);

  const learningMap = new Map<string, string>();
  for (const d of learningSnap.docs) {
    const data = d.data();
    if (data.fingerprint && data.category) {
      learningMap.set(data.fingerprint, data.category);
    }
  }

  return { categories, accountIdentities, learningMap };
}

/**
 * Classifica uma transação usando contexto pré-carregado.
 * SÍNCRONO — zero I/O por transação. Use junto com buildClassificationContext().
 * Resultado idêntico ao classifyTransaction() assíncrono.
 */
export function classifyTransactionWithContext(
  rawText: string,
  amount: number,
  context: ClassificationContext
): ParsedTransaction {
  const text = normalizeText(rawText);

  // 1. Identidade interna (em memória)
  for (const identity of context.accountIdentities) {
    if (!identity.isActive) continue;
    const aliases = [identity.normalizedName, ...(identity.aliases || [])];
    if (aliases.some((alias: string) => alias && text.includes(alias))) {
      return {
        date: '',
        description: rawText,
        merchant: rawText,
        category: 'Transferencia',
        amount: Math.abs(amount),
        type: 'transfer',
      };
    }
  }

  // 2. Transferência por keyword textual
  if (isTransfer(text)) {
    return {
      date: '',
      description: rawText,
      merchant: rawText,
      category: 'Transferência',
      amount: Math.abs(amount),
      type: 'transfer',
    };
  }

  // 3. Lookup O(1) no Map de aprendizado
  const fingerprint = buildLearningFingerprint(text);
  const learned = context.learningMap.get(fingerprint) ?? null;

  // 4. Keyword de categoria (em memória)
  const categoryByKeyword = learned ?? (
    context.categories.find(
      (cat) => cat.keywords?.some((k: string) => text.includes(k))
    )?.name ?? null
  );

  // 5. Fallback IA síncrona
  const ai = categoryByKeyword ? null : classifyByAISync(text);
  const category = categoryByKeyword || ai || 'Outros';

  return {
    date: '',
    description: rawText,
    merchant: rawText,
    category,
    amount: Math.abs(amount),
    type: amount >= 0 ? 'income' : 'expense',
  };
}

/**
 * Classifica uma transação com I/O direto ao Firestore.
 * Mantida para compatibilidade com chamadas externas existentes.
 * Em loops de importação, prefira buildClassificationContext() + classifyTransactionWithContext().
 */
export async function classifyTransaction(
  rawText: string,
  amount: number,
  userId?: string
): Promise<ParsedTransaction> {

  const text = normalizeText(rawText);

  // transferência por identidade familiar
  const internalTransfer = await classifyInternalTransfer(text);

  if (internalTransfer) {
    return {
      date: '',
      description: rawText,
      merchant: rawText,
      category: internalTransfer.category,
      amount: Math.abs(amount),
      type: 'transfer',
    };
  }

  // transferência
  if (isTransfer(text)) {
    return {
      date: '',
      description: rawText,
      merchant: rawText,
      category: 'Transferência',
      amount: Math.abs(amount),
      type: 'transfer',
    };
  }

  // prioridade 1: aprendizado
  const learned = await classifyByLearning(text, userId);

  // prioridade 2: IA fallback
  const ai = learned ? null : await classifyByAI(text);

  const category = learned || ai || 'Outros';

  return {
    date: '',
    description: rawText,
    merchant: rawText,
    category,
    amount: Math.abs(amount),
    type: amount >= 0 ? 'income' : 'expense',
  };
}
