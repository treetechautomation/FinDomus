'use client';

import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { NewAccountDialog } from '@/components/contas/new-account-dialog';
import { EditAccountDialog } from '@/components/contas/edit-account-dialog';
import { useVisibility } from '@/providers/visibility-provider';

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

export default function ContasPage() {
  const { user } = useAuth();
  const { showFinancialValues } = useVisibility();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [user?.uid]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const pfAccounts = accounts.filter((a) => a.owner === 'PF');
  const pjAccounts = accounts.filter((a) => a.owner !== 'PF');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-teal-400" />
            Contas Bancárias
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas contas pessoais e empresariais.
          </p>
        </div>
        <NewAccountDialog />
      </div>

      {/* Saldo total */}
      <Card className="border-teal-500/20 bg-teal-500/5">
        <CardHeader className="pb-2">
          <CardDescription>Saldo Total Consolidado</CardDescription>
          <CardTitle className="text-3xl">
            {showFinancialValues
              ? totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : '••••••••••'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{accounts.length} conta{accounts.length !== 1 ? 's' : ''} cadastrada{accounts.length !== 1 ? 's' : ''}</p>
        </CardContent>
      </Card>

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
          <Card>
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
                  <div key={account.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{accountTypeLabel(account.type)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {showFinancialValues
                          ? Number(account.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '••••••'}
                      </span>
                      <Badge variant="default">Pessoal</Badge>
                      <EditAccountDialog account={account} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PJ */}
          <Card>
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
                  <div key={account.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{accountTypeLabel(account.type)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {showFinancialValues
                          ? Number(account.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '••••••'}
                      </span>
                      <Badge variant="outline">Empresa</Badge>
                      <EditAccountDialog account={account} />
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
