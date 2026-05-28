export function extractInstallment(text) {
  const t = String(text || '').toLowerCase();

  // só aceita se tiver palavra parcela
  if (!t.includes('parcela')) return null;

  const match = t.match(/(\d+)\s*\/\s*(\d+)/);

  if (!match) return null;

  return {
    number: Number(match[1]),
    total: Number(match[2])
  };
}
