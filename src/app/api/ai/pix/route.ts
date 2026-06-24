import { NextResponse } from 'next/server';
import { classifyPixFlow } from '@/ai/flows/classify-pix';
import { canUseAIAdmin, registerAIUsageAdmin } from '@/core/ai/usage.admin';
import { getCategoriesAdmin } from '@/services/firestore/categories.admin';
import { verifyIdToken } from '@/lib/verify-id-token';
import { keywordMatches, normalizeForMatch } from '@/core/finance/transaction-classifier';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    await verifyIdToken(authHeader);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text, description, merchant, amount, userId } = await req.json();

    const rawText = String(text || description || merchant || '');

    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
    }

    const categories = await getCategoriesAdmin();
    const clean = normalizeForMatch(rawText);

// 🔥 IDENTIFICAÇÃO CPF/CNPJ
const onlyNumbers = rawText.replace(/\D/g, '');

if (onlyNumbers.length === 11) {
  return NextResponse.json({
    type: 'income',
    category: 'Recebimentos',
    confidence: 0.99,
    reason: 'CPF identificado (pessoa física)',
    source: 'rule',
  });
}

if (onlyNumbers.length === 14) {
  return NextResponse.json({
    type: 'income',
    category: 'Serviços prestados',
    confidence: 0.99,
    reason: 'CNPJ identificado (empresa)',
    source: 'rule',
  });
}

    for (const cat of categories as any[]) {
      const keywords = cat.keywords || [];
      if (keywords.some((k: string) => keywordMatches(rawText, k))) {
        return NextResponse.json({
          type: Number(amount || 0) > 0 ? 'income' : 'expense',
          category: cat.name,
          confidence: 0.98,
          reason: 'Classificado por aprendizado/keyword',
          source: 'learned',
        });
      }
    }

    const allowed = await canUseAIAdmin(userId);

    if (!allowed) {
      return NextResponse.json({
        error: 'Limite de IA atingido',
        type: 'limit'
      }, { status: 403 });
    }

    const result = await classifyPixFlow({
      text: rawText,
      amount: Number(amount || 0),
    });

    await registerAIUsageAdmin(userId);

    return NextResponse.json({
      ...result,
      category: result.type === 'income' ? 'Recebimentos' : result.type === 'transfer' ? 'Transferência' : 'Acertos pessoais',
      source: 'ai',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro IA PIX' }, { status: 500 });
  }
}
