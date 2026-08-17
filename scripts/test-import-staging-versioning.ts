// OFX.5 — FASE B — ETAPA 15-19 — Testes do versionamento/invalidação da
// preview de importação persistida em sessionStorage. Polyfill mínimo de
// sessionStorage em Node (não depende de navegador/Firestore/rede).
//
// Execução: npx tsx scripts/test-import-staging-versioning.ts

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
  get length() { return this.store.size; }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
}

(global as any).window = { sessionStorage: new MemoryStorage() };

import {
  IMPORT_PREVIEW_SCHEMA_VERSION,
  STAGING_KEY,
  hashFileContent,
  loadStaging,
  saveStaging,
  clearStaging,
  isDifferentFile,
  type ImportStagingData,
} from '../src/core/imports/import-staging';

function baseStaging(overrides: Partial<ImportStagingData> = {}): ImportStagingData {
  return {
    version: IMPORT_PREVIEW_SCHEMA_VERSION,
    step: 'review',
    transactions: [{ description: 'x', amount: 10, type: 'income', category: 'Outros' }],
    owner: 'PF',
    competenceMonth: '2026-07',
    importName: 'Extrato julho',
    companyId: '',
    fileName: 'extrato.ofx',
    fileSize: 12345,
    fileFingerprint: hashFileContent('conteudo do arquivo de teste'),
    savedAt: new Date().toISOString(),
    ...overrides,
  };
}

let failures = 0;
function check(label: string, cond: boolean, detail?: string) {
  if (cond) console.log(`PASS — ${label}`);
  else { failures++; console.error(`FAIL — ${label}${detail ? ' — ' + detail : ''}`); }
}

console.log('OFX.5 FASE B — TESTES DE VERSIONAMENTO DA PREVIEW EM sessionStorage\n');

// A) versão atual → restaura
{
  (window as any).sessionStorage.clear();
  saveStaging(baseStaging());
  const restored = loadStaging();
  check('A) versão atual → restaura', restored !== null && restored.fileName === 'extrato.ofx');
}

// B) versão antiga → descarta
{
  (window as any).sessionStorage.clear();
  saveStaging(baseStaging({ version: IMPORT_PREVIEW_SCHEMA_VERSION - 1 }));
  const restored = loadStaging();
  check('B) versão antiga → descarta', restored === null);
  check('B) versão antiga → também remove do storage', (window as any).sessionStorage.getItem(STAGING_KEY) === null);
}

// C) payload inválido → descarta
{
  (window as any).sessionStorage.clear();
  (window as any).sessionStorage.setItem(STAGING_KEY, '{ isto nao é json valido');
  const restored = loadStaging();
  check('C) payload inválido (JSON corrompido) → descarta', restored === null);
}

// D) arquivo diferente → descarta (via isDifferentFile, usado no onDrop real)
{
  const staging = baseStaging({ fileName: 'extrato-julho.ofx', fileSize: 12345 });
  const mesmoArquivo = { name: 'extrato-julho.ofx', size: 12345 };
  const arquivoDiferenteNome = { name: 'extrato-agosto.ofx', size: 12345 };
  const arquivoDiferenteTamanho = { name: 'extrato-julho.ofx', size: 99999 };
  check('D) mesmo nome+tamanho → NÃO é arquivo diferente', isDifferentFile(staging, mesmoArquivo) === false);
  check('D) nome diferente → é arquivo diferente', isDifferentFile(staging, arquivoDiferenteNome) === true);
  check('D) tamanho diferente → é arquivo diferente', isDifferentFile(staging, arquivoDiferenteTamanho) === true);
}

// E) expirado → descarta
{
  (window as any).sessionStorage.clear();
  const umaHoraEMeiaAtras = new Date(Date.now() - 90 * 60 * 1000).toISOString();
  saveStaging(baseStaging({ savedAt: umaHoraEMeiaAtras }));
  const restored = loadStaging();
  check('E) salvo há 90min (TTL=60min) → descarta por expiração', restored === null);
}

// F) preview atual válida (dentro do TTL) → preserva
{
  (window as any).sessionStorage.clear();
  const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  saveStaging(baseStaging({ savedAt: dezMinutosAtras }));
  const restored = loadStaging();
  check('F) salvo há 10min (dentro do TTL) → preserva', restored !== null);
}

// G) descarte manual → remove
{
  (window as any).sessionStorage.clear();
  saveStaging(baseStaging());
  check('G) antes do clearStaging(): existe no storage', (window as any).sessionStorage.getItem(STAGING_KEY) !== null);
  clearStaging();
  check('G) depois do clearStaging(): removido do storage', (window as any).sessionStorage.getItem(STAGING_KEY) === null);
  check('G) depois do clearStaging(): loadStaging() retorna null', loadStaging() === null);
}

// Bônus: fingerprint determinístico e sensível a diferenças de conteúdo
{
  const h1 = hashFileContent('mesmo conteudo');
  const h2 = hashFileContent('mesmo conteudo');
  const h3 = hashFileContent('conteudo diferente');
  check('hashFileContent é determinístico', h1 === h2);
  check('hashFileContent distingue conteúdos diferentes', h1 !== h3);
}

console.log('');
if (failures > 0) {
  console.error(`${failures} caso(s) falharam.`);
  process.exit(1);
} else {
  console.log('Todos os casos passaram.');
}
