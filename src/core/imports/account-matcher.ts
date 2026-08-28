import type { Account } from '@/services/firestore/accounts';
import type { OfxAccountMetadata } from '@/core/finance/ofx-parser';

export type AccountMatchConfidence = 'high' | 'medium' | 'low' | 'none';

export type AccountMatchResult = {
  account: Account;
  confidence: AccountMatchConfidence;
  reason: string;
};

// Mapeamento comprovado pelos arquivos OFX reais disponíveis neste ambiente
// (Banco do Brasil e Nubank, ambos ACCTTYPE=CHECKING). 
// OFXs reais do Banco do Brasil comprovaram ACCTTYPE=SALARY.
const OFX_ACCTTYPE_TO_FINDOMUS_TYPE: Record<string, string> = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  SALARY: 'salary',
};

export function mapOfxAcctTypeToAccountType(acctType?: string): string | undefined {
  if (!acctType) return undefined;
  return OFX_ACCTTYPE_TO_FINDOMUS_TYPE[acctType.toUpperCase()];
}

function normalize(value?: string | null): string {
  return String(value || '').trim().toLowerCase();
}

// `candidates` deve já vir filtrado por owner/companyId compatíveis com o
// contexto de importação atual (mesma responsabilidade de `filteredAccounts`
// em importer.tsx) — esta função não conhece owner/companyId.
export function matchAccountFromOfxMetadata(
  metadata: OfxAccountMetadata,
  candidates: Account[]
): AccountMatchResult[] {
  const mappedType = mapOfxAcctTypeToAccountType(metadata.accountType);

  return candidates
    .map((account): AccountMatchResult => {
      const hasExternalIdOnBoth = Boolean(metadata.externalAccountId) && Boolean(account.externalAccountId);
      const externalIdMatches = hasExternalIdOnBoth && normalize(metadata.externalAccountId) === normalize(account.externalAccountId);
      const externalIdMismatch = hasExternalIdOnBoth && !externalIdMatches;

      const hasBankIdOnBoth = Boolean(metadata.bankId) && Boolean(account.bankId);
      const bankIdMatches = hasBankIdOnBoth && normalize(metadata.bankId) === normalize(account.bankId);
      const bankIdMismatch = hasBankIdOnBoth && !bankIdMatches;

      const hasTypeOnBoth = Boolean(mappedType) && Boolean(account.type);
      const typeMatches = hasTypeOnBoth && account.type === mappedType;
      const typeMismatch = hasTypeOnBoth && !typeMatches;

      // KNOWN MISMATCH PREVENTS HIGH/MEDIUM CONFIDENCE
      if (externalIdMismatch || bankIdMismatch || typeMismatch) {
        if (externalIdMatches) {
          return { account, confidence: 'none', reason: 'externalAccountId coincide, mas há divergência estrutural explícita (bankId ou type)' };
        }
        return { account, confidence: 'none', reason: 'divergência estrutural explícita (externalId, bankId ou type)' };
      }

      // HIGH: Identificador externo bate, e pelo menos um outro discriminador 
      // bate positivamente. (O if acima já garantiu que o terceiro discriminador, 
      // se existir, não é divergente). A evidência real BB exige type para diferenciar.
      if (externalIdMatches && bankIdMatches && typeMatches) {
        return { account, confidence: 'high', reason: 'externalAccountId, bankId e tipo coincidem' };
      }
      
      // MEDIUM: Match parcial onde pelo menos um discriminador está ausente (MISSING != MATCH)
      if (externalIdMatches && bankIdMatches) {
        return { account, confidence: 'medium', reason: 'externalAccountId e bankId coincidem, mas falta confirmar o tipo' };
      }
      if (externalIdMatches && typeMatches) {
        return { account, confidence: 'medium', reason: 'externalAccountId e tipo coincidem, mas falta confirmar o banco' };
      }
      if (externalIdMatches) {
        return { account, confidence: 'medium', reason: 'externalAccountId coincide, mas banco e tipo estão ausentes' };
      }

      // MEDIUM: mesma instituição (bankId) + mesmo tipo mapeado — não é
      // prova de que é ESTA conta entre várias da mesma instituição, mas é
      // evidência estrutural real (não textual).
      if (bankIdMatches && typeMatches) {
        return { account, confidence: 'medium', reason: 'bankId e tipo coincidem' };
      }
      if (bankIdMatches) {
        return { account, confidence: 'medium', reason: 'bankId coincide (sem divergências conhecidas)' };
      }

      // LOW: só o nome da instituição (ORG, texto livre) parece compatível
      // com o nome da conta cadastrada — não é prova estrutural, nunca
      // auto-seleciona.
      const orgLooksLikeAccountName =
        Boolean(metadata.org) && normalize(account.name).includes(normalize(metadata.org).split(' ')[0]);
      if (orgLooksLikeAccountName) {
        return { account, confidence: 'low', reason: 'nome da conta parece compatível com ORG (texto livre, não estrutural)' };
      }

      return { account, confidence: 'none', reason: 'nenhuma evidência estrutural suficiente' };
    })
    .sort((a, b) => confidenceRank(b.confidence) - confidenceRank(a.confidence));
}

function confidenceRank(c: AccountMatchConfidence): number {
  return { high: 3, medium: 2, low: 1, none: 0 }[c];
}

