import { Check, Loader2, ShieldCheck, ArrowRightLeft, AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { buildImportPreview } from '@/core/imports/build-import-preview';
import { generateImportHash } from '@/services/firestore/transactions';
import type { Category } from '@/services/firestore/categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

type Props = {
  transactions: any[];
  isProcessing: boolean;
  clearImport: () => void;
  confirmImport: (decisions?: Record<string, 'accepted' | 'ignored'>) => void;

  overrides?: Record<string, { category?: string; type?: string; ignored?: boolean; pendingLearning?: boolean }>;
  setOverrides?: (val: Record<string, { category?: string; type?: string; ignored?: boolean; pendingLearning?: boolean }>) => void;
  categories?: Category[];

  owner: 'PF' | 'PJ';
  setOwner: (v: 'PF' | 'PJ') => void;

  competenceMonth: string;
  setCompetenceMonth: (v: string) => void;

  companies: any[];
  companyId: string;
  setCompanyId: (v: string) => void;
};

export function ImportReviewTable({
  transactions,
  isProcessing,
  clearImport,
  confirmImport,
  overrides = {},
  setOverrides,
  categories = [],
}: Props) {
  const [decisions, setDecisions] = useState<Record<string, 'accepted' | 'ignored'>>({});

  const reviewedTransactions = useMemo(() => {
    return transactions.map(tx => {
      const hash = tx.importHash || generateImportHash({
        date: tx.dateISO || tx.date,
        amount: tx.amount,
        description: tx.description,
        merchant: tx.merchant,
        owner: tx.owner,
        externalId: tx.externalId,
      });
      const override = overrides[hash];
      if (override) {
        return {
          ...tx,
          importHash: hash,
          category: override.category ?? tx.category,
          type: override.type ?? tx.type,
        };
      }
      return { ...tx, importHash: hash };
    });
  }, [transactions, overrides]);

  const { rows, totals } = useMemo(() => buildImportPreview(reviewedTransactions), [reviewedTransactions]);

  const handleCategoryChange = (hash: string, newCategoryName: string) => {
    if (!setOverrides) return;
    setOverrides({
      ...overrides,
      [hash]: {
        ...overrides[hash],
        category: newCategoryName,
        pendingLearning: true,
      }
    });
  };

  const markAsOwnTransfer = (hash: string) => {
    if (!setOverrides) return;
    setOverrides({
      ...overrides,
      [hash]: {
        ...overrides[hash],
        type: 'transfer',
        category: 'Transferência entre contas', // Using default standard category name
        pendingLearning: true,
      }
    });
  };

  return (
    <Card className="border-primary/20 bg-card/70">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Revisão de Lançamentos
          </CardTitle>

          <CardDescription className="mt-2">
            <div>Encontramos {transactions.length} transações. Revise antes de confirmar.</div>
            <div className="flex flex-wrap gap-4 mt-2 font-medium text-xs">
              <span className="text-positive">Entradas: R$ {totals.estornos.toFixed(2)}</span>
              <span className="text-negative">Saídas: R$ {totals.grossExpenses.toFixed(2)}</span>
              <span className="text-muted-foreground">Transferências: R$ {totals.transfer.toFixed(2)}</span>
            </div>
          </CardDescription>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearImport}
            disabled={isProcessing}
          >
            Cancelar
          </Button>

          <Button
            onClick={() => confirmImport(decisions)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}

            Confirmar Importação
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => {
                const tx = row.transaction;
                const isSuggested = row.status.includes('suggested_transfer') && row.suggestedTransferPairId;
                const decision = isSuggested ? decisions[row.suggestedTransferPairId!] : undefined;
                const showSuggestion = isSuggested && decision !== 'ignored';
                const isTransfer = tx.type === 'transfer';

                const validCategories = categories.filter(c => {
                  if (!c.categoryType) return true;
                  if (c.categoryType === tx.type) return true;
                  return false;
                });

                const selectedCatData = categories.find(c => c.name === tx.category);

                return (
                  <TableRow key={row.index}>
                    <TableCell className="font-mono text-xs align-top pt-4">
                      {tx.date}
                    </TableCell>

                    <TableCell className="align-top pt-4">
                      <div className="font-medium">
                        {tx.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.merchant}
                      </div>

                      {!isTransfer && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-muted-foreground hover:text-primary"
                            onClick={() => markAsOwnTransfer(row.importHash)}
                          >
                            <ArrowRightLeft className="h-3 w-3 mr-1" />
                            Marcar como transf. própria
                          </Button>
                        </div>
                      )}

                      {showSuggestion && (
                        <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                row.suggestedTransferConfidence === 'high' ? 'default' :
                                row.suggestedTransferConfidence === 'medium' ? 'secondary' : 'outline'
                              }
                            >
                              MATCH {row.suggestedTransferConfidence?.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-primary">Score: {row.suggestedTransferScore}</span>
                            <span className="text-muted-foreground hidden sm:inline">- {row.suggestedTransferReason}</span>
                          </div>

                          {decision !== 'accepted' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-[11px]"
                                onClick={() => setDecisions(prev => ({...prev, [row.suggestedTransferPairId!]: 'accepted'}))}
                              >
                                Aceitar Par
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px]"
                                onClick={() => setDecisions(prev => ({...prev, [row.suggestedTransferPairId!]: 'ignored'}))}
                              >
                                Ignorar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-emerald-600 font-medium">
                              <Check className="h-3 w-3" />
                              Par Aceito
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="align-top pt-4">
                      <Select
                        value={tx.category}
                        onValueChange={(val) => handleCategoryChange(row.importHash, val)}
                      >
                        <SelectTrigger className="h-8 w-[180px] text-xs">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {validCategories.map(c => (
                            <SelectItem key={c.id || c.name} value={c.name} className="text-xs">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedCatData?.categoryType === 'investment' && (
                        <Alert className="mt-2 py-2 px-3 border-amber-500/50 bg-amber-500/10">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <AlertDescription className="text-[10px] text-amber-500 ml-2">
                            Esta movimentação será tratada financeiramente; a posição de investimentos não será atualizada.
                          </AlertDescription>
                        </Alert>
                      )}
                    </TableCell>

                    <TableCell
                      className={`text-right font-bold align-top pt-4 ${
                        tx.type === 'income'
                          ? 'text-positive'
                          : tx.type === 'expense'
                            ? 'text-negative'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{' '}
                      {(() => {
                        const safeAmount = Number.isFinite(Number(tx.amount)) ? Number(tx.amount) : 0;
                        return Math.abs(safeAmount).toLocaleString(
                          'pt-BR',
                          {
                            style: 'currency',
                            currency: 'BRL',
                          }
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
