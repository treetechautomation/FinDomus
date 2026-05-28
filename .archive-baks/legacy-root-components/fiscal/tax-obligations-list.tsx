'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

import { markTaxAsPaid } from '@/services/firestore/fiscal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type TaxObligation = {
  id?: string;
  companyId: string;
  name: string;
  dueDate: string;
  value: number;
  status: 'pending' | 'paid';
};

function formatCurrency(value: number) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function getFiscalStatus(item: TaxObligation) {
  if (item.status === 'paid') return 'Pago';

  const today = new Date();
  const due = new Date(item.dueDate);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due < today) return 'Vencido';

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'A vencer';

  return 'Pendente';
}

export function TaxObligationsList({ obligations }: { obligations: TaxObligation[] }) {
  const router = useRouter();
  const [payingId, setPayingId] = useState<string | null>(null);

  async function handleMarkAsPaid(item: TaxObligation) {
    if (!item.id) return;

    try {
      setPayingId(item.id);
      await markTaxAsPaid(item.id);
      router.refresh();
    } catch (error) {
      console.error('Erro ao marcar obrigação como paga:', error);
      alert('Não foi possível marcar como pago.');
    } finally {
      setPayingId(null);
    }
  }

  if (obligations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nenhuma obrigação fiscal cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {obligations.map((item) => {
        const status = getFiscalStatus(item);
        const isPending = item.status === 'pending';

        return (
          <div key={item.id} className="rounded-lg border border-border/60 bg-background/30 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Vence em: {formatDate(item.dueDate)}
                </p>
                <p className="mt-1 font-mono text-sm">{formatCurrency(item.value)}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant={
                    status === 'Pago'
                      ? 'default'
                      : status === 'Vencido'
                        ? 'destructive'
                        : 'outline'
                  }
                >
                  {status}
                </Badge>

                {isPending && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={payingId === item.id}
                    onClick={() => handleMarkAsPaid(item)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {payingId === item.id ? 'Baixando...' : 'Marcar pago'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
