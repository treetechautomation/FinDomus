import { Suspense } from 'react';
import EmpresasClient from './empresas-client';

export default function EmpresasPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-muted-foreground">
          Carregando empresas...
        </div>
      }
    >
      <EmpresasClient />
    </Suspense>
  );
}
