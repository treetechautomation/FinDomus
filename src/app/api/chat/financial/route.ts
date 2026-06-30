import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { canUseAIAdmin, registerAIUsageAdmin } from '@/core/ai/usage.admin';
import { financialAdvisorFlow } from '@/ai/flows/financial-advisor';

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
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    const allowed = await canUseAIAdmin(userId);
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Limite de cota de IA atingido para este mês.',
          type: 'limit',
        },
        { status: 403 }
      );
    }

    const agentResponse = await financialAdvisorFlow({
      userId,
      question: message,
    });

    await registerAIUsageAdmin(userId);

    return NextResponse.json(agentResponse);
  } catch (error: any) {
    console.error('Erro na API de Assessor Financeiro IA:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no Assessor Financeiro de IA' },
      { status: 500 }
    );
  }
}
