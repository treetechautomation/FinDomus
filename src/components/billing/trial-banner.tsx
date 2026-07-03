'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Crown, Clock, AlertTriangle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrialData {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  hoursRemaining: number | null;
}

export function TrialBanner() {
  const { user } = useAuth();
  const [trial, setTrial] = useState<TrialData | null>(null);

  useEffect(() => {
    if (!user) return;
    getIdToken(auth.currentUser!).then(async (token) => {
      try {
        const res = await fetch('/api/user/plan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.trial) {
            setTrial(json.data.trial);
          }
        }
      } catch { /* ignore */ }
    });
  }, [user]);

  if (!trial) return null;
  if (!trial.isActive && !trial.isExpired) return null;

  return (
    <div
      className={`px-4 py-2.5 text-center text-sm font-medium ${
        trial.isExpired
          ? 'bg-red-500/10 text-red-400 border-b border-red-500/20'
          : trial.daysRemaining && trial.daysRemaining <= 1
          ? 'bg-orange-500/10 text-orange-400 border-b border-orange-500/20'
          : trial.daysRemaining && trial.daysRemaining <= 3
          ? 'bg-amber-500/10 text-amber-400 border-b border-amber-500/20'
          : 'bg-blue-500/10 text-blue-400 border-b border-blue-500/20'
      }`}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {trial.isExpired ? (
          <>
            <AlertTriangle className="h-4 w-4" />
            Seu Trial terminou.
            <a href="/planos" className="underline font-bold hover:text-white transition-colors">
              Escolha um plano
            </a>
          </>
        ) : trial.daysRemaining === 7 ? (
          <>
            <BadgeCheck className="h-4 w-4" />
            Bem-vindo ao Trial Premium! 7 dias grátis com acesso total.
          </>
        ) : trial.daysRemaining && trial.daysRemaining <= 1 ? (
          <>
            <Clock className="h-4 w-4 animate-pulse" />
            Último dia de Trial! Garanta o desconto vitalício.
            <a href="/planos" className="underline font-bold hover:text-white transition-colors">
              Ver Planos
            </a>
          </>
        ) : (
          <>
            <Crown className="h-4 w-4" />
            {trial.daysRemaining} dias restantes de Trial Premium.
            <a href="/planos" className="underline font-bold hover:text-white transition-colors">
              Aproveitar oferta
            </a>
          </>
        )}
      </div>
    </div>
  );
}
