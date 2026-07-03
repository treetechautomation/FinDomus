import { adminDb } from '@/lib/firebase-admin';
import type { SmartCTA, Subscription } from '@/lib/billing/billing-types';
import { getTrialStatus } from './trial-engine';
import { getUserCapabilities } from './capabilities-engine';
import { getUsageStats, getBankUsagePercentage } from './usage-engine';

export async function getSmartCTA(userId: string): Promise<SmartCTA | null> {
  const caps = await getUserCapabilities(userId);
  const usage = await getUsageStats(userId);
  const trial = await getTrialStatusByUser(userId);
  const pluggyOn = caps.canUsePluggy;

  if (trial?.isActive) {
    return getTrialCTA(trial.daysRemaining ?? 7, pluggyOn);
  }

  if (trial?.isExpired) {
    return {
      level: 'expired',
      title: 'Trial Expirado',
      message: 'Seu período de teste terminou. Escolha um plano para continuar usando o FinDomus.',
      actionLabel: 'Escolher Plano',
      actionUrl: '/planos',
      highlight: true,
    };
  }

  if (pluggyOn) {
    const bankPct = await getBankUsagePercentage(userId);

    if (caps.maxBankConnections !== null && usage.connectedBanks >= caps.maxBankConnections) {
      const upgradeTarget = caps.maxBankConnections <= 1 ? 'Família' : 'Família Premium';
      const upgradeBanks = caps.maxBankConnections <= 1 ? 5 : 'ilimitados';
      return {
        level: 'upgrade',
        title: 'Limite Atingido',
        message: `Você atingiu o limite de ${caps.maxBankConnections} banco(s) do seu plano. Faça upgrade para ${upgradeTarget} e conecte até ${upgradeBanks} bancos.`,
        actionLabel: 'Fazer Upgrade',
        actionUrl: '/planos',
        highlight: true,
      };
    }

    if (bankPct >= 80 && caps.maxBankConnections !== null) {
      return {
        level: 'warning',
        title: 'Quase no Limite',
        message: `Você já utiliza ${bankPct}% do limite de bancos do seu plano. Considere fazer upgrade.`,
        actionLabel: 'Ver Planos',
        actionUrl: '/planos',
        highlight: false,
      };
    }

    if (usage.connectedBanks === 0) {
      return {
        level: 'info',
        title: 'Conecte seu Banco',
        message: 'Conecte sua conta bancária via Open Finance e economize horas de importação manual.',
        actionLabel: 'Conectar Banco',
        actionUrl: '/importacoes?tab=open-finance',
        highlight: false,
      };
    }
  }

  return null;
}

async function getTrialStatusByUser(userId: string) {
  const userSnap = await adminDb.collection('users').doc(userId).get();
  if (!userSnap.exists) return null;
  const householdId = userSnap.data()?.activeHouseholdId;
  if (!householdId) return null;

  return getTrialStatus(householdId);
}

function getTrialCTA(daysRemaining: number, pluggyOn: boolean): SmartCTA {
  if (daysRemaining === 7) {
    return {
      level: 'info',
      title: 'Trial Premium Ativo',
      message: 'Bem-vindo! Você tem 7 dias de acesso Premium gratuito a todos os recursos do FinDomus.',
      actionLabel: pluggyOn ? 'Conectar Banco' : 'Explorar Recursos',
      actionUrl: pluggyOn ? '/importacoes?tab=open-finance' : '/dashboard',
      highlight: false,
    };
  }

  if (daysRemaining >= 4) {
    return {
      level: 'info',
      title: `${daysRemaining} Dias Restantes`,
      message: `Aproveite seu Trial Premium. ${daysRemaining} dias restantes com todos os recursos liberados.`,
      actionLabel: 'Conhecer Recursos',
      actionUrl: '/dashboard',
      highlight: false,
    };
  }

  if (daysRemaining >= 2) {
    return {
      level: 'warning',
      title: `Apenas ${daysRemaining} Dias`,
      message: `Seu Trial termina em ${daysRemaining} dias. Garanta o desconto vitalício de lançamento!`,
      actionLabel: 'Ver Planos',
      actionUrl: '/planos',
      highlight: true,
    };
  }

  return {
    level: 'warning',
    title: 'Último Dia!',
    message: 'Hoje é o último dia do seu Trial Premium. Não perca o desconto vitalício de lançamento.',
    actionLabel: 'Garantir Desconto',
    actionUrl: '/planos',
    highlight: true,
  };
}
