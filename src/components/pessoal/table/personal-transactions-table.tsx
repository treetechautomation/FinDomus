"use client";

import Link from 'next/link';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { EditTransactionButton } from '@/components/pessoal/edit-transaction-button';

type Props = {
  transactions: any[];
  title?: string;
  description?: string;

  getDisplayCategory: (t: any) => string;
  getDisplayMerchant: (t: any) => string;
  formatDateBR: (value: any) => string;

  cn: (...classes: any[]) => string;
  onSuccess?: () => void;
};

export function PersonalTransactionsTable({
  transactions,
  getDisplayCategory,
  getDisplayMerchant,
  formatDateBR,
  cn,
  onSuccess,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      if (!auth.currentUser) {
        toast({
          variant: 'destructive',
          title: 'Erro de Autenticação',
          description: 'Você precisa estar logado para baixar o extrato.',
        });
        return;
      }

      setIsDownloading(true);
      const token = await auth.currentUser.getIdToken();
      
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Erro de Autenticação',
          description: 'Sessão inválida. Faça login novamente.',
        });
        return;
      }

      const res = await fetch('/api/export/pdf?owner=PF', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Erro ao baixar');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'findomus-PF-extrato.html';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Falha no Download',
        description: 'Não foi possível baixar o extrato no momento.',
      });
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lançamentos Recentes</CardTitle>

        <CardDescription className="flex items-center justify-between">
          <span>
            Últimos lançamentos pessoais cadastrados.
          </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
              >
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isDownloading ? 'Baixando...' : 'Baixar extrato'}
              </button>

              <Link
                href="/importacoes"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Importar extrato
              </Link>
            </div>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Loja</TableHead>
                <TableHead>Origem</TableHead>

              <TableHead className="text-right">
                Valor
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-medium">
                      {t.description}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatDateBR(t.date)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {getDisplayCategory(t)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {getDisplayMerchant(t)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary">
                          {t.financialSource || t.importSessionName || "Manual"}
                        </Badge>
                        {t.financialSourceType && (
                          <span className="text-xs text-muted-foreground">
                            {t.financialSourceType === "credit_card" ? "Cartão" : "Conta"}
                          </span>
                        )}
                      </div>
                    </TableCell>

                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <span
                      className={cn(
                        'font-semibold',
                        t.type === 'income'
                          ? 'text-emerald-500'
                          : 'text-red-500'
                      )}
                    >
                      {Number(t.amount || 0).toLocaleString(
                        'pt-BR',
                        {
                          style: 'currency',
                          currency: 'BRL',
                        }
                      )}
                    </span>

                    <EditTransactionButton
                      transaction={t}
                      onSuccess={onSuccess}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
