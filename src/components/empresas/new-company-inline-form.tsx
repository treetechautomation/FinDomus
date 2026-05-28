'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { addCompany } from '@/services/firestore/accounts';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewCompanyInlineForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Informe o nome da empresa.');
      return;
    }

    try {
      setSaving(true);
      if (!user?.uid) throw new Error("Usuário não autenticado.");
      await addCompany(user.uid, { name: name.trim() });
      setName('');
      router.refresh();
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      alert('Não foi possível adicionar a empresa.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <Input
        placeholder="Nova empresa"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="submit" disabled={saving}>
        {saving ? 'Salvando...' : 'Adicionar Empresa'}
      </Button>
    </form>
  );
}
