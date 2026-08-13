"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import MobileImpostoDeRendaView from "./mobile-imposto-de-renda-view";

const taxableIncome = [
    { source: 'Salário Empresa A', value: 85000 },
    { source: 'Pró-labore Empresa B', value: 60000 },
    { source: 'Aluguel Recebido', value: 12000 },
];

const deductibleExpenses = [
    { type: 'Saúde', description: 'Plano de Saúde', value: 6000 },
    { type: 'Educação', description: 'Pós-Graduação', value: 12000 },
];

export default function ImpostoDeRendaClient() {
  const isMobile = useIsMobile();

  const viewProps = {
    taxableIncome,
    deductibleExpenses,
  };

  if (isMobile) {
    return <MobileImpostoDeRendaView {...viewProps} />;
  }

  return <MobileImpostoDeRendaView {...viewProps} />;
}
