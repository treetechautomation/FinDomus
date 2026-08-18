import { calculateMatchScore, findBestMatches, ReconciliationCandidate } from '../src/core/finance/transfer-reconciliation-engine';

const tests = [];

function assertScore(name: string, source: any, target: any, expectedMatch: boolean) {
  const score = calculateMatchScore(source as ReconciliationCandidate, target as ReconciliationCandidate);
  const matched = score >= 50; // threshold for 'medium' and visible
  const pass = matched === expectedMatch;
  tests.push({ name, pass, score, expectedMatch, matched });
}

// T1 +100 ↔ +100 mesmo dia => NO MATCH
assertScore('T1: Same sign (+)', 
  { id: '1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF' },
  { id: '2', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF' },
  false
);

// T2 -100 ↔ -100 mesmo dia => NO MATCH
assertScore('T2: Same sign (-)', 
  { id: '1', amount: 100, originalAmount: -100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF' },
  { id: '2', amount: 100, originalAmount: -100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF' },
  false
);

// T3 +100 ↔ -100 mesmo dia sem evidência => NO MATCH (<50)
assertScore('T3: Opposite sign, no evidence', 
  { id: '1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Random 1', type: 'transfer', owner: 'PF' },
  { id: '2', amount: 100, originalAmount: -100, date: '2026-08-01', description: 'Random 2', type: 'transfer', owner: 'PF' },
  false
);

// T4 +100 ↔ -100 mesmo dia identity comprovada => MATCH
assertScore('T4: Opposite sign, identity proven', 
  { id: '1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF', hasIdentityMatch: true },
  { id: '2', amount: 100, originalAmount: -100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF' },
  true
);

// T5 +100 ↔ -100 1 dia identity comprovada => MATCH possível
assertScore('T5: Opposite sign, 1 day diff, identity', 
  { id: '1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF', hasIdentityMatch: true },
  { id: '2', amount: 100, originalAmount: -100, date: '2026-08-02', description: 'Transf', type: 'transfer', owner: 'PF' },
  true
);

// T6 +100 ↔ -100 mesmo dia investment => NO MATCH
assertScore('T6: Investment exclusion', 
  { id: '1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF', hasIdentityMatch: true },
  { id: '2', amount: 100, originalAmount: -100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF', categoryType: 'investment' },
  false
);

// T7 Marina +20.000, Aplicação RDB -20.000 => NO MATCH
assertScore('T7: Marina vs RDB', 
  { id: '1', amount: 20000, originalAmount: 20000, date: '2026-08-01', description: 'Marina', type: 'transfer', owner: 'PF' },
  { id: '2', amount: 20000, originalAmount: -20000, date: '2026-08-01', description: 'Aplicação RDB', type: 'transfer', owner: 'PF', categoryType: 'investment' },
  false
);

// T8 +100 ↔ -99,99 => NO MATCH
assertScore('T8: Value mismatch', 
  { id: '1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF', hasIdentityMatch: true },
  { id: '2', amount: 99.99, originalAmount: -99.99, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF' },
  false
);

// T9 Pix restaurante +/- sem identity => NO MATCH
assertScore('T9: Pix keyword only', 
  { id: '1', amount: 50, originalAmount: 50, date: '2026-08-01', description: 'Pix Restaurante', type: 'transfer', owner: 'PF' },
  { id: '2', amount: 50, originalAmount: -50, date: '2026-08-01', description: 'Pix Restaurante', type: 'transfer', owner: 'PF' },
  false
);

// T10 mesmo valor/data, descriptions diferentes => NO MATCH
assertScore('T10: Different desc, no identity', 
  { id: '1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'TED Jose', type: 'transfer', owner: 'PF' },
  { id: '2', amount: 100, originalAmount: -100, date: '2026-08-01', description: 'TED Maria', type: 'transfer', owner: 'PF' },
  false
);

// T14 PF ↔ PJ incompatíveis => NO MATCH
assertScore('T14: PF vs PJ', 
  { id: '1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF', hasIdentityMatch: true },
  { id: '2', amount: 100, originalAmount: -100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PJ' },
  false
);

console.table(tests);

const allPass = tests.every(t => t.pass);
if (!allPass) {
  console.error("Alguns testes falharam!");
} else {
  console.log("Todos os testes T1-T10, T14 passaram!");
}

// T12 mesmas transações em ordem invertida => MESMO RESULTADO
const c1 = { id: 'c1', amount: 100, originalAmount: 100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF', hasIdentityMatch: true };
const c2 = { id: 'c2', amount: 100, originalAmount: -100, date: '2026-08-02', description: 'Transf', type: 'transfer', owner: 'PF' };
const c3 = { id: 'c3', amount: 100, originalAmount: -100, date: '2026-08-01', description: 'Transf', type: 'transfer', owner: 'PF' };

const res1 = findBestMatches(c1 as any, [c2, c3] as any);
const res2 = findBestMatches(c1 as any, [c3, c2] as any);

if (res1[0].targetId === res2[0].targetId) {
  console.log("T12: PASS (Determinism)");
} else {
  console.error("T12: FAIL", res1, res2);
}

