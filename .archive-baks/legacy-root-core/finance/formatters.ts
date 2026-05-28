export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

export function formatPercent(value: number) {
  return `${Number(value || 0).toFixed(2)}%`;
}
