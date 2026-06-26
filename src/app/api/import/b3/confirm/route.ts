import { NextRequest, NextResponse } from 'next/server';
import { persistB3Data } from '@/services/import/b3/b3-persister';
import { verifyIdToken } from '@/lib/verify-id-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(authHeader);
    } catch (err: any) {
      const isMissing = !authHeader || !authHeader.startsWith('Bearer ');
      return NextResponse.json(
        { success: false, error: isMissing ? "UNAUTHORIZED" : "FORBIDDEN" },
        { status: isMissing ? 401 : 403 }
      );
    }
    const userId = decodedToken.uid;

    const body = await req.json();
    const { parsedData, fileName } = body;

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
