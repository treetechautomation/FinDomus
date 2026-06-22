import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/core/finance/formatters";
import type { PFDRE } from "@/core/finance/dre-engine";
import { TrendingUp, Wallet, Landmark, ArrowUpRight, Award } from "lucide-react";

interface PfDreCardProps {
  dre: PFDRE;
}

export function PfDreCard({ dre }: PfDreCardProps) {
  return (
    <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.02)] transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[#00beea]" />
              DRE Pessoal (PF)
            </CardTitle>
            <CardDescription className="text-zinc-500">Fluxo de competência pessoal em tempo real.</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Taxa de Acumulação</span>
            <div className="flex items-center gap-1.5 mt-1 bg-cyan-950/40 border border-cyan-800/30 text-[#00beea] font-bold px-3 py-1 rounded-full text-sm shadow-[0_0_15px_rgba(0,190,234,0.15)] animate-pulse">
              <Award className="w-4 h-4" />
              {formatPercent(dre.taxaAcumulacao)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Receita Section */}
        <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
            <span className="font-semibold text-sm">Receita Total</span>
          </div>
          <span className="text-lg font-bold text-emerald-400">{formatCurrency(dre.receitaTotal)}</span>
        </div>

        {/* Despesas Breakdown */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/30">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Despesas Operacionais</h4>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Essenciais</span>
            <span className="font-medium text-white">{formatCurrency(dre.essenciais)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Qualidade de Vida</span>
            <span className="font-medium text-white">{formatCurrency(dre.qualidadeVida)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Estilo de Vida</span>
            <span className="font-medium text-white">{formatCurrency(dre.estiloVida)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Educação</span>
            <span className="font-medium text-white">{formatCurrency(dre.educacao)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Saúde</span>
            <span className="font-medium text-white">{formatCurrency(dre.saude)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Outros</span>
            <span className="font-medium text-white">{formatCurrency(dre.outros)}</span>
          </div>

          <div className="border-t border-zinc-800/80 pt-2.5 flex justify-between items-center text-sm font-bold mt-2">
            <span className="text-zinc-300">Total Despesas Operacionais</span>
            <span className="text-red-400">{formatCurrency(dre.despesasOperacionais)}</span>
          </div>
        </div>

        {/* Construção Patrimonial */}
        <div className="p-4 rounded-2xl bg-amber-950/10 border border-amber-500/10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-amber-400">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold text-sm">Construção Patrimonial (Aportes/Investimentos)</span>
          </div>
          <span className="text-lg font-bold text-amber-400">{formatCurrency(dre.construcaoPatrimonial)}</span>
        </div>

        {/* Saldo Restante */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/40 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5 text-zinc-400" />
            <span className="font-semibold text-sm">Saldo Restante</span>
          </div>
          <span className={`text-lg font-bold ${dre.saldoRestante >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(dre.saldoRestante)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
