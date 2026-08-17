// OFX.5 — Fase B. Lógica pura de persistência da preview de importação em
// sessionStorage — extraída de importer.tsx para permitir teste automatizado
// sem precisar renderizar o componente React.
//
// Impede que uma preview calculada por uma versão antiga do pipeline de
// classificação (parser OFX, transaction-classifier) seja apresentada como
// se fosse o resultado atual, e que a preview de um arquivo apareça como se
// fosse de outro.

export const STAGING_KEY = 'findomus:import_staging';
export const STAGING_TTL_MS = 60 * 60 * 1000; // 1 hora

// Incrementar sempre que uma mudança no pipeline de classificação alterar o
// resultado esperado de uma preview já calculada.
export const IMPORT_PREVIEW_SCHEMA_VERSION = 3;

export type ImportStagingData = {
  version: number;
  step: 'config' | 'review';
  transactions: any[];
  overrides?: Record<string, { category?: string; type?: string; ignored?: boolean; pendingLearning?: boolean }>;
  owner: 'PF' | 'PJ';
  competenceMonth: string;
  importName: string;
  companyId: string;
  fileName: string;
  fileSize: number;
  fileFingerprint: string;
  savedAt: string;
};

// Hash não-criptográfico (FNV-1a) só para identificar o conteúdo do arquivo
// sem persistir o conteúdo bruto no sessionStorage.
export function hashFileContent(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function loadStaging(): ImportStagingData | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STAGING_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<ImportStagingData>;

    if (data.version !== IMPORT_PREVIEW_SCHEMA_VERSION) {
      storage.removeItem(STAGING_KEY);
      return null;
    }
    if (!data.savedAt || Date.now() - new Date(data.savedAt).getTime() > STAGING_TTL_MS) {
      storage.removeItem(STAGING_KEY);
      return null;
    }
    return data as ImportStagingData;
  } catch {
    return null;
  }
}

export function saveStaging(data: ImportStagingData) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STAGING_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded — fail silently */
  }
}

export function clearStaging() {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STAGING_KEY);
  } catch {
    /* ignore */
  }
}

// Verdadeiro quando um arquivo recém-selecionado NÃO é o mesmo arquivo que
// gerou a preview restaurada (nome ou tamanho diferentes) — nesse caso a
// preview antiga não pode continuar sendo oferecida como se fosse deste
// novo arquivo.
export function isDifferentFile(
  staging: Pick<ImportStagingData, 'fileName' | 'fileSize'>,
  candidate: { name: string; size: number }
): boolean {
  return candidate.name !== staging.fileName || candidate.size !== staging.fileSize;
}
