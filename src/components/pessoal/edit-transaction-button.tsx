"use client";

import { formatCategoryName } from '@/utils/normalize';

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { learnTransactionCategory } from "@/core/finance/category-learning-engine";
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
      await updateDoc(doc(db, "transactions", transaction.id), {
        description,
        category: formatCategoryName(category),
        merchant,
        amount: Number(amount),
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

            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "Salvar e aprender"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
