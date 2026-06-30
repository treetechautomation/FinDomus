import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { loadKernelContextAdmin } from '@/services/firestore/kernel.admin';

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
    const data = await loadKernelContextAdmin(userId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro na API /api/kernel:', error);
    return NextResponse.json({ error: error.message || 'Erro ao carregar dados do kernel' }, { status: 500 });
  }
}
