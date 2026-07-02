'use client';

import React from 'react';
import { useAcademy } from './academy-provider';
import { AcademyCard } from './academy-card';

export function AcademyOverlay() {
  const { isActive, targetRect, pauseAcademy } = useAcademy();

  if (!isActive) return null;

  if (!targetRect) {
    return (
      <div className="fixed inset-0 z-[999] bg-zinc-950/80 backdrop-blur-[2px] flex items-center justify-center">
        <AcademyCard />
      </div>
    );
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top: targetRect.top - 8,
    left: targetRect.left - 8,
    width: targetRect.width + 16,
    height: targetRect.height + 16,
    borderRadius: '16px',
    boxShadow: '0 0 0 9999px rgba(9, 9, 11, 0.82), 0 0 25px rgba(6, 182, 212, 0.2)',
    border: '2px solid rgba(6, 182, 212, 0.5)',
    zIndex: 999,
    pointerEvents: 'none',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <>
      <div className="fixed inset-0 z-[998] bg-transparent cursor-pointer" onClick={pauseAcademy} />
      <div style={style} />
      <AcademyCard />
    </>
  );
}
