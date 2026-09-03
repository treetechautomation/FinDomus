'use client';

import { useEffect, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { getRecentTransactions } from '@/services/firestore/transactions';
import { useAuth } from '@/providers/auth-provider';
import { getTransactionDisplaySemantics } from '@/utils/transaction-display';

type DashboardTransaction = {
  id: string;
  description: string;
  date: any;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  account?: string;
  isRefund?: boolean;
};

function normalizeDate(value: any) {
  if (!value) return new Date();

  if (typeof value?.toDate === 'function') {
    return value.toDate();
  }

  return new Date(value);
}

function normalizeType(value: any): 'income' | 'expense' {
  if (value === 'income' || value === 'entrada') return 'income';
  return 'expense';
}

function normalizeTransaction(t: any): DashboardTransaction {
  const type = normalizeType(t.type || t.tipo || t.transactionType);

  return {
    id: t.id,
    description: t.description || t.descricao || 'Lançamento',
    date: t.date || t.data || t.createdAt,
    category: t.category || t.categoria || t.suggestedCategory || 'Outros',
    amount: Math.abs(Number(t.amount ?? t.valor ?? t.value ?? 0)),
    type,
    account: t.account || t.conta || t.source || t.merchant || 'Importado',
    isRefund: t.isRefund === true,
  };
}

function TransactionRow({ transaction }: { transaction: DashboardTransaction }) {
  const display = getTransactionDisplaySemantics(transaction);
  const date = normalizeDate(transaction.date);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium">{transaction.description}</span>
          {display.isRefund && (
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              Estorno
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{date.toLocaleDateString('pt-BR')}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell">{transaction.category}</TableCell>
      <TableCell className="text-right">
        <span className={cn('font-medium', display.isPositiveEffect ? 'text-green-600' : 'text-red-600')}>
          {display.sign ? `${display.sign} ` : ''}{transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={display.isPositiveEffect ? 'secondary' : 'outline'}>{transaction.account}</Badge>
      </TableCell>
    </TableRow>
  );
}

export function RecentTransactions() {
  const { user } = useAuth();
  const [recent, setRecent] = useState<DashboardTransaction[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    async function load() {
      if (!user?.uid) return;
      const data = await getRecentTransactions(user.uid, undefined, 20);

      const mapped = data
        .map(normalizeTransaction)
        .sort((a, b) => normalizeDate(b.date).getTime() - normalizeDate(a.date).getTime())
        .slice(page * pageSize, (page + 1) * pageSize);

      setRecent(mapped);
    }

    load();
  }, [user?.uid, page]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lançamentos Recentes</CardTitle>
        <CardDescription>Veja suas últimas transações de receita e despesa.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="hidden sm:table-cell">Conta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
