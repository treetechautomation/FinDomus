'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, FileText } from 'lucide-react';
import { updateUserProfile } from '@/services/firestore/users';

export default function TermosPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Redireciona se o usuário não estiver logado ou já tiver aceitado os termos
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (profile && profile.acceptedTerms === true) {
        router.replace('/');
      }
    }
  }, [user, profile, loading, router]);

  const handleScroll = () => {
    const el = textContainerRef.current;
    if (!el) return;

    // Se a barra de rolagem não estiver presente (conteúdo menor que a div), marca como lido imediatamente
    const hasScrollbar = el.scrollHeight > el.clientHeight;
    if (!hasScrollbar) {
      setHasScrolledToBottom(true);
      return;
    }

    const isBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 10;
    if (isBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!user || !hasScrolledToBottom || !acceptedCheckbox) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        acceptedTerms: true,
        acceptedTermsVersion: '1.0',
        acceptedTermsAt: new Date().toISOString(),
        acceptedTermsUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      });

      await refreshProfile();
      router.push('/');
    } catch (error) {
      console.error('Erro ao salvar aceite dos termos:', error);
    } finally {
      setSaving(false);
    }
  };

  // Executa uma vez no carregamento para checar se o conteúdo cabe sem scroll
  useEffect(() => {
    const el = textContainerRef.current;
    if (el) {
      handleScroll();
    }
  }, [loading]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-zinc-950 to-black text-zinc-50 p-6 selection:bg-amber-500/30 font-sans relative overflow-hidden">
      
      {/* Background glow effects matching login style */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[680px] relative z-10">
        
        {/* Card Wrapper with Premium border */}
        <div className="relative w-full group/terms">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/25 via-yellow-500/5 to-amber-900/25 rounded-3xl blur opacity-75 transition-opacity" />
          
          {/* Glass Container */}
          <div className="relative w-full rounded-3xl border border-amber-400/20 bg-black/80 backdrop-blur-2xl p-8 shadow-[0_0_80px_-12px_rgba(245,158,11,0.2)]">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-zinc-900/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <ShieldCheck className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white uppercase">Termos de Uso e Responsabilidade</h1>
                <p className="text-xs text-zinc-500 font-light tracking-wide mt-0.5">FinDomus — Versão 1.0 (Oficial)</p>
              </div>
            </div>

            {/* Scrollable Terms Content */}
            <div 
              ref={textContainerRef}
              onScroll={handleScroll}
              className="w-full h-80 rounded-2xl bg-zinc-950/95 border border-zinc-900 p-5 overflow-y-auto text-zinc-400 text-sm leading-relaxed space-y-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              <h3 className="font-bold text-zinc-200">1. Aceite dos Termos</h3>
              <p>
                Ao acessar e utilizar a plataforma FinDomus, você declara ser maior de idade e concorda expressamente com os presentes Termos de Uso e Responsabilidade. Se você não concordar com qualquer termo aqui descrito, deve interromper imediatamente o uso da plataforma.
              </p>

              <h3 className="font-bold text-zinc-200">2. Escopo e Propósito</h3>
              <p>
                O FinDomus é uma ferramenta de gestão financeira familiar e empresarial (SaaS) destinada a auxiliar na consolidação, classificação e planejamento financeiro pessoal (PF) e empresarial (PJ). A ferramenta fornece análises estatísticas e categorização automatizada de transações (via IA).
              </p>

              <h3 className="font-bold text-zinc-200">3. Isenção de Responsabilidade sobre Decisões Financeiras</h3>
              <p>
                O FinDomus **não** é uma instituição financeira, corretora de valores ou consultoria de investimentos homologada pela CVM. Quaisquer estimativas, relatórios, resumos orçamentários, dados de fechamento de caixa ou simulações geradas pela plataforma (incluindo sugestões fornecidas pela inteligência artificial) são puramente informativos e didáticos. Você é o único e exclusivo responsável por todas as decisões de gastos, contratação de passivos, movimentações bancárias e alocação de investimentos que realizar.
              </p>

              <h3 className="font-bold text-zinc-200">4. Segurança de Dados e Multitenancy</h3>
              <p>
                O FinDomus garante o isolamento seguro dos seus dados financeiros baseando-se em chaves de controle exclusivas por usuário e/ou por família (households). Você se compromete a manter a confidencialidade de suas credenciais de acesso ao Firebase Auth e a notificar imediatamente a equipe de suporte caso note qualquer atividade suspeita.
              </p>

              <h3 className="font-bold text-zinc-200">5. Regras de Classificação e Fechamento</h3>
              <p>
                A plataforma realiza classificações automáticas e fechamentos contábeis a partir dos lançamentos informados pelo usuário. Conforme as diretrizes internas rígidas, os saldos financeiros de contas bancárias **nunca** serão sobrescritos ou consolidados de forma automatizada pelo fechamento mensal. Cada conta mantém seu saldo individual reconciliado, cabendo ao usuário a verificação de integridade dos dados importados via OFX, PDF ou CSV.
              </p>

              <h3 className="font-bold text-zinc-200">6. Atualizações dos Termos</h3>
              <p>
                Estes termos podem ser atualizados periodicamente para refletir melhorias no sistema ou novos requisitos legais. Em caso de atualizações estruturais relevantes na versão dos termos (ex: v2.0), um novo fluxo de consentimento poderá ser solicitado no momento do login.
              </p>
            </div>

            {/* Verification & Scroll Indicators */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-light">
                Role o texto até o final para habilitar o aceite.
              </span>
              {hasScrolledToBottom ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> Leitura Confirmada
                </span>
              ) : (
                <span className="text-amber-500/70 font-medium animate-pulse">
                  Pendente de Leitura
                </span>
              )}
            </div>

            {/* Checkbox Agreement */}
            <div className="mt-6 flex items-start gap-3">
              <input
                id="agreement"
                type="checkbox"
                checked={acceptedCheckbox}
                disabled={!hasScrolledToBottom}
                onChange={(e) => setAcceptedCheckbox(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/40 focus:ring-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              />
              <label 
                htmlFor="agreement" 
                className={`text-sm select-none leading-snug cursor-pointer ${
                  hasScrolledToBottom ? 'text-zinc-300' : 'text-zinc-600 cursor-not-allowed'
                }`}
              >
                Eu li, compreendi e aceito integralmente os Termos de Uso e Responsabilidade descritos acima para acesso ao ecossistema FinDomus.
              </label>
            </div>

            {/* Accept Button */}
            <Button
              onClick={handleAccept}
              disabled={saving || !hasScrolledToBottom || !acceptedCheckbox}
              className="mt-6 h-12 w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> SALVANDO ACEITE...
                </>
              ) : (
                'ACEITAR E CONTINUAR'
              )}
            </Button>

          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600 uppercase tracking-widest font-light">
          Segurança Ativa • Consentimento Expresso v1.0
        </p>

      </div>
    </div>
  );
}
