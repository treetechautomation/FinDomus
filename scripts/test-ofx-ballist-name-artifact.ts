// OFX.4 — FASE B.2 — ETAPA 5/6/7 — NAME técnico (artefato de BALLIST) não
// pode contaminar a classificação. Reproduz o caso real #36 (RENDIMENTO
// LIQUIDO / Pix de Laila Tavares Cimador) usando um OFX sintético com a
// mesma estrutura do arquivo real de julho/2026 (BALLIST com o mesmo NAME
// que vazou para dentro de uma STMTTRN).
//
// Não depende de Firestore/rede: usa resolveOfxTransaction() + um
// ClassificationContext sintético, chamando o parser real.
//
// Execução: npx tsx scripts/test-ofx-ballist-name-artifact.ts

import { resolveOfxTransaction } from '../src/core/finance/ofx-parser';
import type { ClassificationContext } from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';

const categories: Category[] = [
  { name: 'Recebimentos', keywords: ['transferencia recebida'], categoryType: 'income', createdAt: '' } as Category,
  { name: 'CDB / Renda Fixa', keywords: ['rendimento', 'cdb', 'renda fixa'], categoryType: 'investment', createdAt: '' } as Category,
];

const context: ClassificationContext = { categories, accountIdentities: [], learningMap: new Map() };

function extractBallistLabelsForTest(fullText: string): Set<string> {
  // Réplica local só para montar o fixture do teste (a função real é
  // interna a ofx-parser.ts e já é exercida via resolveOfxTransaction, que
  // não a expõe — este teste passa o Set já pronto, simulando o que
  // parseOFX() faria a partir do arquivo completo).
  const labels = new Set<string>();
  const m = fullText.match(/<BALLIST>([\s\S]*?)<\/BALLIST>/i);
  if (!m) return labels;
  for (const nm of m[1].matchAll(/<NAME>([^<\r\n]*)/gi)) {
    labels.add(nm[1].trim().toLowerCase());
  }
  return labels;
}

const SYNTHETIC_OFX = `
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20260731000000[-3:BRT]</DTPOSTED>
<TRNAMT>1000.00</TRNAMT>
<FITID>test-36</FITID>
<NAME>RENDIMENTO LIQUIDO</NAME>
<MEMO>Transferência recebida pelo Pix - LAILA TAVARES CIMADOR - BANCO INTER (0077) Agência: 1 Conta: 25699915-5</MEMO>
</STMTTRN>
<BALLIST>
<BAL>
<NAME>RENDIMENTO LIQUIDO</NAME>
<DESC>RENDIMENTO LIQUIDO NO PERIODO</DESC>
<BALTYPE>NUMBER</BALTYPE>
<VALUE>0.00</VALUE>
</BAL>
</BALLIST>
`;

let failures = 0;
console.log('OFX.4 FASE B.2 — NAME TÉCNICO (ARTEFATO DE BALLIST) NÃO CONTAMINA A CLASSIFICAÇÃO\n');

const block = SYNTHETIC_OFX.split('<STMTTRN>')[1].split('</STMTTRN>')[0];
const ballistLabels = extractBallistLabelsForTest(SYNTHETIC_OFX);
console.log('BALLIST labels extraídos:', Array.from(ballistLabels));

// --- Caso A: SEM o Set de labels (comportamento antigo) — NAME contamina, cai em investment ---
{
  const result = resolveOfxTransaction(block, context);
  console.log(`\nSEM ballistLabels: type=${result?.type} category="${result?.category}" (esperado neste modo: ainda contaminado, category="CDB / Renda Fixa")`);
  const pass = result?.category === 'CDB / Renda Fixa';
  if (pass) {
    console.log('PASS — confirma que, sem o Set, o comportamento antigo (contaminado) se mantém — prova que a correção é o Set, não um efeito colateral de outra mudança');
  } else {
    failures++;
    console.error(`FAIL — esperado category="CDB / Renda Fixa" sem ballistLabels, veio "${result?.category}"`);
  }
}

// --- Caso B: COM o Set de labels (comportamento novo) — NAME artefato ignorado na classificação ---
{
  const result = resolveOfxTransaction(block, context, ballistLabels);
  console.log(`\nCOM ballistLabels: type=${result?.type} category="${result?.category}" description="${result?.description}"`);

  const typeOk = result?.type === 'income';
  const categoryOk = result?.category !== 'CDB / Renda Fixa';
  const descriptionUnchanged = result?.description === 'RENDIMENTO LIQUIDO'; // política de exibição preservada

  if (typeOk) {
    console.log('PASS — type continua income (TRNTYPE=CREDIT, sem mudança de natureza financeira)');
  } else {
    failures++;
    console.error(`FAIL — type esperado income, veio ${result?.type}`);
  }

  if (categoryOk) {
    console.log(`PASS — category deixou de ser "CDB / Renda Fixa" por artefato de NAME: agora "${result?.category}"`);
  } else {
    failures++;
    console.error('FAIL — category continua "CDB / Renda Fixa" mesmo com ballistLabels');
  }

  if (descriptionUnchanged) {
    console.log('PASS — descrição exibida ao usuário preservada (política NAME>MEMO para exibição não foi alterada)');
  } else {
    failures++;
    console.error(`FAIL — descrição exibida mudou inesperadamente: "${result?.description}"`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures} caso(s) falharam.`);
  process.exit(1);
} else {
  console.log('Todos os casos passaram.');
}
