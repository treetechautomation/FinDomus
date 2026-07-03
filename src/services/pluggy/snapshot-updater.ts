import { getFeatureFlags } from '@/lib/feature-flags';
import { snapshotRegistry } from '@/lib/snapshot-registry';
import { logger } from '@/lib/logger';
import { financialEvents } from '@/core/finance/events';

/**
 * Atualiza todos os snapshots do usuário em segundo plano no servidor (offline).
 * Respeita as feature flags individuais do usuário.
 * Ao final, emite o evento 'data:changed' para forçar a atualização imediata no frontend.
 */
export async function forceUpdateAllSnapshotsAdmin(userId: string): Promise<void> {
  if (!userId) return;
  console.log(`[Snapshot Updater Server] Starting snapshots rebuild for user ${userId}...`);

  try {
    const flags = await getFeatureFlags(userId);
    // Se o scheduler de snapshots estiver desligado globalmente ou para o usuário, pula
    if (!flags.schedulerEnabled) {
      console.log(`[Snapshot Updater Server] Rebuild skipped: schedulerEnabled is false for user ${userId}.`);
      return;
    }

    const registry = await snapshotRegistry.getOrCreate(userId);
    const domains = ['dashboard', 'planning', 'investment', 'liability', 'reports'] as const;

    for (const domain of domains) {
      // Verificar se o snapshot do domínio está ativo nas flags
      const isDomainEnabled = flags[`${domain}Snapshot` as keyof typeof flags] === true;
      if (!isDomainEnabled) continue;

      console.log(`[Snapshot Updater Server] Building snapshot for domain: ${domain}...`);
      await snapshotRegistry.markBuilding(userId, domain);

      try {
        if (domain === 'dashboard') {
          const { buildDashboardSnapshot } = await import('@/lib/dashboard-snapshot-builder');
          const { writeDashboardSnapshot } = await import('@/lib/dashboard-snapshot-service');
          const { snapshot } = await buildDashboardSnapshot(userId, 1);
          await writeDashboardSnapshot(userId, snapshot);
          await snapshotRegistry.markReady(userId, domain, snapshot.dataVersion, snapshot.buildTimeMs);
        }
        else if (domain === 'planning') {
          const { buildPlanningSnapshot } = await import('@/lib/planning-snapshot-builder');
          const { writePlanningSnapshot } = await import('@/lib/planning-snapshot-service');
          const { snapshot } = await buildPlanningSnapshot(userId, 1);
          await writePlanningSnapshot(userId, snapshot);
          await snapshotRegistry.markReady(userId, domain, snapshot.dataVersion, snapshot.buildTimeMs);
        }
        else if (domain === 'investment') {
          const { buildInvestmentSnapshot } = await import('@/lib/investment-snapshot-builder');
          const { writeInvestmentSnapshot } = await import('@/lib/investment-snapshot-service');
          const { snapshot } = await buildInvestmentSnapshot(userId, 1);
          await writeInvestmentSnapshot(userId, snapshot);
          await snapshotRegistry.markReady(userId, domain, snapshot.dataVersion, snapshot.buildTimeMs);
        }
        else if (domain === 'liability') {
          const { buildLiabilitySnapshot } = await import('@/lib/liability-snapshot-builder');
          const { writeLiabilitySnapshot } = await import('@/lib/liability-snapshot-service');
          const { snapshot } = await buildLiabilitySnapshot(userId, 1);
          await writeLiabilitySnapshot(userId, snapshot);
          await snapshotRegistry.markReady(userId, domain, snapshot.dataVersion, snapshot.buildTimeMs);
        }
        else if (domain === 'reports') {
          const { getCurrentMonthKey } = await import('@/core/finance/financial-period-engine');
          const { buildReportsSnapshot } = await import('@/lib/reports-snapshot-builder');
          const { writeReportsSnapshot } = await import('@/lib/reports-snapshot-service');
          const monthKey = getCurrentMonthKey();
          for (const owner of ['PF', 'PJ'] as const) {
            const { snapshot } = await buildReportsSnapshot(userId, owner, monthKey, 1);
            await writeReportsSnapshot(snapshot);
          }
          await snapshotRegistry.markReady(userId, domain, 1, 0);
        }
        console.log(`[Snapshot Updater Server] Domain ${domain} built and ready.`);
      } catch (err) {
        logger.error('snapshot_build_failed_admin', userId, { domain, error: String(err) });
        await snapshotRegistry.markFailed(userId, domain);
      }
    }

    console.log(`[Snapshot Updater Server] Completed snapshots rebuild for user ${userId}. Emitting data:changed...`);
    
    // Emitir evento para reatividade em tempo real
    financialEvents.emit({
      type: 'data:changed',
      payload: { userId },
      timestamp: new Date().toISOString(),
      source: 'pluggySync:snapshotUpdater',
    });

  } catch (error) {
    console.error(`[Snapshot Updater Server] Failed to update snapshots for user ${userId}:`, error);
  }
}
