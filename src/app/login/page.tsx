'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Landmark, ShieldCheck, LineChart, BrainCircuit, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Se já estiver logado, manda para home silenciosamente
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoadingLogin(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirecionamento é feito pelo useEffect assim que o useAuth reage
    } catch (error: any) {
      console.error('Erro de login:', error);
      toast({
        variant: 'destructive',
        title: 'Falha na autenticação',
        description: 'Verifique seu e-mail e senha e tente novamente.',
      });
      setLoadingLogin(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Redirecionamento é feito pelo useEffect
    } catch (error: any) {
      console.error('Erro de login com Google:', error);
      toast({
        variant: 'destructive',
        title: 'Falha no login com Google',
        description: 'Não foi possível concluir a autenticação com sua conta Google.',
      });
      setLoadingGoogle(false);
    }
  };

  if (loading || user) {
    // Retorna tela em branco ou loading enquanto checa a sessão
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-950 via-zinc-950 to-black text-zinc-50 selection:bg-amber-500/30 font-sans">
      
      {/* Coluna Visual (Esquerda em Desktop, Oculta em Mobile) */}
      <div className="relative hidden w-[55%] overflow-hidden border-r border-zinc-800/50 bg-[#030712] lg:flex lg:flex-col">
        {/* Base premium background logic */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Deep petrol/black base */}
          <div className="absolute inset-0 bg-[#030712]" />
          
          {/* Subtle petrol blue glow */}
          <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-blue-900/15 blur-[120px]" />
          
          {/* Golden glow behind candles */}
          <div className="absolute right-[5%] top-[15%] h-[40%] w-[40%] rounded-full bg-amber-500/10 blur-[100px]" />

          {/* Institutional Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Market lines / Curve */}
          <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 800 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#854d0e" stopOpacity="0" />
                <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#facc15" stopOpacity="1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Soft market lines */}
            <path d="M0,600 C200,580 300,650 500,550 S700,450 800,300" fill="none" stroke="#1e293b" strokeWidth="1" />
            <path d="M0,500 C150,480 250,520 450,420 S650,320 800,150" fill="none" stroke="#1e293b" strokeWidth="1" />
            
            {/* Main ascending golden curve */}
            <path 
              d="M0,700 C150,680 250,620 400,520 S600,320 750,220" 
              fill="none" 
              stroke="url(#curveGradient)" 
              strokeWidth="2" 
              filter="url(#glow)"
            />
            
            {/* Arrow head */}
            <circle cx="750" cy="220" r="3" fill="#fef08a" filter="url(#glow)" />
          </svg>
        </div>

        {/* Logo Section */}
        <div className="relative z-10 p-12 lg:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-zinc-900/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Landmark className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">FinDomus</span>
          </div>
        </div>

        {/* Hero Content + Candles Row */}
        <div className="relative z-10 flex flex-1 flex-col px-12 lg:px-14">
          <div className="flex w-full items-start justify-between mt-12">
            <div className="max-w-[480px]">
              <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-white xl:text-[52px]">
                Sua inteligência <br />
                financeira <span className="text-amber-400">unificada.</span>
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-zinc-400 font-light">
                O ecossistema definitivo para gerenciar patrimônio, <br />
                automatizar conciliações e escalar seus investimentos com <br />
                precisão institucional.
              </p>
            </div>

            {/* Golden Candles Visual */}
            <div className="hidden xl:flex items-end gap-5 h-40 pt-10">
              {/* Candle 1 */}
              <div className="relative flex flex-col items-center w-6">
                <div className="w-[1px] h-20 bg-emerald-500/40 absolute -top-4" />
                <div className="w-full h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-sm z-10" />
              </div>
              {/* Candle 2 (Golden focus) */}
              <div className="relative flex flex-col items-center w-6 -translate-y-4">
                <div className="w-[1px] h-32 bg-amber-400/60 absolute -top-8 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <div className="w-full h-20 bg-amber-500/40 border border-amber-400/50 rounded-sm z-10 shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
              </div>
              {/* Candle 3 */}
              <div className="relative flex flex-col items-center w-6 translate-y-4">
                <div className="w-[1px] h-24 bg-emerald-500/40 absolute -top-6" />
                <div className="w-full h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-sm z-10" />
              </div>
              {/* Candle 4 */}
              <div className="relative flex flex-col items-center w-6 -translate-y-2">
                <div className="w-[1px] h-16 bg-emerald-500/40 absolute -top-2" />
                <div className="w-full h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-sm z-10" />
              </div>
            </div>
          </div>

          {/* Bottom Feature Cards Grid */}
          <div className="mt-auto pb-16 grid grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-transform hover:scale-105">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-lg tracking-tight">Segurança</h3>
              <p className="text-sm text-zinc-500 leading-snug font-light">
                Isolamento e criptografia <br /> de ponta a ponta.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-transform hover:scale-105">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-lg tracking-tight">Controle financeiro</h3>
              <p className="text-sm text-zinc-500 leading-snug font-light">
                Fluxo de caixa preditivo e <br /> DRE em tempo real.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-transform hover:scale-105">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-lg tracking-tight">Investimentos</h3>
              <p className="text-sm text-zinc-500 leading-snug font-light">
                Sincronização global de <br /> carteiras e métricas.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-transform hover:scale-105">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-lg tracking-tight">IA Financeira</h3>
              <p className="text-sm text-zinc-500 leading-snug font-light">
                Automação de extratos e <br /> categorização inteligente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna de Login */}
      <div className="relative flex w-full flex-col justify-center items-center px-6 lg:w-[45%] lg:px-12 xl:px-24 bg-transparent z-20">
        
        {/* Efeito Glow subtil atrás do form no mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-900/20 rounded-full blur-[100px] pointer-events-none lg:hidden" />

        <div className="w-full max-w-[420px] relative z-10">
          
          {/* Mobile Header (Visível apenas em telas menores) */}
          <div className="mb-10 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Landmark className="h-8 w-8 text-amber-400" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white uppercase tracking-widest mt-2">FinDomus</span>
          </div>

          {/* Login Block Wrapper with Premium Glow */}
          <div className="relative w-full group/login">
            {/* Outer Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/30 via-yellow-500/10 to-amber-900/30 rounded-3xl blur opacity-70 transition-opacity duration-500 group-hover/login:opacity-100" />
            
            {/* Glass Container */}
            <div className="relative w-full rounded-3xl border border-amber-400/20 bg-black/75 backdrop-blur-2xl p-8 shadow-[0_0_80px_-12px_rgba(245,158,11,0.22)] before:absolute before:inset-0 before:rounded-3xl before:border before:border-amber-400/10 before:pointer-events-none before:shadow-[inset_0_0_40px_rgba(245,158,11,0.05)]">
              
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                  Acesso Restrito
                </h2>
                <p className="mt-2 text-sm text-zinc-500 font-light tracking-wide">
                  Autenticação institucional necessária.
                </p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@instituicao.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 bg-zinc-950/90 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:border-amber-400/40 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-300 text-xs font-medium uppercase tracking-wider">Senha</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 bg-zinc-950/90 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:border-amber-400/40 transition-all duration-300"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="h-12 w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all rounded-xl mt-4" 
                  disabled={loadingLogin || loadingGoogle}
                >
                  {loadingLogin ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  ENTRAR NA PLATAFORMA
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800/80" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-zinc-950 px-4 text-zinc-500 font-medium">
                    SSO Enterprise
                  </span>
                </div>
              </div>

              <Button
                type="button"
                className="h-12 w-full bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 transition-all rounded-xl"
                onClick={handleGoogleLogin}
                disabled={loadingLogin || loadingGoogle}
              >
                {loadingGoogle ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="mr-3 h-5 w-5 opacity-90" aria-hidden="true">
                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                  </svg>
                )}
                <span className="font-medium text-sm">Autenticar com Google Workspace</span>
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-600 uppercase tracking-widest font-light">
            Sistema Seguro • Criptografia Ativa
          </p>
        </div>
      </div>

    </div>
  );
}

