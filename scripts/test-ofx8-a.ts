import { calculateMatchScore, findBestMatches } from '../src/core/finance/transfer-reconciliation-engine';

const MARINA = {
  id: 'm1',
  amount: 20000,
  date: '2026-07-06T00:00:00Z',
  description: 'Transferência recebida pelo Pix - MARINA DE SOUZA BURGOS - BCO DO BRASIL S.A.',
  type: 'transfer',
  owner: 'PF'
};

const RDB = {
  id: 'm2',
  amount: -20000,
  date: '2026-07-06T00:00:00Z',
  description: 'Aplicação RDB',
  type: 'transfer',
  owner: 'PF'
};

console.log('--- SCENARIO: MARINA vs RDB ---');
console.log('Score Marina x RDB:', calculateMatchScore(MARINA, RDB));


const CASO_A_1 = { ...MARINA, description: 'Descricao A' };
const CASO_A_2 = { ...RDB, description: 'Descricao B completamente diferente' };
console.log('\n--- CASO A: Mesmos valor/data, descricoes diferentes ---');
console.log('Score:', calculateMatchScore(CASO_A_1, CASO_A_2));


const CASO_B_1 = { ...MARINA, description: 'Pix recebido' };
const CASO_B_2 = { ...RDB, description: 'Investimento CDB' };
console.log('\n--- CASO B: Pix vs Investimento ---');
console.log('Score:', calculateMatchScore(CASO_B_1, CASO_B_2));


const CASO_C_1 = { ...MARINA, description: 'Transferência própria Nubank' };
const CASO_C_2 = { ...RDB, description: 'Transferência própria Bradesco' };
console.log('\n--- CASO C: Transferência própria comprovada (pela string, keywords) ---');
console.log('Score:', calculateMatchScore(CASO_C_1, CASO_C_2));


const CASO_D_1 = { ...MARINA, date: '2026-07-06T00:00:00Z' };
const CASO_D_2 = { ...RDB, date: '2026-07-07T00:00:00Z' };
console.log('\n--- CASO D: 1 dia de diferença ---');
console.log('Score:', calculateMatchScore(CASO_D_1, CASO_D_2));


const CASO_E_1 = { ...MARINA, amount: 20000 };
const CASO_E_2 = { ...RDB, amount: -19999.99 };
console.log('\n--- CASO E: Valor 1 centavo de diferença ---');
console.log('Score:', calculateMatchScore(CASO_E_1, CASO_E_2));

const CASO_F_1 = { ...MARINA, type: 'income' };
const CASO_F_2 = { ...RDB, type: 'expense' };
console.log('\n--- CASO F: Merchant/payment (nao transfer) ---');
console.log('Score:', calculateMatchScore(CASO_F_1, CASO_F_2));

console.log('\n--- MULTIPLE CANDIDATES TEST ---');
const c1 = { id: 'A', amount: 20000, date: '2026-07-06', description: 'Pix A', type: 'transfer', owner: 'PF' };
const c2 = { id: 'B', amount: 20000, date: '2026-07-06', description: 'Pix B', type: 'transfer', owner: 'PF' };
const c3 = { id: 'C', amount: -20000, date: '2026-07-06', description: 'Saida C', type: 'transfer', owner: 'PF' };
const c4 = { id: 'D', amount: -20000, date: '2026-07-06', description: 'Saida D', type: 'transfer', owner: 'PF' };

const candidates = [c1, c2, c3, c4];
console.log('Matches for A:', findBestMatches(c1, candidates));

