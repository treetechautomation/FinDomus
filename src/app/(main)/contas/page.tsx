'use client';

import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { NewAccountDialog } from '@/components/contas/new-account-dialog';
import { EditAccountDialog } from '@/components/contas/edit-account-dialog';
import { useVisibility } from '@/providers/visibility-provider';
import { calculateEmergencyReserve } from '@/core/finance/financial-core';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function accountTypeLabel(type: string) {
  switch (type) {
    case 'checking': return 'Conta Corrente';
    case 'investment': return 'Investimento';
    case 'wallet': return 'Carteira';
    case 'credit_card': return 'Cartão de Crédito';
    case 'savings': return 'Poupança';
    default: return type;
  }
}

function accountTypeBorderColor(type: string) {
  switch (type) {
    case 'checking': return 'border-l-primary/60';
    case 'savings': return 'border-l-emerald-500';
    case 'wallet': return 'border-l-cyan-500';
    case 'investment': return 'border-l-violet-500';
    case 'credit_card': return 'border-l-amber-500';
    default: return 'border-l-zinc-700';
  }
}

function getBankAvatar(name: string) {
  const clean = name.trim().toLowerCase();
  let initials = '';
  let colorClass = '';

  if (clean.includes('nubank') || clean.includes('nu ')) {
    initials = 'NU';
    colorClass = 'bg-purple-950/60 text-purple-400 border border-purple-500/20';
  } else if (clean.includes('itau') || clean.includes('itaú')) {
    initials = 'IT';
    colorClass = 'bg-orange-950/60 text-orange-400 border border-orange-500/20';
  } else if (clean.includes('bradesco')) {
    initials = 'BR';
    colorClass = 'bg-red-950/60 text-red-400 border border-red-500/20';
  } else if (clean.includes('brasil') || clean.includes('bb')) {
    initials = 'BB';
    colorClass = 'bg-yellow-950/60 text-yellow-400 border border-yellow-500/20';
  } else if (clean.includes('santander')) {
    initials = 'SAN';
    colorClass = 'bg-red-950/60 text-red-400 border border-red-500/20';
  } else if (clean.includes('xp')) {
    initials = 'XP';
    colorClass = 'bg-zinc-950 text-amber-400 border border-zinc-800';
  } else if (clean.includes('btg')) {
    initials = 'BTG';
    colorClass = 'bg-blue-950/60 text-blue-400 border border-blue-500/20';
  } else if (clean.includes('inter')) {
    initials = 'INT';
    colorClass = 'bg-orange-950/60 text-orange-400 border border-orange-500/20';
  } else if (clean.includes('cef') || clean.includes('caixa')) {
    initials = 'CX';
    colorClass = 'bg-sky-950/60 text-sky-400 border border-sky-500/20';
  } else {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words[0]) {
      initials = words[0].substring(0, 2).toUpperCase();
    } else {
      initials = 'CT';
    }
    colorClass = 'bg-primary/10 text-primary border border-primary/20';
  }

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 shadow-sm ${colorClass}`}>
      {initials}
    </div>
  );
}

export default function ContasPage() {
  const { user } = useAuth();
  const { showFinancialValues } = useVisibility();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadAccounts = () => {
    if (!user?.uid) return;
    setLoading(true);
    getAccountsWithBalance(user.uid)
      .then((result) => setAccounts(result || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, refreshTrigger]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const pfAccounts = accounts.filter((a) => a.owner === 'PF');
  const pjAccounts = accounts.filter((a) => a.owner !== 'PF');

  const reserve = calculateEmergencyReserve({
    accounts,
    investments: [],
    essentialMonthlyExpenses: 3000,
    targetMonths: 6,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Contas Bancárias
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas contas pessoais e empresariais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/?simulate=new_investment">
            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary hover:text-background transition-all duration-300">
              <TrendingUp className="mr-1 h-4 w-4" />
              Simular Conta
            </Button>
          </Link>
          <div id="tour-step-contas-adicionar">
            <NewAccountDialog onSuccess={() => setRefreshTrigger((k) => k + 1)} />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Saldo total */}
        <Card id="tour-step-contas-saldo" className="border-primary/15 bg-slate-950/40 backdrop-blur-xl shadow-[0_0_50px_rgba(var(--primary),0.02)] transition-all duration-300 relative overflow-hidden group hover:border-primary/35 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 p-3 text-primary/5 group-hover:text-primary/10 transition-colors">
            <CreditCard className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary">
              Saldo Total Consolidado
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1 text-white">
              {showFinancialValues
                ? totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '••••••••••'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{accounts.length} conta{accounts.length !== 1 ? 's' : ''} cadastrada{accounts.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        {/* Card 2: Reserva de Emergência */}
        <Card id="tour-step-contas-reserva" className={`bg-slate-950/40 backdrop-blur-xl shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 border ${
          reserve.reserveGap > 0 ? 'border-amber-500/20 hover:border-amber-500/35' : 'border-primary/20 hover:border-primary/35'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-b ${reserve.reserveGap > 0 ? 'from-amber-500/[0.01]' : 'from-primary/[0.01]'} to-transparent pointer-events-none`} />
          <div className={`absolute top-0 right-0 p-3 ${reserve.reserveGap > 0 ? 'text-amber-500/5 group-hover:text-amber-500/10' : 'text-primary/5 group-hover:text-primary/10'} transition-colors`}>
            <AlertCircle className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary/95 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Reserva de Emergência
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1 text-white">
              {showFinancialValues
                ? `${reserve.coveredMonths.toFixed(1)} meses`
                : '••••'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {reserve.reserveGap > 0
                ? `Faltam ${reserve.reserveGap.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para a meta de 6 meses`
                : 'Meta de 6 meses atingida ✅'}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Impacto no Freedom Index */}
        <Card className="border-primary/15 bg-slate-950/40 backdrop-blur-xl shadow-lg relative overflow-hidden group transition-all duration-300 hover:border-primary/35 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 p-3 text-primary/5 group-hover:text-primary/10 transition-colors">
            <Sparkles className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Impacto no Freedom Index
              </CardDescription>
              <CardTitle className="text-3xl font-extrabold mt-1 text-white">
                {showFinancialValues ? `${Math.min(100, Math.round(reserve.reservePercent))}%` : '••••'}
              </CardTitle>
            </div>
            {/* Circle SVG */}
            <div className="relative h-12 w-12 flex items-center justify-center">
              <svg className="h-12 w-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-muted"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-primary transition-all duration-500"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 - (Math.min(100, reserve.reservePercent) / 100) * (2 * Math.PI * 20)}
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-primary">FI</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Essa liquidez cobre <span className="font-bold text-foreground">{(Math.min(100, reserve.reservePercent) * 0.3).toFixed(1)}%</span> dos 30 pontos de segurança do índice.
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p>Carregando contas...</p>
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border border-primary/15 bg-slate-950/20 backdrop-blur-xl rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-[0_0_50px_rgba(var(--primary),0.01)] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CardHeader className="flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary),0.05)]">
              <CreditCard className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Nenhuma conta cadastrada</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-2 max-w-sm">
                Conecte suas contas correntes, investimentos ou carteiras para começar a controlar seus saldos e monitorar sua liquidez.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex justify-center">
            <NewAccountDialog onSuccess={() => setRefreshTrigger((k) => k + 1)} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* PF */}
          <Card id="tour-step-contas-pf" className="bg-card/45 border border-primary/10 overflow-hidden rounded-2xl">
            <CardHeader className="pb-3 border-b border-primary/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Pessoal (PF)
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-1">
                    {pfAccounts.length} conta{pfAccounts.length !== 1 ? 's' : ''} • Cobertura: {reserve.coveredMonths.toFixed(1)} meses
                  </CardDescription>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Saldo PF Consolidado</span>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                    {showFinancialValues
                      ? pfAccounts.reduce((s, a) => s + Number(a.balance || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : '••••••••••'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {pfAccounts.length === 0 && (
                  <p className="text-sm text-zinc-500 py-4 text-center">Nenhuma conta pessoal cadastrada.</p>
                )}
                {pfAccounts.map((account) => (
                  <div 
                    key={account.id} 
                    className={`flex items-center justify-between p-2.5 bg-zinc-950/20 hover:bg-primary/[0.02] rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${accountTypeBorderColor(account.type)} animate-in fade-in slide-in-from-bottom-1 duration-200`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getBankAvatar(account.name)}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">{account.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{accountTypeLabel(account.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-bold text-foreground">
                        {showFinancialValues
                          ? Number(account.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '••••••'}
                      </span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold text-[9px] px-1.5 py-0.5">
                        Pessoal
                      </Badge>
                      <EditAccountDialog account={account} onSuccess={() => setRefreshTrigger((k) => k + 1)} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PJ */}
          <Card id="tour-step-contas-pj" className="bg-card/45 border border-primary/10 overflow-hidden rounded-2xl">
            <CardHeader className="pb-3 border-b border-primary/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    Empresarial (PJ)
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-1">
                    {pjAccounts.length} conta{pjAccounts.length !== 1 ? 's' : ''} • Integração fiscal & CNPJ ativa
                  </CardDescription>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Saldo PJ Consolidado</span>
                  <p className="text-base font-extrabold text-cyan-400 mt-0.5">
                    {showFinancialValues
                      ? pjAccounts.reduce((s, a) => s + Number(a.balance || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : '••••••••••'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {pjAccounts.length === 0 && (
                  <p className="text-sm text-zinc-500 py-4 text-center">Nenhuma conta empresarial cadastrada.</p>
                )}
                {pjAccounts.map((account) => (
                  <div 
                    key={account.id} 
                    className={`flex items-center justify-between p-2.5 bg-zinc-950/20 hover:bg-primary/[0.02] rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border-l-[4px] ${accountTypeBorderColor(account.type)} animate-in fade-in slide-in-from-bottom-1 duration-200`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getBankAvatar(account.name)}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">{account.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{accountTypeLabel(account.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-bold text-foreground">
                        {showFinancialValues
                          ? Number(account.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '••••••'}
                      </span>
                      <Badge variant="outline" className="bg-primary/20 text-primary-foreground border-primary/30 font-semibold text-[9px] px-1.5 py-0.5">
                        Empresa
                      </Badge>
                      <EditAccountDialog account={account} onSuccess={() => setRefreshTrigger((k) => k + 1)} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
