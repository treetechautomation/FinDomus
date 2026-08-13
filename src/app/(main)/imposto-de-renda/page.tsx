import { Suspense } from 'react';
import ImpostoDeRendaClient from './imposto-de-renda-client';

export default function ImpostoDeRendaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p>Carregando Imposto de Renda...</p>
          </div>
        </div>
      }
    >
      <ImpostoDeRendaClient />
    </Suspense>
  );
}
