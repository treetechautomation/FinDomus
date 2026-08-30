export function isCreditCardInvoiceText(rawText: string): boolean {
  if (!rawText) return false;
  const norm = rawText.toLowerCase();
  
  const hasInvoice = norm.includes("fatura");
  const hasSecondaryMarker = norm.includes("vencimento") || 
                             norm.includes("pagamento mínimo") || 
                             norm.includes("pagamento minimo") || 
                             norm.includes("limite");
  
  return hasInvoice && hasSecondaryMarker;
}

export function isInvoicePaymentDescription(description: string): boolean {
  if (!description) return false;
  const descLower = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return descLower.includes('pagamento recebido') ||
         descLower.includes('pagamento em') ||
         descLower.includes('pagamento de fatura');
}
