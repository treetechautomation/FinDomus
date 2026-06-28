import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { extractTransactionsFromDocument } from '@/ai/flows/extract-transactions-from-document';
import { canUseAIAdmin, registerAIUsageAdmin } from '@/core/ai/usage.admin';

export async function POST(req: Request) {
  let userId = '';
  try {
    const authHeader = req.headers.get('authorization');
    const decodedToken = await verifyIdToken(authHeader);
    userId = decodedToken.uid;
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { documentDataUri } = await req.json();

    if (!documentDataUri) {
      return NextResponse.json({ error: 'documentDataUri é obrigatório' }, { status: 400 });
    }

    const allowed = await canUseAIAdmin(userId);
    if (!allowed) {
      return NextResponse.json({
        error: 'Limite de cota de IA atingido para este mês.',
        type: 'limit'
      }, { status: 403 });
    }

    const transactions = await extractTransactionsFromDocument({ documentDataUri });

    await registerAIUsageAdmin(userId);

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('Erro na extração IA:', error);
    return NextResponse.json({ error: error.message || 'Erro interno na extração de documento' }, { status: 500 });
  }
}
