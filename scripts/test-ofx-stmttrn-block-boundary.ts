// OFX.5 — FASE B — ETAPA 4/6 — Prova (pré e pós-patch) do bug de fronteira de
// bloco em parseOFX(): text.split('<STMTTRN>').slice(1) corta cada bloco só
// na tag de ABERTURA seguinte, nunca na de FECHAMENTO </STMTTRN> — então a
// ÚLTIMA transação de um arquivo absorve tudo que vem depois dela
// (</BANKTRANLIST>, <LEDGERBAL>, <BALLIST>...) até o fim do arquivo.
//
// Fixture sintética mínima, sem depender do arquivo real, cobrindo:
// primeira / intermediária / última transação, conteúdo após </STMTTRN>,
// ausência de NAME, MEMO legítimo — e também o arquivo real de julho/2026.
//
// Não depende de Firestore/rede.
//
// Execução: npx tsx scripts/test-ofx-stmttrn-block-boundary.ts

import { readFileSync } from 'fs';
import { resolveOfxTransaction, extractStmttrnBlocks } from '../src/core/finance/ofx-parser';
import type { ClassificationContext } from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';

const categories: Category[] = [
  { name: 'CDB / Renda Fixa', keywords: ['rendimento', 'cdb', 'renda fixa'], categoryType: 'investment', createdAt: '' } as Category,
];
const context: ClassificationContext = { categories, accountIdentities: [], learningMap: new Map() };

const SYNTHETIC_OFX = `<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20260701000000[-3:BRT]</DTPOSTED>
<TRNAMT>10.00</TRNAMT>
<FITID>fit-001</FITID>
<MEMO>Primeira transacao - MEMO legitimo</MEMO>
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>20260702000000[-3:BRT]</DTPOSTED>
<TRNAMT>-25.00</TRNAMT>
<FITID>fit-002</FITID>
<MEMO>Transacao intermediaria - MEMO legitimo</MEMO>
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20260731000000[-3:BRT]</DTPOSTED>
<TRNAMT>1000.00</TRNAMT>
<FITID>fit-003</FITID>
<MEMO>Ultima transacao - Pix de FULANO DE TAL</MEMO>
</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>1003.21</BALAMT>
<DTASOF>20260731000000[-3:BRT]</DTASOF>
</LEDGERBAL>
<BALLIST>
<BAL>
<NAME>RENDIMENTO LIQUIDO</NAME>
<DESC>RENDIMENTO LIQUIDO NO PERIODO</DESC>
<BALTYPE>NUMBER</BALTYPE>
<VALUE>0.00</VALUE>
</BAL>
</BALLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

let failures = 0;
function check(label: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`PASS — ${label}`);
  } else {
    failures++;
    console.error(`FAIL — ${label}${detail ? ' — ' + detail : ''}`);
  }
}

console.log('OFX.5 FASE B — FRONTEIRA DE BLOCO STMTTRN (fixture sintética)\n');

const rawBlocks = extractStmttrnBlocks(SYNTHETIC_OFX);
console.log(`blocos extraídos: ${rawBlocks.length} (esperado: 3)\n`);

// Bloco cru da última transação — mede diretamente se há vazamento de conteúdo
// posterior (</BANKTRANLIST>, BALLIST) dentro do texto que resolveOfxTransaction recebe.
const lastRawBlock = rawBlocks[2];
const ballistContamination = lastRawBlock.includes('<BALLIST>') || lastRawBlock.includes('RENDIMENTO LIQUIDO');
console.log(`BALLIST_CONTAMINATION (bloco cru da última transação contém conteúdo pós-</STMTTRN>?): ${ballistContamination}`);

const first = resolveOfxTransaction(rawBlocks[0], context);
const middle = resolveOfxTransaction(rawBlocks[1], context);
const last = resolveOfxTransaction(rawBlocks[2], context);

check('primeira transação — amount correto (10)', first?.amount === 10);
check('primeira transação — description não contaminada', first?.description === 'Primeira transacao - MEMO legitimo', first?.description);
check('intermediária — amount correto (25)', middle?.amount === 25);
check('intermediária — description não contaminada', middle?.description === 'Transacao intermediaria - MEMO legitimo', middle?.description);
check('última transação — amount correto (1000, não confundido com BALTYPE/VALUE do BALLIST)', last?.amount === 1000, `amount=${last?.amount}`);
check('última transação — description é o MEMO real, NÃO "RENDIMENTO LIQUIDO" do BALLIST', last?.description === 'Ultima transacao - Pix de FULANO DE TAL', `description="${last?.description}"`);
check('última transação — category não é investment por contaminação do BALLIST', last?.category !== 'CDB / Renda Fixa', `category="${last?.category}"`);

console.log('\n=== ARQUIVO REAL: NU_289663372_01JUL2026_31JUL2026.ofx ===');
const realText = readFileSync('/var/www/findomus/.tmp/ofx/NU_289663372_01JUL2026_31JUL2026.ofx', 'utf-8');
const realBlocks = extractStmttrnBlocks(realText);
check('36 blocos extraídos do arquivo real', realBlocks.length === 36, `${realBlocks.length}`);

const real36Raw = realBlocks[35];
const real36BallistLeak = real36Raw.includes('<BALLIST>');
console.log(`bloco cru real da #36 contém <BALLIST>? ${real36BallistLeak} (${real36Raw.length} caracteres)`);

const real36 = resolveOfxTransaction(real36Raw, context);
check('#36 real — amount = 1000', real36?.amount === 1000, `amount=${real36?.amount}`);
check('#36 real — description contém a contraparte real (Laila), não "RENDIMENTO LIQUIDO"', !!real36?.description?.includes('LAILA'), `description="${real36?.description}"`);
check('#36 real — category não é investment por contaminação', real36?.category !== 'CDB / Renda Fixa', `category="${real36?.category}"`);

console.log('');
if (failures > 0) {
  console.error(`${failures} caso(s) falharam.`);
  process.exit(1);
} else {
  console.log('Todos os casos passaram.');
}
