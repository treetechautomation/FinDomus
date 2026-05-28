'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertBudget } from "@/services/firestore/planning";
import { useAuth } from "@/providers/auth-provider";

export function EditBudgetDialog({ category, month }: { category: string; month: string }) {
  const { user } = useAuth();
  const [value, setValue] = useState("");

  async function save() {
    if (!user?.uid) return;
    await upsertBudget(user.uid, {
      category,
      planned: Number(value),
      month
    });
    location.reload();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Editar</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir orçamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Label>{category}</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={save}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
