import { getIncomeEffect, getExpenseEffect } from '@/core/finance/transaction-effects';
import { adminDb } from '../../lib/firebase-admin';

interface GetTransactionsOptions {
  userId: string;
  owner?: 'PF' | 'PJ';
  monthKey?: string;
  type?: 'income' | 'expense' | 'transfer';
  category?: string;
  limit?: number;
}

export function aggregateAITransactions(docs: any[]) {
  let income = 0;
  let expenses = 0;
  const categories: Record<string, number> = {};

  const recentTransactions = docs.map(t => {
    const incEffect = getIncomeEffect(t);
    const expEffect = getExpenseEffect(t);
    income += incEffect;
    expenses += expEffect;
    
    const cat = t.category || 'Outros';
    if (t.type !== 'transfer') {
      const effect = (t.type === 'income' ? incEffect : expEffect);
      if (effect !== 0) {
        categories[cat] = (categories[cat] || 0) + effect;
      }
    }

    return {
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      isRefund: t.isRefund,
      category: cat,
      date: t.date || t.createdAt,
      owner: t.owner
    };
  });

  return {
    total: docs.length,
    income,
    expenses,
    balance: income - expenses,
    categories,
    recentTransactions
  };
}

/**
 * Ferramenta de leitura de transacoes para a IA.
 * Permite filtros dinâmicos e retorna um resumo estruturado.
 */
export async function getTransactions(options: GetTransactionsOptions) {
  const { userId, owner, monthKey, type, category, limit = 50 } = options;

  if (!userId) throw new Error('userId é obrigatório');

  try {
    let query = adminDb.collection('transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    // Filtros opcionais
    if (owner) query = query.where('owner', '==', owner);
    if (monthKey) query = query.where('monthKey', '==', monthKey);
    if (type) query = query.where('type', '==', type);
    if (category) query = query.where('category', '==', category);

    const snapshot = await query.limit(limit).get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    return aggregateAITransactions(docs);
  } catch (error: any) {
    console.error('Erro na tool get_transactions:', error.message);
    throw new Error('Nao foi possivel recuperar as transacoes.');
  }
}
