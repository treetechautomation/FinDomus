import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { syncItem } from '@/services/pluggy/sync-service';
import { isPluggyEnabledAdmin } from '@/services/pluggy/feature-flag-check';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const CRON_SECRET = process.env.CRON_SECRET;
    if (!CRON_SECRET) {
      return NextResponse.json({ success: false, error: 'Internal Server Error (Missing CRON_SECRET)' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verificar se a feature flag global está ativa
    const isEnabled = await isPluggyEnabledAdmin();
    if (!isEnabled) {
      return NextResponse.json({ success: false, error: 'Feature disabled' }, { status: 403 });
    }

    const schedulerExecutionId = 'sched_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    console.log(`[Pluggy Cron Sync] Starting automatic scheduler sync job. Execution ID: ${schedulerExecutionId}`);

    // 2. Buscar conexões que não estejam revogadas
    const connectionsSnap = await adminDb
      .collection('bank_connections')
      .where('status', 'in', ['ACTIVE', 'ERROR', 'PENDING'])
      .get();

    if (connectionsSnap.empty) {
      console.log('[Pluggy Cron Sync] No active/pending connections found to sync.');
      return NextResponse.json({ success: true, processed: 0, message: 'No connections found' });
    }

    const connections = connectionsSnap.docs.map(doc => doc.data());
    let successes = 0;
    let failures = 0;

    for (const conn of connections) {
      const { userId, itemId } = conn;
      if (!userId || !itemId) continue;

      try {
        const result = await syncItem(userId, itemId, 'SCHEDULER', schedulerExecutionId);
        if (result.success) {
          successes++;
        } else {
          failures++;
        }
      } catch (err) {
        console.error(`[Pluggy Cron Sync] Error syncing itemId ${itemId} for user ${userId}:`, err);
        failures++;
      }
    }

    console.log(`[Pluggy Cron Sync] Job finished. Processed: ${connections.length}, Successes: ${successes}, Failures: ${failures}`);

    return NextResponse.json({
      success: true,
      processed: connections.length,
      successes,
      failures
    });
  } catch (error: any) {
    console.error('[Pluggy Cron Sync Job Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
