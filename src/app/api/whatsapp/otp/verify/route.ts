import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { verifyOTP } from '@/lib/otp/otp-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decodedToken = await verifyIdToken(authHeader);
    const userId = decodedToken.uid;

    if (!userId) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { otpId, code } = await req.json();

    if (!otpId || !code) {
      return NextResponse.json(
        { success: false, error: 'OTP_ID_AND_CODE_REQUIRED' },
        { status: 400 }
      );
    }

    const result = await verifyOTP(otpId, code, userId);

    return NextResponse.json({ success: true, ...result });
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
