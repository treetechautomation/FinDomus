import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, AlertTriangle, Building2, TrendingUp, Landmark, Calendar, DollarSign } from 'lucide-react';
import type { BrokerImportResult } from '@/services/import/brokers/broker-types';

interface Props {
  data: BrokerImportResult;
  onClear: () => void;
}

const money = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function CorretorasPreview({ data, onClear }: Props) {
  const { detected, positions, dividends, transactions, errors, warnings } = data;

  const hasPositions = positions && positions.length > 0;
  const hasDividends = dividends && dividends.length > 0;
  const hasTransactions = transactions && transactions.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Info Card */}
      <Card className="border-indigo-500/30 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Preview Corretora</Badge>
                <Badge className="bg-white/5 text-zinc-400 border-white/10">{detected.format}</Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Extrato Detectado: <span className="text-indigo-400">{detected.source}</span>
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-1">
                {detected.reason}
              </CardDescription>
            </div>
            <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-zinc-500 block">Confiança da Detecção</span>
                <span className="text-sm font-bold text-indigo-400">{(detected.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-1.5 h-8 bg-indigo-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${detected.confidence * 100}%` }} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/25 border border-white/5 p-4 rounded-xl">
            <div>
              <span className="text-xs text-zinc-500 block">Tipo do Documento</span>
              <span className="text-sm font-semibold text-zinc-300">{detected.documentType}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Posições Lidas</span>
              <span className="text-sm font-semibold text-zinc-300">{positions.length}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Proventos Lidos</span>
              <span className="text-sm font-semibold text-zinc-300">{dividends.length}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Movimentações</span>
              <span className="text-sm font-semibold text-zinc-300">{transactions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Errors / Warnings */}
      {errors && errors.length > 0 && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erros no Processamento</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {errors.map((err, i) => (
                <li key={i} className="text-xs">{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings && warnings.length > 0 && (
        <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-400">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Avisos</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {warnings.map((warn, i) => (
                <li key={i} className="text-xs">{warn}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* 3. Positions Section */}
      {hasPositions && (
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-indigo-400">
              <Landmark className="h-5 w-5" />
              <CardTitle className="text-lg">Posições Custodiadas (`investment_positions`)</CardTitle>
            </div>
            <CardDescription>Ativos em carteira identificados na planilha de custódia.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-white/5">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Ticker</TableHead>
                    <TableHead className="text-zinc-400">Nome</TableHead>
                    <TableHead className="text-zinc-400">Classe</TableHead>
                    <TableHead className="text-zinc-400 text-right">Qtd.</TableHead>
                    <TableHead className="text-zinc-400 text-right">Preço Médio</TableHead>
                    <TableHead className="text-zinc-400 text-right">Último Preço</TableHead>
                    <TableHead className="text-zinc-400 text-right">Valor Atualizado</TableHead>
                    <TableHead className="text-zinc-400">Chave sugerida (dedupeKey)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((pos, idx) => (
                    <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-bold text-white">{pos.ticker}</TableCell>
                      <TableCell className="text-zinc-300 max-w-[200px] truncate">{pos.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-[10px]">
                          {pos.assetType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">{pos.quantity}</TableCell>
                      <TableCell className="text-right text-zinc-300">{money(pos.averagePrice)}</TableCell>
                      <TableCell className="text-right text-zinc-300">{money(pos.currentPrice)}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-400">{money(pos.marketValue)}</TableCell>
                      <TableCell className="text-[10px] font-mono text-zinc-500 truncate max-w-[250px]">{pos.dedupeKey}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Dividends Section */}
      {hasDividends && (
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-indigo-400">
              <DollarSign className="h-5 w-5" />
              <CardTitle className="text-lg">Histórico de Proventos (`investment_income`)</CardTitle>
            </div>
            <CardDescription>Rendimentos e juros creditados identificados no extrato.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-white/5">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Data</TableHead>
                    <TableHead className="text-zinc-400">Ticker</TableHead>
                    <TableHead className="text-zinc-400">Tipo de Evento</TableHead>
                    <TableHead className="text-zinc-400 text-right">Valor Líquido</TableHead>
                    <TableHead className="text-zinc-400">Chave sugerida (dedupeKey)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividends.map((div, idx) => (
                    <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                      <TableCell className="text-zinc-300">{div.date || '-'}</TableCell>
                      <TableCell className="font-bold text-white">{div.ticker}</TableCell>
                      <TableCell className="text-zinc-300">{div.type}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-400">{money(div.amount)}</TableCell>
                      <TableCell className="text-[10px] font-mono text-zinc-500 truncate max-w-[250px]">{div.dedupeKey}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Transactions Section */}
      {hasTransactions && (
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-indigo-400">
              <Calendar className="h-5 w-5" />
              <CardTitle className="text-lg">Operações Executadas (Nota de Corretagem)</CardTitle>
            </div>
            <CardDescription>Negociações capturadas das Notas de Corretagem (Sinacor).</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-white/5">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Pregão</TableHead>
                    <TableHead className="text-zinc-400">Ticker</TableHead>
                    <TableHead className="text-zinc-400">Operação</TableHead>
                    <TableHead className="text-zinc-400 text-right">Qtd.</TableHead>
                    <TableHead className="text-zinc-400 text-right">Preço</TableHead>
                    <TableHead className="text-zinc-400 text-right">Valor Operação</TableHead>
                    <TableHead className="text-zinc-400">Chave sugerida (dedupeKey)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, idx) => (
                    <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                      <TableCell className="text-zinc-300">{tx.date}</TableCell>
                      <TableCell className="font-bold text-white">{tx.ticker}</TableCell>
                      <TableCell>
                        <Badge className={tx.operation === 'C' || tx.operation.includes('Compra') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}>
                          {tx.operation === 'C' ? 'COMPRA' : tx.operation === 'V' ? 'VENDA' : tx.operation}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-zinc-300">{tx.quantity}</TableCell>
                      <TableCell className="text-right text-zinc-300">{money(tx.price)}</TableCell>
                      <TableCell className="text-right font-semibold text-zinc-300">{money(tx.amount)}</TableCell>
                      <TableCell className="text-[10px] font-mono text-zinc-500 truncate max-w-[250px]">{tx.dedupeKey}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-white/5 rounded-2xl bg-slate-900/60 backdrop-blur-xl">
        <Button variant="ghost" onClick={onClear} className="text-zinc-400 hover:text-white">
          Limpar e Voltar
        </Button>
        <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Persistência será liberada após homologação</span>
        </div>
        <Button disabled className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 opacity-50 cursor-not-allowed">
          Confirmar Importação
        </Button>
      </div>
    </div>
  );
}
