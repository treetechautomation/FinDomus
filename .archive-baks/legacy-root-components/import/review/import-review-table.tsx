import { Check, Loader2, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  confirmImport: () => void;

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
            onClick={confirmImport}
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
              {transactions.map((tx, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">
                    {tx.date}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">
                      {tx.description}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {tx.merchant}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {tx.category}
                    </Badge>
                  </TableCell>

                  <TableCell
                    className={`text-right font-bold ${
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
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
