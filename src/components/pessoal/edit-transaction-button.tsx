"use client";

import { formatCategoryName } from '@/utils/normalize';

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { learnTransactionCategory } from "@/core/finance/category-learning-engine";
import { isExistingInstallmentRefundBlocked, resolveManualRefundForEditSave } from '@/utils/transaction-display';
import { financialEvents } from "@/core/finance/events";

type Props = {
  transaction: any;
  onSuccess?: () => void;
};

export function EditTransactionButton({ transaction, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(transaction.description || "");
  const [category, setCategory] = useState(transaction.category || "");
  const [merchant, setMerchant] = useState(transaction.merchant || "");
  const [amount, setAmount] = useState(String(transaction.amount || 0));
  const [isRefund, setIsRefund] = useState<boolean>(transaction.isRefund === true);
  const isInstallmentBlocked = isExistingInstallmentRefundBlocked(transaction);

  useEffect(() => {
    if (open) {
      setDescription(transaction.description || "");
      setCategory(transaction.category || "");
      setMerchant(transaction.merchant || "");
      setAmount(String(transaction.amount || 0));
      setIsRefund(transaction.isRefund === true);
    }
  }, [open, transaction]);
  const [saving, setSaving] = useState(false);

  async function learnCategory() {
    const text = merchant || description;
    if (!text || !category) return;

    await learnTransactionCategory({
      description: text,
      category: formatCategoryName(category),
      type: transaction.type,
    });
  }

  async function save() {
    if (!transaction?.id) return;

    setSaving(true);
    try {
      const isNowRefund = resolveManualRefundForEditSave(transaction, isRefund);

      await updateDoc(doc(db, "transactions", transaction.id), {
        description,
        category: formatCategoryName(category),
        merchant,
        amount: Number(amount),
        isRefund: isNowRefund,
        updatedAt: new Date().toISOString(),
      });

      financialEvents.emit({
        type: 'data:changed',
        payload: { triggerEvent: 'transaction:updated', transactionId: transaction.id },
        timestamp: new Date().toISOString(),
        source: 'editTransactionButton',
      });

      await learnCategory();

      setOpen(false);
      onSuccess?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Editar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar lançamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" />
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" />
            <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Loja" />
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor" />

            {transaction.type === 'expense' && (
              <div className="flex items-start space-x-2 pt-1 pb-1">
                <input
                  type="checkbox"
                  id={`edit-tx-refund-${transaction.id}`}
                  checked={isRefund}
                  disabled={isInstallmentBlocked}
                  onChange={(e) => {
                    if (isInstallmentBlocked) return;
                    setIsRefund(e.target.checked);
                  }}
                  className="h-4 w-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={`edit-tx-refund-${transaction.id}`}
                    className={`text-sm font-medium leading-none ${isInstallmentBlocked ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}
                  >
                    Esta transação é um estorno
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {isInstallmentBlocked
                      ? "Transações parceladas existentes não podem ser convertidas em estorno nesta versão, pois podem estar vinculadas a um parcelamento."
                      : "Estornos reduzem suas despesas e não são contabilizados como receita."}
                  </p>
                </div>
              </div>
            )}

            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "Salvar e aprender"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
