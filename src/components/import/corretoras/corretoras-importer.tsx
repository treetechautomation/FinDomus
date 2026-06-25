'use client';

import { Building2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CorretorasImporter() {
  return (
    <Card className="border-indigo-500/20 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
      <CardHeader>
        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <Building2 className="h-6 w-6" />
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Em Homologação</Badge>
        </div>
        <CardTitle className="text-xl font-bold">Importação de Corretoras em preparação</CardTitle>
        <CardDescription>
          Integração simplificada para as maiores corretoras e bancos de investimentos do Brasil.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300">Corretoras Suportadas:</h4>
            <div className="flex flex-wrap gap-2">
              {['XP', 'BTG', 'Inter', 'Rico', 'Clear', 'NuInvest', 'Itaú Corretora', 'Banco do Brasil', 'Ágora', 'Genial', 'Toro', 'Modal'].map(broker => (
                <Badge key={broker} variant="outline" className="border-white/10 bg-white/5 text-zinc-300">
                  {broker}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300">Arquivos Aceitos:</h4>
            <ul className="text-sm text-zinc-400 space-y-2 pl-4 list-disc marker:text-indigo-500/70">
              <li>Notas de corretagem</li>
              <li>Extrato de custódia</li>
              <li>Movimentações</li>
              <li>Proventos</li>
              <li>Relatórios em CSV</li>
              <li>Relatórios em PDF</li>
            </ul>
          </div>
        </div>

        <div className="bg-black/20 border border-white/5 p-4 rounded-lg space-y-3">
          <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Resultado Esperado
          </h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Ativos atualizados</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Preço médio recalculado</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Movimentações registradas</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Proventos importados</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Patrimônio atualizado</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 border border-white/5 rounded-lg bg-white/5">
          <div className="flex items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-lg bg-black/20">
            <div className="flex flex-col items-center text-center gap-2">
              <Upload className="h-8 w-8 text-white/20" />
              <p className="text-sm font-medium text-white/40">Upload aguardando amostras reais</p>
              <p className="text-xs text-white/30">Arraste os arquivos CSV/PDF aqui (desabilitado)</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-indigo-400 bg-indigo-500/10 p-3 rounded-md border border-indigo-500/20">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            Aviso: Nenhum arquivo será processado ainda. O parser de Corretoras está em fase de implementação e os uploads estão temporariamente desabilitados.
          </p>
        </div>

        <div className="pt-4 border-t border-white/5">
          <Button disabled className="w-full md:w-auto bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Importar Corretora em breve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
