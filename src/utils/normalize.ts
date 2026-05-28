export function normalizeCategoryName(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function formatCategoryName(value: string) {
  const clean = normalizeCategoryName(value);
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
