import { Suspense } from 'react';
import AssinaturasClient from './assinaturas-client';

export default function AssinaturasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p>Carregando assinaturas e despesas fixas...</p>
          </div>
        </div>
      }
    >
      <AssinaturasClient />
    </Suspense>
  );
}
