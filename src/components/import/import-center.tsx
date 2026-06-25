'use client';

import { useState } from 'react';
import { Building2, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Importer } from '@/components/import/importer';
import { B3Importer } from '@/components/import/b3/b3-importer';

export function ImportCenter() {
  const [activeSource, setActiveSource] = useState<'financeiro' | 'b3' | 'corretoras' | 'cripto'>('financeiro');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="financeiro" value={activeSource} onValueChange={(val) => setActiveSource(val as any)} className="w-full">
        <TabsList className="bg-slate-900/60 border border-white/5 grid w-full grid-cols-2 md:grid-cols-4 p-1 h-auto rounded-xl">
          <TabsTrigger value="financeiro" className="rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="b3" className="rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center justify-center gap-1.5">
            Carteira B3 <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] px-1 py-0 h-4">Breve</Badge>
          </TabsTrigger>
          <TabsTrigger value="corretoras" className="rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Corretoras
          </TabsTrigger>
          <TabsTrigger value="cripto" className="rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Cripto / Futuro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-6 mt-6 animate-in fade-in duration-300">
          <Importer />
        </TabsContent>

        <TabsContent value="b3" className="mt-6 animate-in fade-in duration-300">
          <B3Importer />
        </TabsContent>

        <TabsContent value="corretoras" className="mt-6 animate-in fade-in duration-300">
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Building2 className="h-6 w-6" />
                <Badge className="bg-white/5 text-zinc-400 border-white/10">Integração Futura</Badge>
              </div>
              <CardTitle className="text-xl font-bold">Importação via Corretoras</CardTitle>
              <CardDescription>
                Integração automatizada ou por arquivos com XP, BTG, Rico, Inter e outras corretoras nacionais.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <p className="text-sm text-zinc-400">
                Esta funcionalidade está programada para sprints futuras do roadmap do FinDomus.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cripto" className="mt-6 animate-in fade-in duration-300">
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Wallet className="h-6 w-6" />
                <Badge className="bg-white/5 text-zinc-400 border-white/10">Integração Futura</Badge>
              </div>
              <CardTitle className="text-xl font-bold">Criptomoedas e Ativos Globais</CardTitle>
              <CardDescription>
                Importação de carteira cripto, extratos de exchanges (Binance, Mercado Bitcoin) e contratos futuros.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <p className="text-sm text-zinc-400">
                Esta funcionalidade está programada para sprints futuras do roadmap do FinDomus.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
