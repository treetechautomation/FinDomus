'use client';

import { TrendingUp, Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function B3Importer() {
  return (
    <Card className="border-amber-500/20 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
      <CardHeader>
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <TrendingUp className="h-6 w-6" />
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Em Homologação</Badge>
        </div>
        <CardTitle className="text-xl font-bold">Importação B3</CardTitle>
        <CardDescription>
          Carregue sua carteira de investimentos diretamente com relatórios da Área do Investidor B3. 
          O processamento automatizado garantirá que seus ativos, transações e proventos sejam consolidados com precisão.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zinc-300">Arquivos CSV necessários (Área do Investidor B3):</h4>
          <ol className="text-sm text-zinc-400 space-y-2 pl-4 list-decimal marker:text-amber-500/70">
            <li><strong>Posição/Custódia</strong> - Para atualizar o saldo consolidado dos ativos.</li>
            <li><strong>Movimentações</strong> - Para registrar compras, vendas e taxas históricas.</li>
            <li><strong>Proventos</strong> - Para lançar dividendos, JCP e rendimentos recebidos.</li>
          </ol>
        </div>

        <div className="flex flex-col gap-4 p-4 border border-white/5 rounded-lg bg-white/5">
          <div className="flex items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-lg bg-black/20">
            <div className="flex flex-col items-center text-center gap-2">
              <Upload className="h-8 w-8 text-white/20" />
              <p className="text-sm font-medium text-white/40">Upload aguardando amostras reais</p>
              <p className="text-xs text-white/30">Arraste os arquivos CSV aqui (desabilitado)</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-md border border-amber-500/20">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            Aviso: Nenhum arquivo será processado ainda. O parser B3 está em fase de implementação e os uploads estão temporariamente desabilitados até a conclusão da funcionalidade.
          </p>
        </div>

        <div className="pt-4 border-t border-white/5">
          <Button disabled className="w-full md:w-auto bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Importar B3 em breve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
