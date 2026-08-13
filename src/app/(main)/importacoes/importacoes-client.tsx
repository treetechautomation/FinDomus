"use client";

import { useIsMobile } from '@/hooks/use-mobile';
import MobileImportacoesView from './mobile-importacoes-view';

export default function ImportacoesClient() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileImportacoesView />;
  }

  return <MobileImportacoesView />;
}
