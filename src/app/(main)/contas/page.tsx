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

function accountTypeBadge(type: string) {
  switch (type) {
    case 'checking':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'savings':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'wallet':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'investment':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'credit_card':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border/40';
  }
}

function accountTypeBorder(type: string) {
  switch (type) {
    case 'checking': return 'border-primary/60';
    case 'savings': return 'border-primary/40';
    case 'wallet': return 'border-primary/30';
    case 'investment': return 'border-primary/70';
    case 'credit_card': return 'border-primary/50';
    default: return 'border-transparent';
  }
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
    essentialMonthlyExpenses: 3000, // placeholder — viria do Kernel em integração futura
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
            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
              <TrendingUp className="mr-1 h-4 w-4" />
              Simular Conta
            </Button>
          </Link>
          <NewAccountDialog onSuccess={() => setRefreshTrigger((k) => k + 1)} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Saldo total */}
        <Card className="border-primary/40 bg-primary/10 relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary">
              Saldo Total Consolidado
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">
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
        <Card className={`bg-background/95 supports-[backdrop-filter]:bg-background/60 shadow-lg relative overflow-hidden group transition-all duration-300 border ${
          reserve.reserveGap > 0 ? 'border-amber-500/20 bg-amber-500/5' : 'border-primary/20 bg-primary/5'
        }`}>
          <div className="absolute top-0 right-0 p-3 text-primary/10 group-hover:text-primary/20 transition-colors">
            <AlertCircle className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary/95 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Reserva de Emergência
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold mt-1">
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
        <Card className="border-primary/15 bg-primary/5 supports-[backdrop-filter]:bg-primary/5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-primary/10 group-hover:text-primary/20 transition-colors">
            <Sparkles className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Impacto no Freedom Index
              </CardDescription>
              <CardTitle className="text-3xl font-extrabold mt-1">
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* PF */}
          <Card className="bg-card border-l-[3px] border-primary/30">
            <CardHeader>
              <CardTitle className="text-base">Pessoal (PF)</CardTitle>
              <CardDescription>
                Saldo:{' '}
                {showFinancialValues
                  ? pfAccounts.reduce((s, a) => s + Number(a.balance || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : '••••••••••'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pfAccounts.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma conta pessoal cadastrada.</p>
                )}
                {pfAccounts.map((account) => (
                  <div key={account.id} className={`flex items-center justify-between p-3 bg-secondary rounded-lg border-l-[3px] ${accountTypeBorder(account.type)}`}>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] font-normal border ${accountTypeBadge(account.type)}`}>
                          {accountTypeLabel(account.type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {showFinancialValues
                          ? Number(account.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '••••••'}
                      </span>
                      <Badge variant="outline" className="bg-primary/20 hover:bg-primary/25 text-primary border-primary/30 border">
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
          <Card className="bg-card border-l-[3px] border-primary/50">
            <CardHeader>
              <CardTitle className="text-base">Empresarial (PJ)</CardTitle>
              <CardDescription>
                Saldo:{' '}
                {showFinancialValues
                  ? pjAccounts.reduce((s, a) => s + Number(a.balance || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : '••••••••••'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pjAccounts.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma conta empresarial cadastrada.</p>
                )}
                {pjAccounts.map((account) => (
                  <div key={account.id} className={`flex items-center justify-between p-3 bg-secondary rounded-lg border-l-[3px] ${accountTypeBorder(account.type)}`}>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] font-normal border ${accountTypeBadge(account.type)}`}>
                          {accountTypeLabel(account.type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {showFinancialValues
                          ? Number(account.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '••••••'}
                      </span>
                      <Badge variant="outline" className="bg-primary/40 hover:bg-primary/45 text-primary-foreground border-primary/50 border">
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
