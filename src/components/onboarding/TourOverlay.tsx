'use client';

import React from 'react';

interface TourOverlayProps {
  targetRect: DOMRect | null;
  onSkip: () => void;
}

export function TourOverlay({ targetRect, onSkip }: TourOverlayProps) {
  if (!targetRect) {
    // Caso não haja elemento focado (ex: passos de boas-vindas / centro)
    return (
      <div 
        className="fixed inset-0 z-[999] bg-zinc-950/75 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onSkip}
      />
    );
  }

  // Estilo inline para suportar transição de foco fluida
  const spotlightStyle: React.CSSProperties = {
    position: 'fixed',
    top: targetRect.top - 8,
    left: targetRect.left - 8,
    width: targetRect.width + 16,
    height: targetRect.height + 16,
    borderRadius: '16px',
    boxShadow: '0 0 0 9999px rgba(9, 9, 11, 0.75), 0 0 20px rgba(6, 182, 212, 0.15)',
    border: '2px solid rgba(6, 182, 212, 0.45)',
    zIndex: 999,
    pointerEvents: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <>
      {/* Capturador de cliques para fechar/pular se clicar fora */}
      <div 
        className="fixed inset-0 z-[998] bg-transparent cursor-pointer"
        onClick={onSkip}
      />
      {/* Holofote destacado sobre o elemento ativo */}
      <div style={spotlightStyle} />
    </>
  );
}
