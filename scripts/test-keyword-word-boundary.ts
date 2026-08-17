// OFX.4 — FASE B — ETAPA 3 — Testes de fronteira de palavra em keywordMatches().
// Reproduz o bug real (FARMA GOLD casando com a keyword "gol" da categoria Viagem)
// e prova a correção: correspondência por palavra/token completo nos dois lados,
// preservando keywords compostas (frases com espaço) e sem quebrar casos legítimos.
//
// Não depende de Firestore/rede.
//
// Execução: npx tsx scripts/test-keyword-word-boundary.ts

import { keywordMatches } from '../src/core/finance/transaction-classifier';

type Case = {
  label: string;
  description: string;
  keyword: string;
  expectMatch: boolean;
};

const cases: Case[] = [
  // --- Caso real do OFX.4 Fase A: FARMA GOLD não pode casar com "gol" ---
  {
    label: 'BUG REAL — "gol" NÃO deve casar "FARMA GOLD"',
    description: 'Compra no débito - FARMA GOLD',
    keyword: 'gol',
    expectMatch: false,
  },
  {
    label: '"gol" continua casando a companhia aérea GOL isolada',
    description: 'Compra no débito GOL LINHAS AEREAS',
    keyword: 'gol',
    expectMatch: true,
  },
  {
    label: '"gol" continua casando no início de frase',
    description: 'GOL passagem aérea',
    keyword: 'gol',
    expectMatch: true,
  },

  // --- Negativos obrigatórios do briefing ---
  {
    label: '"bar" NÃO deve casar palavra maior (BARBEARIA)',
    description: 'Corte de cabelo BARBEARIA DO ZE',
    keyword: 'bar',
    expectMatch: false,
  },
  {
    label: '"bar" continua casando como palavra isolada',
    description: 'BAR DO ZE - happy hour',
    keyword: 'bar',
    expectMatch: true,
  },
  {
    label: '"uber" continua casando UBER (maiúsculas, sem acento)',
    description: 'UBER TRIP SAO PAULO',
    keyword: 'uber',
    expectMatch: true,
  },

  // --- Expressões compostas válidas continuam funcionando ---
  {
    label: 'keyword composta "ted mesma titularidade" casa a frase completa',
    description: 'TED mesma titularidade recebida',
    keyword: 'ted mesma titularidade',
    expectMatch: true,
  },
  {
    label: 'keyword composta NÃO casa quando falta parte da frase',
    description: 'TED recebida de terceiro',
    keyword: 'ted mesma titularidade',
    expectMatch: false,
  },
  {
    label: 'keyword composta "passagem aerea" casa dentro de frase maior',
    description: 'Compra de passagem aerea LATAM',
    keyword: 'passagem aerea',
    expectMatch: true,
  },

  // --- Outras colisões reais encontradas na auditoria do catálogo (ETAPA 3) ---
  {
    label: '"cri" (CDB/Renda Fixa) NÃO deve casar "criptomoedas"',
    description: 'Compra de criptomoedas na corretora',
    keyword: 'cri',
    expectMatch: false,
  },
  {
    label: '"medica" (Consultas médicas) NÃO deve casar "medicamentos"',
    description: 'Compra de medicamentos na farmácia',
    keyword: 'medica',
    expectMatch: false,
  },
  {
    label: '"gas" (Gás) NÃO deve casar "gasolina"',
    description: 'Abastecimento gasolina no posto',
    keyword: 'gas',
    expectMatch: false,
  },
  {
    label: '"amil" (Plano de saúde) NÃO deve casar "panamil" (mercado)',
    description: 'Compra no PANAMIL supermercado',
    keyword: 'amil',
    expectMatch: false,
  },

  // --- Acentuação / normalização seguem funcionando ---
  {
    label: 'acentuação é ignorada na comparação',
    description: 'Transferência recebida pelo Pix',
    keyword: 'transferencia',
    expectMatch: true,
  },
  {
    label: 'keyword de 2 caracteres exige fronteira dos dois lados (mantido)',
    description: 'IOF sobre operação',
    keyword: 'bb',
    expectMatch: false,
  },
];

let failures = 0;

console.log('OFX.4 FASE B — TESTE DE FRONTEIRA DE PALAVRA (keywordMatches)\n');

for (const c of cases) {
  const result = keywordMatches(c.description, c.keyword);
  const pass = result === c.expectMatch;
  if (pass) {
    console.log(`PASS — ${c.label}`);
  } else {
    failures++;
    console.error(`FAIL — ${c.label}`);
    console.error(`       desc="${c.description}" keyword="${c.keyword}" esperado=${c.expectMatch} obtido=${result}`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures}/${cases.length} casos falharam.`);
  process.exit(1);
} else {
  console.log(`${cases.length}/${cases.length} casos passaram.`);
}