// Usada pela UI do importador: só HIGH/MEDIUM viram uma sugestão acionável.
// LOW é intencionalmente tratado como NONE aqui — não é prova estrutural
// (apenas nome/ORG em texto livre) e a seção 17 do design não pede exibição
// de sugestão nesses dois casos, só "manter seleção manual".
export function bestAccountMatch(
  metadata: OfxAccountMetadata,
  candidates: Account[]
): AccountMatchResult | undefined {
  const matches = matchAccountFromOfxMetadata(metadata, candidates);
  const best = matches[0];
  if (!best || best.confidence === 'none' || best.confidence === 'low') return undefined;

  // Resolve ambiguidade: se mais de uma conta tem a mesma confiança (empate no topo), 
  // revertemos para seleção manual, pois o matcher não sabe qual sugerir com segurança.
  const secondBest = matches[1];
  if (secondBest && secondBest.confidence === best.confidence) {
    return undefined;
  }

  return best;
}

// ============================================================
// ACCOUNTS.IMPORT.BALANCE.1D.1 — planejamento (sem write) do vínculo de
// identidade bancária a uma Account existente.
//
// Reaproveita este mesmo módulo (não cria um matcher paralelo). Só PLANEJA
// — nunca escreve no Firestore. Quem decide se o `patch` retornado é
// aplicado é sempre uma ação humana explícita e separada da simples seleção
// da conta (hard rule da 1D.1: selecionar conta ≠ vincular identidade).
export type BankIdentityLinkStatus =
  | 'available'
  | 'already_linked'
  | 'conflict'
  | 'insufficient_metadata';

export type BankIdentityLinkPlan = {
  status: BankIdentityLinkStatus;
  reason: string;
  // Só populado quando status === 'available'. Contém EXCLUSIVAMENTE os
  // campos de identidade — nunca balance/type/owner/companyId/name.
  patch?: {
    bankId?: string;
    externalAccountId?: string;
  };
  conflictingAccount?: Account;
};

// externalAccountId é a evidência mínima obrigatória. ORG, bankId sozinho,
// nome da conta ou filename NUNCA são suficientes para propor um vínculo
// (só para o matcher de sugestão de conta, que é um problema diferente).
function identityMatches(
  a: { bankId?: string; externalAccountId?: string; type?: string },
  b: { bankId?: string; externalAccountId?: string; type?: string }
): boolean {
  if (!a.externalAccountId || !b.externalAccountId) return false;
  if (normalize(a.externalAccountId) !== normalize(b.externalAccountId)) return false;
  
  // Se qualquer lado declara o discriminador e há divergência (seja mismatch 
  // explícito ou ausência no outro lado), a identidade não pode ser garantida com segurança.
  // MISSING != MATCH
  if ((a.bankId || b.bankId) && normalize(a.bankId) !== normalize(b.bankId)) return false;
  if ((a.type || b.type) && a.type !== b.type) return false;
  
  // Se a única informação existente for o externalId, não afirmar identityMatches.
  // Evita falsos positivos com duas contas vazias se atrelando cegamente a um OFX vazio.
  if (!a.bankId && !b.bankId && !a.type && !b.type) return false;

  return true;
}

// `otherAccounts` deve vir pré-filtrado pelo MESMO contexto de isolamento já
// usado por `matchAccountFromOfxMetadata` (owner/companyId/userId) — esta
// função não conhece esses domínios, apenas compara identidade bancária
// dentro do conjunto que o caller já isolou.
export function planBankIdentityLink(input: {
  account: Account;
  metadata: OfxAccountMetadata;
  otherAccounts: Account[];
}): BankIdentityLinkPlan {
  const { account, metadata, otherAccounts } = input;

  const mappedType = mapOfxAcctTypeToAccountType(metadata.accountType);
  const metadataWithMappedType = { ...metadata, type: mappedType };

  if (!metadata.externalAccountId) {
    return {
      status: 'insufficient_metadata',
      reason: 'externalAccountId ausente no OFX — ORG/bankId sozinhos não são evidência suficiente para propor vínculo',
    };
  }

  if (identityMatches(account, metadataWithMappedType)) {
    return {
      status: 'already_linked',
      reason: 'Esta conta já possui exatamente esta identidade bancária',
    };
  }

  const conflictingAccount = otherAccounts.find(
    (other) => other.id !== account.id && identityMatches(other, metadataWithMappedType)
  );
  if (conflictingAccount) {
    return {
      status: 'conflict',
      reason: `Esta identidade bancária já está vinculada a outra conta ("${conflictingAccount.name}")`,
      conflictingAccount,
    };
  }

  return {
    status: 'available',
    reason: 'Identidade disponível para vínculo — requer confirmação explícita do usuário',
    patch: {
      bankId: metadata.bankId,
      externalAccountId: metadata.externalAccountId,
    },
  };
}

// Mascaramento para exibição em UI — nunca mostrar o identificador bancário
// completo sem necessidade (pode ser um número de conta real).
export function maskExternalAccountId(value?: string): string {
  const raw = String(value || '');
  if (!raw) return '';
  if (raw.length <= 4) return '•'.repeat(raw.length);
  return `••••${raw.slice(-4)}`;
}
