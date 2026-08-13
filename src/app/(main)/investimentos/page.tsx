import { Suspense } from 'react';
import InvestimentosClient from './investimentos-client';

export default function InvestimentosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p>Carregando investimentos...</p>
          </div>
        </div>
      }
    >
      <InvestimentosClient />
    </Suspense>
  );
}
