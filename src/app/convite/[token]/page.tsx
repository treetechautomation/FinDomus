'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { acceptHouseholdInvite } from '@/services/firestore/households';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Users } from 'lucide-react';

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      if (!token) return;
      try {
        setLoading(true);
        const docRef = doc(db, 'household_invites', token);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) {
          setError('Convite não encontrado ou inválido.');
          return;
        }

        const data = snap.data();
        setInviteData(data);

        // Check if invite is pending and not expired
        if (data.status !== 'pending') {
          setError('Este convite já foi aceito, revogado ou recusado.');
          return;
        }

        const expiresAt = new Date(data.expiresAt).getTime();
        if (expiresAt < Date.now()) {
          setError('Este convite já expirou.');
          return;
        }

      } catch (err) {
        console.error('Error fetching invite:', err);
        setError('Ocorreu um erro ao carregar o convite.');
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!user || !token || !inviteData) return;
    try {
      setAccepting(true);
      setError(null);
      
      const success = await acceptHouseholdInvite(
        token,
        user.uid,
        user.email || '',
        user.displayName || 'Membro Convidado'
      );

      if (success) {
        setAccepted(true);
        await refreshProfile();
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError('Falha ao aceitar o convite. Verifique as condições do convite.');
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('Erro ao processar o convite.');
    } finally {
      setAccepting(false);
    }
  };

  const handleRedirectLogin = () => {
    router.push(`/login?redirect=/convite/${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-zinc-400">Validando convite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white p-4 relative overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md bg-zinc-950/80 border-zinc-800/80 backdrop-blur-md shadow-2xl relative z-10 rounded-3xl p-2">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,190,234,0.1)] mb-6">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-white uppercase">
            tree<span className="text-[#f59e0b]">Domus</span>
          </CardTitle>
          <CardDescription className="text-zinc-400 mt-2">
            Convite Familiar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 py-4">
          {error ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <h3 className="font-semibold text-lg text-white">Convite Inválido</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">{error}</p>
            </div>
          ) : accepted ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              <h3 className="font-semibold text-lg text-white">Convite Aceito!</h3>
              <p className="text-sm text-zinc-400">Você agora faz parte da família. Redirecionando...</p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-zinc-300 leading-relaxed">
                Você foi convidado por <strong className="text-white">{inviteData?.invitedBy}</strong> para fazer parte de uma família como <strong className="text-primary">{inviteData?.role === 'admin' ? 'Administrador' : 'Membro'}</strong>.
              </p>
              
              {!user ? (
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs text-zinc-400 leading-relaxed text-left space-y-2">
                  <p className="font-semibold text-zinc-300">Como aceitar o convite?</p>
                  <p>1. Faça login ou crie sua conta no treeDomus clicando no botão abaixo.</p>
                  <p>2. Ao acessar sua conta, você será redirecionado de volta para aceitar este convite.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs text-zinc-400 leading-relaxed text-left">
                  <p className="text-center font-semibold text-zinc-300">Você está logado como:</p>
                  <p className="text-center text-white font-medium mt-1">{user.email}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pb-8 pt-2 px-6">
          {error ? (
            <Button onClick={() => router.push('/')} className="w-full">
              Ir para o Início
            </Button>
          ) : accepted ? null : !user ? (
            <Button onClick={handleRedirectLogin} className="w-full flex items-center justify-center gap-2">
              Entrar ou Criar Conta
            </Button>
          ) : (
            <Button 
              onClick={handleAccept} 
              disabled={accepting} 
              className="w-full flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Aceitando...
                </>
              ) : (
                "Aceitar Convite e Acessar"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
