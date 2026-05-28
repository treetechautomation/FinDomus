import { Check, Loader2, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { buildImportPreview } from '@/core/imports/build-import-preview';
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

type Props = {
  transactions: any[];
  isProcessing: boolean;
  clearImport: () => void;
  confirmImport: (decisions?: Record<string, 'accepted' | 'ignored'>) => void;

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
}: Props) {
  const [decisions, setDecisions] = useState<Record<string, 'accepted' | 'ignored'>>({});
  
  const { rows } = useMemo(() => buildImportPreview(transactions), [transactions]);

  return (
    <Card className="border-primary/20 bg-card/70">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Revisão de Lançamentos
          </CardTitle>

          <CardDescription>
            Encontramos {transactions.length} transações.
            Revise antes de confirmar.
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
                      <Badge variant="secondary">
                        {tx.category}
                      </Badge>
                    </TableCell>

                    <TableCell
                      className={`text-right font-bold align-top pt-4 ${
                        tx.type === 'income'
                          ? 'text-positive'
                          : 'text-negative'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{' '}
                      {Math.abs(tx.amount).toLocaleString(
                        'pt-BR',
                        {
                          style: 'currency',
                          currency: 'BRL',
                        }
                      )}
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
