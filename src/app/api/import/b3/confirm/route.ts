import { NextRequest, NextResponse } from 'next/server';
import { persistB3Data } from '@/services/import/b3/b3-persister';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parsedData, fileName, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado. userId ausente.' }, { status: 401 });
    }

    if (!parsedData || !fileName) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const result = await persistB3Data(userId, parsedData, fileName);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('B3 Confirm Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao persistir dados.' }, { status: 500 });
  }
}
