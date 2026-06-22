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

export type PFDRECategory =
  | "receita"
  | "essenciais"
  | "qualidadeVida"
  | "estiloVida"
  | "educacao"
  | "saude"
  | "construcaoPatrimonial"
  | "outros";

export type PFDRE = {
  receitaTotal: number;
  essenciais: number;
  qualidadeVida: number;
  estiloVida: number;
  educacao: number;
  saude: number;
  construcaoPatrimonial: number;
  outros: number;
  despesasOperacionais: number;
  saldoRestante: number;
  taxaAcumulacao: number;
};

export function classifyPFDRECategory(category?: string): PFDRECategory {
  if (!category) return "outros";
  const val = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  if (/salario|pro[- ]?labore|freelance|reembolso|rendimento|dividendo/.test(val)) {
    return "receita";
  }
  if (/investimento|aporte|tesouro|cdb|renda\s*fixa|acoes|fii|fundo\s*imobiliario|cripto|consorcio|amortizacao|financiamento|emprestimo|divida/.test(val)) {
    return "construcaoPatrimonial";
  }
  if (/saude|plano\s*de\s*saude|consulta|exame|odontologia|farmacia|medicamento|suplemento|otica|oculos|lente/.test(val)) {
    return "saude";
  }
  if (/educacao|faculdade|escola|curso|mentoria|workshop|livro|material\s*escolar|certificacao|conselho|congresso/.test(val)) {
    return "educacao";
  }
  if (/restaurante|delivery|cafe|lanche|lazer|cinema|teatro|games|show|viagem|hotel|passagem|beleza|estetica|vestuario|streaming|assinatura|presente|doacao|dizimo/.test(val)) {
    return "estiloVida";
  }
  if (/seguro|pet|academia|esporte|terapia|bem\s*estar/.test(val)) {
    return "qualidadeVida";
  }
  if (/aluguel|condominio|iptu|energia|agua|gas|internet|telefone|supermercado|limpeza|transporte|combustivel|pedagio|ipva|tarifa|iof/.test(val)) {
    return "essenciais";
  }

  return "outros";
}

export function buildPFDRE(
  transactions: Array<{ type?: string; amount?: number; category?: string; owner?: string }>
): PFDRE {
  let receitaTotal = 0;
  let essenciais = 0;
  let qualidadeVida = 0;
  let estiloVida = 0;
  let educacao = 0;
  let saude = 0;
  let construcaoPatrimonial = 0;
  let outros = 0;

  const pfTransactions = transactions.filter(
    (t) => t.owner === "PF" || t.owner === undefined || t.owner === null || t.owner === ""
  );

  for (const t of pfTransactions) {
    if (t.type === "transfer") {
      continue;
    }
    const amount = Number(t.amount || 0);
    if (t.type === "income") {
      receitaTotal += amount;
    } else {
      const absAmount = Math.abs(amount);
      const cat = classifyPFDRECategory(t.category);
      if (cat === "essenciais") essenciais += absAmount;
      else if (cat === "qualidadeVida") qualidadeVida += absAmount;
      else if (cat === "estiloVida") estiloVida += absAmount;
      else if (cat === "educacao") educacao += absAmount;
      else if (cat === "saude") saude += absAmount;
      else if (cat === "construcaoPatrimonial") construcaoPatrimonial += absAmount;
      else outros += absAmount;
    }
  }

  const despesasOperacionais =
    essenciais + qualidadeVida + estiloVida + educacao + saude + outros;

  const saldoRestante = receitaTotal - despesasOperacionais - construcaoPatrimonial;

  const taxaAcumulacao =
    receitaTotal > 0 ? ((construcaoPatrimonial + saldoRestante) / receitaTotal) * 100 : 0;

  return {
    receitaTotal,
    essenciais,
    qualidadeVida,
    estiloVida,
    educacao,
    saude,
    construcaoPatrimonial,
    outros,
    despesasOperacionais,
    saldoRestante,
    taxaAcumulacao,
  };
}

