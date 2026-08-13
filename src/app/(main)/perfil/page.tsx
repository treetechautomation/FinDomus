'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';
import { ListItemCard, usePageHeader } from '@/components/mobile';
import {
  Settings,
  Building2,
  Upload,
  BarChart3,
  Crown,
  LogOut,
  User,
  Mail,
} from 'lucide-react';

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0] || 'U').substring(0, 2).toUpperCase();
}

export default function PerfilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [planInfo, setPlanInfo] = useState<{
    planName: string;
    isTrial: boolean;
    trialDaysRemaining: number | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    getIdToken(auth.currentUser!).then(async (token) => {
      try {
        const res = await fetch('/api/user/plan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setPlanInfo({
              planName: json.data.planName,
              isTrial: json.data.trial?.isActive ?? false,
              trialDaysRemaining: json.data.trial?.daysRemaining ?? null,
            });
          }
        }
      } catch { /* ignore */ }
    });
  }, [user]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const email = user?.email || '';
  const photoURL = user?.photoURL;
  const avatarInitials = getInitials(displayName);

  usePageHeader({ title: 'Perfil' });

  const planLabel = planInfo
    ? planInfo.isTrial
      ? `${planInfo.planName} (Trial · ${planInfo.trialDaysRemaining}d restantes)`
      : planInfo.planName
    : 'Carregando...';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch {
      // silently fail
    }
  };

  return (
    <div className="flex flex-col gap-fd-4 pb-fd-4" role="main" aria-label="Perfil">
      {/* ─── Avatar + Info ────────────────────────────────────────── */}
      <div className="pt-fd-3 flex items-center gap-fd-4">
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="rounded-full shrink-0"
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'cover',
              border: '2px solid var(--fd-color-border-default)',
            }}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center shrink-0 fd-heading-2"
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'var(--fd-color-action-primary-soft)',
              color: 'var(--fd-color-action-primary)',
            }}
            aria-hidden="true"
          >
            {avatarInitials}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <h1
            className="fd-heading-2 truncate"
            style={{ color: 'var(--fd-color-text-primary)' }}
          >
            {displayName}
          </h1>
          {email && (
            <span
              className="fd-supporting truncate"
              style={{ color: 'var(--fd-color-text-secondary)' }}
            >
              {email}
            </span>
          )}
          <span
            className="fd-caption mt-fd-1"
            style={{ color: 'var(--fd-color-action-primary)' }}
          >
            {planLabel}
          </span>
        </div>
      </div>

      {/* ─── Navegação ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-fd-1">
        <ListItemCard
          title="Configurações"
          subtitle="Preferências, privacidade e conta"
          icon={<Settings size={16} style={{ color: 'var(--fd-color-text-secondary)' }} aria-hidden />}
          showChevron
          onClick={() => router.push('/configuracoes')}
          className="rounded-fd-md"
        />
        <ListItemCard
          title="Empresas"
          subtitle="Gerencie suas empresas e CNPJs"
          icon={<Building2 size={16} style={{ color: 'var(--fd-color-text-secondary)' }} aria-hidden />}
          showChevron
          onClick={() => router.push('/empresas')}
          className="rounded-fd-md"
        />
        <ListItemCard
          title="Importações"
          subtitle="Importar extratos OFX, PDF e CSV"
          icon={<Upload size={16} style={{ color: 'var(--fd-color-text-secondary)' }} aria-hidden />}
          showChevron
          onClick={() => router.push('/importacoes')}
          className="rounded-fd-md"
        />
        <ListItemCard
          title="Relatórios"
          subtitle="Relatórios financeiros e DRE"
          icon={<BarChart3 size={16} style={{ color: 'var(--fd-color-text-secondary)' }} aria-hidden />}
          showChevron
          onClick={() => router.push('/relatorios')}
          className="rounded-fd-md"
        />
        <ListItemCard
          title="Planos"
          subtitle="Planos e assinatura FinDomus"
          icon={<Crown size={16} style={{ color: 'var(--fd-color-text-secondary)' }} aria-hidden />}
          showChevron
          onClick={() => router.push('/planos')}
          className="rounded-fd-md"
        />
      </div>

      {/* ─── Logout ───────────────────────────────────────────────── */}
      <div className="pt-fd-2">
        <ListItemCard
          title="Sair"
          subtitle="Encerrar sessão"
          icon={<LogOut size={16} style={{ color: 'var(--fd-color-state-negative)' }} aria-hidden />}
          showChevron
          onClick={handleLogout}
          className="rounded-fd-md"
        />
      </div>
    </div>
  );
}
