'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { B3ParseResult, B3Position, B3Dividend } from '@/types/import/b3';

interface B3PreviewProps {
  data: B3ParseResult | null;
  onConfirm?: () => void;
  isConfirming?: boolean;
}

export function B3Preview({ data, onConfirm, isConfirming }: B3PreviewProps) {
  if (!data) return null;

  const positions = data.positions || [];
  const dividends = data.dividends || [];
  const errors = data.errors || [];

  return (
    <div className="space-y-6 mt-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Preview dos Dados Extraídos</h3>
        <Badge variant="outline" className="border-amber-500/20 text-amber-500 bg-amber-500/10">
          Modo Somente Leitura (Sem Persistência)
        </Badge>
      </div>

      {errors.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 space-y-2">
            <h4 className="text-sm font-semibold text-red-400">Erros de Parser ({errors.length})</h4>
            <ul className="text-xs text-red-400/80 list-disc pl-4 space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="bg-slate-900/60 border border-white/5 w-full justify-start rounded-xl p-1">
          <TabsTrigger value="positions" className="rounded-lg text-xs">
            Posições ({positions.length})
          </TabsTrigger>
          <TabsTrigger value="dividends" className="rounded-lg text-xs">
            Proventos ({dividends.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-4">
          <Card className="border-white/10 bg-slate-950/40">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-xs text-zinc-500">Ano</TableHead>
                    <TableHead className="text-xs text-zinc-500">Ticker</TableHead>
                    <TableHead className="text-xs text-zinc-500">Tipo</TableHead>
                    <TableHead className="text-xs text-zinc-500">Instituição</TableHead>
                    <TableHead className="text-xs text-zinc-500 text-right">Qtd</TableHead>
                    <TableHead className="text-xs text-zinc-500 text-right">Preço</TableHead>
                    <TableHead className="text-xs text-zinc-500 text-right">Total Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((pos) => (
                    <TableRow key={pos.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="text-sm text-zinc-400">{pos.ano}</TableCell>
                      <TableCell className="text-sm font-medium text-white">
                        <Badge variant="outline" className="bg-white/5 text-amber-400 border-amber-500/20">{pos.ticker}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-400">{pos.tipo}</TableCell>
                      <TableCell className="text-sm text-zinc-500 truncate max-w-[150px]">{pos.instituicao}</TableCell>
                      <TableCell className="text-sm text-zinc-300 text-right">{pos.quantidade}</TableCell>
                      <TableCell className="text-sm text-zinc-300 text-right">
                        {pos.preco ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pos.preco) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-emerald-400 font-medium text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pos.valorAtualizado)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {positions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-sm text-zinc-500">
                        Nenhuma posição identificada no documento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="dividends" className="mt-4">
          <Card className="border-white/10 bg-slate-950/40">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-xs text-zinc-500">Ano</TableHead>
                    <TableHead className="text-xs text-zinc-500">Ticker</TableHead>
                    <TableHead className="text-xs text-zinc-500">Tipo de Evento</TableHead>
                    <TableHead className="text-xs text-zinc-500 text-right">Valor Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividends.map((div) => (
                    <TableRow key={div.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="text-sm text-zinc-400">{div.ano}</TableCell>
                      <TableCell className="text-sm font-medium text-white">
                        <Badge variant="outline" className="bg-white/5 text-amber-400 border-amber-500/20">{div.ticker}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-400">{div.tipo}</TableCell>
                      <TableCell className="text-sm text-emerald-400 font-medium text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(div.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {dividends.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-sm text-zinc-500">
                        Nenhum provento identificado no documento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {onConfirm && positions.length + dividends.length > 0 && (
        <div className="pt-6 border-t border-white/5 flex justify-end">
          <Button 
            onClick={onConfirm} 
            disabled={isConfirming}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold"
          >
            {isConfirming ? 'Persistindo dados...' : 'Confirmar Importação'}
          </Button>
        </div>
      )}
    </div>
  );
}
