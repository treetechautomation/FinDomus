import { NextRequest, NextResponse } from 'next/server';
import { PluggyClient } from 'pluggy-sdk';
import { verifyIdToken } from '@/lib/verify-id-token';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(authHeader);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing itemId parameter' },
        { status: 400 }
      );
    }

    // 1. Validar Feature Flag
    const { isPluggyEnabledAdmin } = await import('@/services/pluggy/feature-flag-check');
    const isEnabled = await isPluggyEnabledAdmin(userId);
    if (!isEnabled) {
      return NextResponse.json({ success: false, error: 'Feature disabled' }, { status: 403 });
    }

    // 2. Validar limite de bancos do plano
    const { canConnectBank } = await import('@/lib/billing/billing-engine');
    const bankCheck = await canConnectBank(userId);
    if (!bankCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: bankCheck.reason || 'PLAN_LIMIT_REACHED',
        current: bankCheck.current,
        max: bankCheck.max,
        planName: bankCheck.planName,
        upgradeMessage: bankCheck.upgradeMessage,
        upgradeUrl: bankCheck.upgradeUrl,
      }, { status: 402 });
    }

    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[Pluggy Connect] Missing Pluggy environment credentials.');
      return NextResponse.json(
        { success: false, error: 'Pluggy integration not configured on server' },
        { status: 500 }
      );
    }

    const client = new PluggyClient({
      clientId,
      clientSecret,
    });

    // 1. Buscar detalhes do item na Pluggy
    let item;
    try {
      item = await client.fetchItem(itemId);
    } catch (e) {
      console.error(`[Pluggy Connect] Error fetching item ${itemId} from Pluggy:`, e);
      return NextResponse.json(
        { success: false, error: 'Item not found in Pluggy' },
        { status: 404 }
      );
    }

    // 2. Salvar no Firestore na coleção bank_connections
    const connectionRef = adminDb.collection('bank_connections').doc(itemId);
    const connectionData = {
      id: itemId,
      userId,
      itemId,
      connectorId: item.connector?.id || 0,
      status: item.status || 'ACTIVE',
      institution: item.connector?.name || 'Instituição Financeira',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSync: new Date().toISOString()
    };

    await connectionRef.set(connectionData);

    console.log(`[Pluggy Connect] Connection saved successfully for user ${userId}, itemId ${itemId}`);

    return NextResponse.json({ success: true, connection: connectionData });
  } catch (error: any) {
    console.error('[Pluggy Connect Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
