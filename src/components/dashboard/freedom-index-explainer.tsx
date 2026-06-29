import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Shield, TrendingUp, Users, Percent, Landmark, ShieldCheck, Award, HelpCircle } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function FreedomIndexExplainer({ isOpen, onClose }: Props) {
  const pillars = [
    {
      name: 'Quitação de Dívidas (25%)',
      desc: 'Mede o progresso de amortização de passivos ativos. Estar 100% livre de dívidas garante a nota máxima.',
      icon: Shield,
      color: 'text-amber-400',
    },
    {
      name: 'Comprometimento de Renda (20%)',
      desc: 'O peso das parcelas mensais de dívidas contra sua receita total. O ideal recomendado é manter abaixo de 15%.',
      icon: Percent,
      color: 'text-emerald-400',
    },
    {
      name: 'Reserva de Emergência (15%)',
      desc: 'Mapeia se você possui o equivalente a 6 meses de despesas de custo de vida guardados em saldo de liquidez diária.',
      icon: ShieldCheck,
      color: 'text-blue-400',
    },
    {
      name: 'Patrimônio Líquido (15%)',
      desc: 'Soma total dos seus ativos (contas e investimentos) menos seus passivos, comparados com a meta de 1 ano de receita total.',
      icon: Landmark,
      color: 'text-purple-400',
    },
    {
      name: 'Taxa de Poupança (10%)',
      desc: 'A porcentagem da sua receita guardada ou investida no mês corrente. A meta de acumulação ideal é de 30% ou mais.',
      icon: TrendingUp,
      color: 'text-cyan-400',
    },
    {
      name: 'Renda Passiva (10%)',
      desc: 'Calcula o quanto o rendimento estimado de seus investimentos (0.6% a.m.) cobre do seu custo de vida mensal.',
      icon: Award,
      color: 'text-yellow-400',
    },
    {
      name: 'Diversificação (5%)',
      desc: 'Mede a distribuição do seu portfólio. Pontuação máxima exige pelo menos 5 ativos cadastrados na carteira.',
      icon: Users,
      color: 'text-orange-400',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl text-white shadow-2xl overflow-y-auto max-h-[85vh]">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
            Entendendo o Índice de Liberdade
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 leading-relaxed">
            Uma nota de 0 a 100 que calcula cientificamente a sua proximidade da independência financeira real baseado em 7 pilares estratégicos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Níveis */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Faixas de Nível</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="flex items-center gap-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-900">
                <span className="text-base">🌱</span>
                <div>
                  <span className="block font-bold text-zinc-200">Sobrevivência</span>
                  <span className="text-[10px] text-zinc-500">0 a 19 pontos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-900">
                <span className="text-base">🌿</span>
                <div>
                  <span className="block font-bold text-zinc-200">Organização</span>
                  <span className="text-[10px] text-zinc-500">20 a 39 pontos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-900">
                <span className="text-base">🪴</span>
                <div>
                  <span className="block font-bold text-zinc-200">Estabilidade</span>
                  <span className="text-[10px] text-zinc-500">40 a 59 pontos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-900">
                <span className="text-base">🌳</span>
                <div>
                  <span className="block font-bold text-zinc-200">Construção</span>
                  <span className="text-[10px] text-zinc-500">60 a 79 pontos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-900">
                <span className="text-base">🌲</span>
                <div>
                  <span className="block font-bold text-zinc-200">Crescimento</span>
                  <span className="text-[10px] text-zinc-500">80 a 94 pontos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-900">
                <span className="text-base">🏡</span>
                <div>
                  <span className="block font-bold text-zinc-200">Liberdade</span>
                  <span className="text-[10px] text-zinc-500">95+ pontos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pilares */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Os 7 Pilares de Cálculo</h4>
            <div className="space-y-2.5">
              {pillars.map((p, idx) => (
                <div key={idx} className="flex gap-3.5 items-start p-3 bg-zinc-900/20 border border-zinc-900/60 rounded-2xl">
                  <div className={`p-2.5 rounded-xl bg-zinc-950 border border-zinc-900/65 ${p.color}`}>
                    <p.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-sm font-extrabold text-white block">{p.name}</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
