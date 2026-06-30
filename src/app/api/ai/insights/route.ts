import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getFinancialAIDataAdmin } from '@/services/firestore/financial-ai.admin';

export async function GET(req: Request) {
  let userId = '';
  try {
    const authHeader = req.headers.get('authorization');
    const decodedToken = await verifyIdToken(authHeader);
    userId = decodedToken.uid;
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const insightsData = await getFinancialAIDataAdmin(userId);
    return NextResponse.json(insightsData);
  } catch (error: any) {
    console.error('Erro na API de Insights IA:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar insights' }, { status: 500 });
  }
}
