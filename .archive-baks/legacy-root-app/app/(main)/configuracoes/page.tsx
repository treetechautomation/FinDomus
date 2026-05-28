import { ConfiguracoesClient } from '@/components/configuracoes/configuracoes-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ConfiguracoesPage() {
  return <ConfiguracoesClient />;
}
