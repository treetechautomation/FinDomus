export function classifyDRE(category?: string) {
  const value = String(category || '');

  if (
    [
      'Impostos',
      'Taxas',
      'Tributos',
      'DAS',
      'Simples Nacional',
      'INSS',
      'FGTS',
      'ISS',
      'IRPJ',
      'CSLL',
      'DAS (Simples Nacional)',
    ].includes(value)
  ) return 'IMPOSTO';

  if (
    [
      'Aluguel',
      'Energia',
      'Internet',
      'Marketing',
      'Software',
      'Fornecedores',
      'Operacional',
      'Juros / Multas',
      'Ferramentas / Software',
      'Internet / Telefonia',
      'Equipamentos',
      'Marketing / Ads',
      'Despesas Administrativas',
      'Taxas Bancárias',
      'Taxas de Plataforma',
    ].includes(value)
  ) return 'DESPESA';

  if (
    [
      'Salários',
      'Freelancers',
      'Benefícios',
    ].includes(value)
  ) return 'PESSOAS';

  if (value === 'Pró-labore') {
    return 'PRO_LABORE';
  }

  return 'OUTROS';
}

export function buildDRE(transactions: any[]) {
  let receitaBruta = 0;
  let impostos = 0;
  let despesas = 0;
  let pessoas = 0;
  let proLabore = 0;
  let outros = 0;

  for (const transaction of transactions) {
    const amount = Math.abs(Number(transaction.amount || 0));
    const dreType = classifyDRE(transaction.category);

    if (transaction.type === 'income') {
      receitaBruta += amount;
      continue;
    }

    if (dreType === 'IMPOSTO') impostos += amount;
    else if (dreType === 'DESPESA') despesas += amount;
    else if (dreType === 'PESSOAS') pessoas += amount;
    else if (dreType === 'PRO_LABORE') proLabore += amount;
    else outros += amount;
  }

  const receitaLiquida = receitaBruta - impostos;
  const lucroBruto = receitaLiquida - despesas;
  const lucroOperacional = lucroBruto - pessoas;
  const lucroLiquido = lucroOperacional - proLabore - outros;

  return {
    receitaBruta,
    impostos,
    receitaLiquida,
    despesas,
    pessoas,
    proLabore,
    outros,
    lucroBruto,
    lucroOperacional,
    lucroLiquido,
  };
}
