import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getUserPlanInfo } from '@/lib/billing/billing-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decodedToken = await verifyIdToken(authHeader);
    const userId = decodedToken.uid;

    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const planInfo = await getUserPlanInfo(userId);

    return NextResponse.json({ success: true, data: planInfo });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
