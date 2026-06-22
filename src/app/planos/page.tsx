'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Landmark, Users, Shield, ArrowLeft, BrainCircuit } from 'lucide-react';

export default function PlanosPage() {
  const whatsappBaseUrl = 'https://wa.me/5521995643718';

  const getWhatsappLink = (plano: string) => {
    const text = `Olá, quero assinar o FinDomus no plano ${plano}.`;
    return `${whatsappBaseUrl}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-950 via-zinc-950 to-black text-zinc-50 selection:bg-amber-500/30 font-sans relative overflow-x-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-blue-950/20 blur-[130px] pointer-events-none" />
      <div className="absolute right-[10%] top-[20%] h-[40%] w-[45%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-6 md:py-8 flex items-center justify-between border-b border-zinc-900/60">
        <a href="/login" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/20 bg-zinc-900/50 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.08)]">
            <img src="/logo.png" alt="treeDomus Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase tracking-widest">tree<span className="text-amber-500">Domus</span></span>
        </a>
        <a 
          href="/login" 
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Login
        </a>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 md:py-16 flex flex-col items-center">
        <div className="text-center max-w-[720px] mb-14">
          <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-3 py-1 text-xs uppercase tracking-widest rounded-full mb-4 animate-pulse">
            Oferta Especial de Lançamento
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            Escolha o plano perfeito para a sua <span className="text-amber-400">independência financeira.</span>
          </h1>
          <p className="mt-5 text-zinc-400 text-base md:text-lg font-light leading-relaxed">
            Campanha promocional válida por tempo limitado para os <strong className="text-white font-medium">100 primeiros assinantes</strong>. Garanta seu desconto vitalício hoje mesmo.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid w-full gap-8 md:grid-cols-3 items-stretch mb-14">
          
          {/* Plano Individual */}
          <div className="relative flex flex-col group/card">
            <div className="absolute -inset-px bg-zinc-900 border border-zinc-800 rounded-3xl transition-all duration-300" />
            <Card className="relative flex flex-col h-full bg-zinc-950/70 border-zinc-900 rounded-3xl p-2 z-10">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-white">Individual</CardTitle>
                <CardDescription className="text-zinc-500 text-xs mt-1">Para quem busca controle financeiro solo unificado.</CardDescription>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-zinc-500 text-sm line-through">R$ 39,90</span>
                  <span className="text-3xl font-extrabold text-white">R$ 29,90</span>
                  <span className="text-zinc-500 text-sm">/ mês</span>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">25% OFF vitalício</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-1 space-y-4">
                <div className="border-t border-zinc-900 pt-4" />
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span><strong>1 usuário</strong> exclusivo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Controle financeiro PF e PJ</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Contas e cartões ilimitados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Importação de extratos (OFX, PDF, CSV)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Relatórios e DRE automáticos</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto">
                <Button 
                  asChild
                  className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold rounded-xl"
                >
                  <a href={getWhatsappLink('Individual')} target="_blank" rel="noopener noreferrer">
                    SOLICITAR ACESSO
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Plano Família (Mais Popular) */}
          <div className="relative flex flex-col group/card scale-100 md:scale-105">
            {/* Outer golden glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/30 to-yellow-600/10 rounded-3xl blur opacity-70" />
            <Card className="relative flex flex-col h-full bg-black/95 border-amber-500/30 rounded-3xl p-2 z-10 before:absolute before:inset-0 before:rounded-3xl before:border before:border-amber-400/10 before:pointer-events-none">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 border border-amber-400/40 text-black font-extrabold px-3.5 py-1 text-[10px] tracking-widest uppercase rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  Mais Popular
                </Badge>
              </div>
              <CardHeader className="p-6 mt-2">
                <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
                  Família
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs mt-1">Ideal para centralizar as finanças do casal ou da casa.</CardDescription>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-zinc-500 text-sm line-through">R$ 69,90</span>
                  <span className="text-3xl font-extrabold text-white">R$ 49,90</span>
                  <span className="text-zinc-500 text-sm">/ mês</span>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">29% OFF vitalício</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-1 space-y-4">
                <div className="border-t border-zinc-900 pt-4" />
                <ul className="space-y-3 text-sm text-zinc-300">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Compartilhado com até <strong>5 membros</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Contas e cartões consolidados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Planejamento orçamentário compartilhado</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Conciliação automática de transferências</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Ambiente multi-usuários sem compartilhar senha</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto">
                <Button 
                  asChild
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  <a href={getWhatsappLink('Família')} target="_blank" rel="noopener noreferrer">
                    SOLICITAR ACESSO
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Plano Família Premium */}
          <div className="relative flex flex-col group/card">
            <div className="absolute -inset-px bg-zinc-900 border border-zinc-800 rounded-3xl transition-all duration-300" />
            <Card className="relative flex flex-col h-full bg-zinc-950/70 border-zinc-900 rounded-3xl p-2 z-10">
              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-white">Família Premium</CardTitle>
                <CardDescription className="text-zinc-500 text-xs mt-1">Controle patrimonial robusto e assessoria integrada por IA.</CardDescription>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-zinc-500 text-sm line-through">R$ 99,90</span>
                  <span className="text-3xl font-extrabold text-white">R$ 69,90</span>
                  <span className="text-zinc-500 text-sm">/ mês</span>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">30% OFF vitalício</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-1 space-y-4">
                <div className="border-t border-zinc-900 pt-4" />
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Compartilhado com até <strong>10 membros</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Multitenancy PF/PJ completo com consolidação</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Módulo de IA Financeira avançada (Genkit)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Acompanhamento detalhado de investimentos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Suporte VIP e SLA de 4 horas</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto">
                <Button 
                  asChild
                  className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold rounded-xl"
                >
                  <a href={getWhatsappLink('Família Premium')} target="_blank" rel="noopener noreferrer">
                    SOLICITAR ACESSO
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>

        </div>

        {/* Feature Explanatory Block */}
        <div className="w-full max-w-[850px] rounded-3xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md p-8 text-center space-y-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Como funciona o acesso compartilhado?</h2>
          <p className="text-sm text-zinc-400 leading-relaxed font-light max-w-[720px] mx-auto">
            Cada membro possui seu próprio login e senha, mas todos acessam o mesmo ambiente financeiro familiar, de acordo com as permissões definidas. Assim, não é necessário compartilhar senha.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 text-center text-xs text-zinc-600 uppercase tracking-widest border-t border-zinc-950">
        © {new Date().getFullYear()} treeDomus • Desenvolvido com segurança absoluta
      </footer>

    </div>
  );
}
