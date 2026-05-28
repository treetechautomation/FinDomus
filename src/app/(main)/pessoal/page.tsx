import { Suspense } from 'react';
import PessoalClient from './pessoal-client';

export default function PessoalPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-muted-foreground">
          Carregando financeiro pessoal...
        </div>
      }
    >
      <PessoalClient />
    </Suspense>
  );
}
