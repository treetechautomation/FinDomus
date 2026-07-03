'use client';

import { X, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  current: number;
  max: number | null;
  upgradeMessage: string;
}

export function UpgradeModal({ open, onClose, planName, current, max, upgradeMessage }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <DialogTitle className="text-lg font-bold text-white">Limite Atingido</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 pt-2">
            {upgradeMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Plano Atual</p>
            <p className="text-lg font-bold text-white">{planName}</p>
            <p className="text-sm text-zinc-400">
              Bancos conectados: <span className="text-white font-semibold">{current} de {max ?? '∞'}</span>
            </p>
          </div>

          <Button
            asChild
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <a href="/planos" className="flex items-center justify-center gap-2">
              Mudar de Plano
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
