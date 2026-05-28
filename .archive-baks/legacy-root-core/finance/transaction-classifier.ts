
import { getCategories } from '@/services/firestore/categories';
import {
  getLearnedCategory,
} from '@/core/finance/category-learning-engine';

import {
  getAccountIdentities,
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

// 🔥 aprendizado persistente
async function classifyByLearning(text: string) {

  const learned = await getLearnedCategory(text);

  if (learned?.category) {
    return learned.category;
  }

  const categories = await getCategories();

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


// 🔥 NOVO: fallback IA simples
async function classifyByAI(text: string) {
  if (text.includes('mercado') || text.includes('supermercado')) return 'Supermercado';
  if (text.includes('posto') || text.includes('gasolina')) return 'Transporte';
  if (text.includes('farmacia')) return 'Saúde';
  return null;
}

export async function classifyTransaction(
  rawText: string,
  amount: number
): Promise<ParsedTransaction> {

  const text = normalizeText(rawText);

  // transferência por identidade familiar
  const internalTransfer =
    await classifyInternalTransfer(text);

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

  // 🔥 prioridade 1: aprendizado
  const learned = await classifyByLearning(text);

  // 🔥 prioridade 2: IA fallback
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
