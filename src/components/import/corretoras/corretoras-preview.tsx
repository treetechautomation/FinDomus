import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, AlertTriangle, Building2, Landmark, Calendar, DollarSign, Activity } from 'lucide-react';
import type { NormalizedBrokerImport, ImportDecisionStatus } from '@/services/import/brokers/broker-types';
import { useState } from 'react';

interface Props {
  data: NormalizedBrokerImport;
  onClear: () => void;
}

const money = (v: number) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function CorretorasPreview({ data, onClear }: Props) {
  const { metadata, positions, income, transactions, errors, warnings, metrics } = data;
  
  const [statusFilter, setStatusFilter] = useState<'ALL' | ImportDecisionStatus>('ALL');

  const decisionSummary = data.decisionSummary || {
    total: positions.length + income.length + transactions.length,
    newCount: 0,
    updateCount: 0,
    duplicateCount: 0,
    conflictCount: 0,
    ignoredCount: 0
  };

  const hasPositions = positions && positions.length > 0;
  const hasIncome = income && income.length > 0;
  const hasTransactions = transactions && transactions.length > 0;

  // Filter lists based on selected decision status filter
  const filteredPositions = positions.filter(pos => {
    if (statusFilter === 'ALL') return true;
    return pos.decision?.status === statusFilter;
  });

  const filteredIncome = income.filter(inc => {
    if (statusFilter === 'ALL') return true;
    return inc.decision?.status === statusFilter;
  });

  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter === 'ALL') return true;
    return tx.decision?.status === statusFilter;
  });

  const renderStatusBadge = (decision?: { status: string; reason: string }) => {
    if (!decision) return <Badge variant="outline">N/A</Badge>;

    let bg = 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    let label = '⚪ IGNORE';

    switch (decision.status) {
      case 'NEW':
        bg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
        label = '🟢 NEW';
        break;
      case 'UPDATE':
        bg = 'bg-sky-500/10 border-sky-500/20 text-sky-400';
        label = '🔵 UPDATE';
        break;
      case 'DUPLICATE':
        bg = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
        label = '🟡 DUPLICATE';
        break;
      case 'CONFLICT':
        bg = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
        label = '🔴 CONFLICT';
        break;
      case 'IGNORE':
        bg = 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
        label = '⚪ IGNORE';
        break;
    }

    return (
      <Badge 
        variant="outline" 
        className={`${bg} font-semibold text-[10px] cursor-help`} 
        title={decision.reason}
      >
        {label}
      </Badge>
    );
  };

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
                <Badge className="bg-white/5 text-zinc-400 border-white/10">{metadata.format}</Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Extrato Detectado: <span className="text-indigo-400">{metadata.source}</span>
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-1">
                Nome do arquivo: <span className="text-zinc-300 font-mono text-xs">{metadata.fileName}</span>
              </CardDescription>
            </div>
            <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-zinc-500 block">Confiança da Detecção</span>
                <span className="text-sm font-bold text-indigo-400">{(metadata.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-1.5 h-8 bg-indigo-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${metadata.confidence * 100}%` }} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-black/25 border border-white/5 p-4 rounded-xl">
            <div>
              <span className="text-xs text-zinc-500 block">Tipo do Documento</span>
              <span className="text-sm font-semibold text-zinc-300">{metadata.documentType}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Val. Total Custódia</span>
              <span className="text-sm font-bold text-emerald-400">{money(metrics.totalMarketValue)}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Total Proventos</span>
              <span className="text-sm font-bold text-indigo-400">{money(metrics.totalIncome)}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Volume Operado</span>
              <span className="text-sm font-bold text-zinc-300">{money(metrics.totalTransactionsAmount)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-zinc-400">
            <div>
              <span className="text-zinc-500 block block-inline">Posições Lidas:</span>{' '}
              <span className="font-semibold text-zinc-300">{metrics.positionsCount}</span>
            </div>
            <div>
              <span className="text-zinc-500 block block-inline">Operações:</span>{' '}
              <span className="font-semibold text-zinc-300">
                {metrics.buyCount} Compra / {metrics.sellCount} Venda
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block block-inline">Alertas / Erros:</span>{' '}
              <span className="font-semibold text-zinc-300">
                {metrics.warningsCount} Avisos / {metrics.errorsCount} Erros
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block block-inline">Processamento:</span>{' '}
              <span className="font-semibold text-zinc-300">{metrics.processingTimeMs} ms</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Import Decision Engine Card */}
      <Card className="border-indigo-500/20 bg-slate-950/40 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Resultado da Importação (Decision Engine)
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Comparação em tempo real com a base de dados do FinDomus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-emerald-400 font-semibold mb-1">✓ Novos</span>
              <span className="text-2xl font-black text-white">{decisionSummary.newCount}</span>
            </div>
            <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-sky-400 font-semibold mb-1">↻ Atualizações</span>
              <span className="text-2xl font-black text-white">{decisionSummary.updateCount}</span>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-yellow-400 font-semibold mb-1">⛔ Duplicados</span>
              <span className="text-2xl font-black text-white">{decisionSummary.duplicateCount}</span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-rose-400 font-semibold mb-1">⚠ Conflitos</span>
              <span className="text-2xl font-black text-white">{decisionSummary.conflictCount}</span>
            </div>
            <div className="bg-zinc-500/10 border border-zinc-500/20 p-3 rounded-xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
              <span className="text-xs text-zinc-400 font-semibold mb-1">🚫 Ignorados</span>
              <span className="text-2xl font-black text-white">{decisionSummary.ignoredCount}</span>
            </div>
          </div>

          {/* Filter Options */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-zinc-400">Filtrar registros exibidos:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Todos', value: 'ALL' },
                { label: 'Novos', value: 'NEW' },
                { label: 'Atualizações', value: 'UPDATE' },
                { label: 'Duplicados', value: 'DUPLICATE' },
                { label: 'Conflitos', value: 'CONFLICT' },
                { label: 'Ignorados', value: 'IGNORE' }
              ].map(opt => (
                <Button
                  key={opt.value}
                  variant={statusFilter === opt.value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(opt.value as any)}
                  className={`text-xs px-2.5 py-1.5 h-auto ${
                    statusFilter === opt.value 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'border-white/10 hover:bg-white/5 text-zinc-300 bg-transparent'
                  }`}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Errors / Warnings */}
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

      {/* 4. Positions Section */}
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
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Chave sugerida (dedupeKey)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-zinc-500 py-6">
                        Nenhum registro com o status selecionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPositions.map((pos, idx) => (
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
                        <TableCell>{renderStatusBadge(pos.decision)}</TableCell>
                        <TableCell className="text-[10px] font-mono text-zinc-500 truncate max-w-[250px]" title={pos.dedupeKey}>{pos.dedupeKey}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Dividends Section */}
      {hasIncome && (
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
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Chave sugerida (dedupeKey)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncome.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-zinc-500 py-6">
                        Nenhum registro com o status selecionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIncome.map((div, idx) => (
                      <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                        <TableCell className="text-zinc-300">{div.paymentDate || '-'}</TableCell>
                        <TableCell className="font-bold text-white">{div.ticker}</TableCell>
                        <TableCell className="text-zinc-300">{div.incomeType}</TableCell>
                        <TableCell className="text-right font-semibold text-emerald-400">{money(div.amount)}</TableCell>
                        <TableCell>{renderStatusBadge(div.decision)}</TableCell>
                        <TableCell className="text-[10px] font-mono text-zinc-500 truncate max-w-[250px]" title={div.dedupeKey}>{div.dedupeKey}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Transactions Section */}
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
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Chave sugerida (dedupeKey)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-zinc-500 py-6">
                        Nenhum registro com o status selecionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                        <TableCell className="text-zinc-300">{tx.date}</TableCell>
                        <TableCell className="font-bold text-white">{tx.ticker}</TableCell>
                        <TableCell>
                          <Badge className={tx.operation === 'C' || tx.operation.toUpperCase().includes('COMPRA') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}>
                            {tx.operation === 'C' ? 'COMPRA' : tx.operation === 'V' ? 'VENDA' : tx.operation}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-zinc-300">{tx.quantity}</TableCell>
                        <TableCell className="text-right text-zinc-300">{money(tx.price)}</TableCell>
                        <TableCell className="text-right font-semibold text-zinc-300">{money(tx.grossAmount)}</TableCell>
                        <TableCell>{renderStatusBadge(tx.decision)}</TableCell>
                        <TableCell className="text-[10px] font-mono text-zinc-500 truncate max-w-[250px]" title={tx.dedupeKey}>{tx.dedupeKey}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7. Action Bar */}
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
