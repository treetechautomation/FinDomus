'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, Share2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
}

function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return isIOS() && /safari/.test(ua) && !/crios|fxios|opios/.test(ua);
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    if (isSafari()) {
      setShowIOSGuide(true);
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    showIOSGuide,
    promptInstall,
  };
}

interface PwaInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner';
}

export function PwaInstallButton({
  className,
  variant = 'header',
}: PwaInstallButtonProps) {
  const { canInstall, isInstalled, showIOSGuide, promptInstall } =
    usePwaInstall();

  if (isInstalled) return null;

  if (canInstall && variant === 'header') {
    return (
      <button
        type="button"
        onClick={promptInstall}
        aria-label="Instalar aplicativo"
        className={className}
        style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--fd-radius-sm, 8px)',
          color: 'var(--fd-color-text-secondary, #94a3b8)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <Download size={20} />
      </button>
    );
  }

  if (canInstall && variant === 'banner') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'var(--fd-color-surface-raised, #1e293b)',
          borderBottom: '1px solid var(--fd-color-border-subtle, #334155)',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            color: 'var(--fd-color-text-secondary, #94a3b8)',
          }}
        >
          Instale o FinDomus para acesso rápido
        </span>
        <button
          type="button"
          onClick={promptInstall}
          style={{
            background: '#eab308',
            color: '#0A0E14',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Instalar
        </button>
      </div>
    );
  }

  if (showIOSGuide && variant === 'header') {
    return (
      <button
        type="button"
        aria-label="Adicionar à Tela de Início"
        className={className}
        style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--fd-radius-sm, 8px)',
          color: 'var(--fd-color-text-secondary, #94a3b8)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        title="Toque em Compartilhar e depois em Adicionar à Tela de Início"
      >
        <Share2 size={20} />
      </button>
    );
  }

  if (showIOSGuide && variant === 'banner') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'var(--fd-color-surface-raised, #1e293b)',
          borderBottom: '1px solid var(--fd-color-border-subtle, #334155)',
        }}
      >
        <Share2
          size={14}
          style={{ color: 'var(--fd-color-text-secondary, #94a3b8)' }}
        />
        <span
          style={{
            fontSize: '13px',
            color: 'var(--fd-color-text-secondary, #94a3b8)',
          }}
        >
          Compartilhar &rarr; Adicionar à Tela de Início
        </span>
      </div>
    );
  }

  return null;
}
