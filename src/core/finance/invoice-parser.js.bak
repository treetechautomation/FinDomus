function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function detectMerchant(text) {
  const clean = normalize(text);

  if (clean.includes('guanabara')) return 'Guanabara';
  if (clean.includes('uber')) return 'Uber';
  if (clean.includes('99')) return '99';
  if (clean.includes('ifood')) return 'Ifood';
  if (clean.includes('posto')) return 'Posto';
  if (clean.includes('ampla')) return 'Ampla';

  return text;
}

function detectCategory(text) {
  const clean = normalize(text);

  if (clean.includes('supermercado') || clean.includes('ifood')) return 'Alimentação';
  if (clean.includes('uber') || clean.includes('99') || clean.includes('posto')) return 'Transporte';
  if (clean.includes('energia') || clean.includes('ampla')) return 'Moradia';
  if (clean.includes('hospital') || clean.includes('saude')) return 'Saúde';
  if (clean.includes('igreja') || clean.includes('dizimo')) return 'Doações';

  return 'Outros';
}

function detectDescription(text) {
  const clean = normalize(text);

  if (clean.includes('supermercado')) return 'Supermercado';
  if (clean.includes('posto')) return 'Gasolina';
  if (clean.includes('uber') || clean.includes('99')) return 'Transporte';
  if (clean.includes('ifood')) return 'Restaurante';

  return text;
}

function parseNubankCSV(csv) {
  const lines = csv.split('\n').slice(1);

  return lines
    .map((line) => {
      const [date, title, amountStr] = line.split(',');

      if (!date || !title || !amountStr) return null;

      const amount = Number(amountStr);

      return {
        date,
        description: detectDescription(title),
        merchant: detectMerchant(title),
        category: detectCategory(title),
        amount: Math.abs(amount),
        type: amount < 0 ? 'income' : 'expense',
      };
    })
    .filter(Boolean);
}

module.exports = { parseNubankCSV };
