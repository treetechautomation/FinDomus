import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCategories, type Category } from '@/services/firestore/categories';
import {
  getLearnedCategory,
  buildLearningFingerprint,
} from '@/core/finance/category-learning-engine';
import {
  getAccountIdentities,
  type AccountIdentity,
} from '@/services/firestore/account-identities';

export type ParsedTransaction = {
  date: string;
  description: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
};

export function normalizeText(text: string) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeForMatch(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeRegExp(text: string): string {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function keywordMatches(description: string, keyword: string): boolean {
  const normDesc = normalizeForMatch(description);
  const normKw = normalizeForMatch(keyword);

  if (!normKw) return false;

  const escapedKw = escapeRegExp(normKw);

  if (normKw.length <= 2) {
    const regex = new RegExp(`\\b${escapedKw}\\b`, 'i');
    return regex.test(normDesc);
  }

  const regex = new RegExp(`\\b${escapedKw}|${escapedKw}\\b`, 'i');
  return regex.test(normDesc);
}


function findCategoryByNames(candidates: string[], availableCategories: { name: string; keywords?: string[] }[]): string | null {
  for (const candidate of candidates) {
    const normCand = normalizeText(candidate);
    const matched = availableCategories.find(
      (cat) => normalizeText(cat.name) === normCand
    );
    if (matched) return matched.name;
  }
  for (const candidate of candidates) {
    const normCand = normalizeText(candidate);
    const matched = availableCategories.find(
      (cat) => normalizeText(cat.name).includes(normCand)
    );
    if (matched) return matched.name;
  }
  return null;
}

export function inferCategoryFromDescription(
  rawDescription: string,
  type: 'income' | 'expense' | 'transfer',
  availableCategories: { name: string; keywords?: string[] }[] = []
): { category: string; type?: 'income' | 'expense' | 'transfer' } | null {
  // 1. Rendimentos / Investimentos (rendimento automático, rendimento, juros, remuneração, cdb, renda fixa)
  const isRendimento = [
    "rendimento automatico",
    "rendimento",
    "juros",
    "remuneracao",
    "cdb",
    "renda fixa",
  ].some((kw) => keywordMatches(rawDescription, kw));

  if (isRendimento) {
    const matched = findCategoryByNames(
      ["Rendimentos", "Investimentos", "CDB / Renda Fixa", "Outros recebimentos"],
      availableCategories
    );
    return {
      category: matched || "Rendimentos",
      type: "income",
    };
  }

  // 2. Fatura / Cartão (pagamento para fatura, fatura cartao, cartao btg, cartão)
  const isCartao = [
    "pagamento para fatura",
    "fatura cartao",
    "cartao btg",
    "cartao",
  ].some((kw) => keywordMatches(rawDescription, kw));

  if (isCartao) {
    const matched = findCategoryByNames(
      ["Cartão de Crédito"],
      availableCategories
    );
    return {
      category: matched || "Cartão de Crédito",
      type: "expense",
    };
  }

  // 3. Bancos / Transferências (banco inter, nubank, btg, itau, bradesco, santander, caixa, bb)
  // Nota: Não forçar type = transfer. Manter o type original.
  const isBanco = [
    "banco inter",
    "nubank",
    "btg",
    "itau",
    "bradesco",
    "santander",
    "caixa",
  ].some((kw) => keywordMatches(rawDescription, kw)) || /\bbb\b/.test(normalizeForMatch(rawDescription));

  if (isBanco) {
    const matched = findCategoryByNames(
      ["Transferência entre contas", "Transferências", "Bancos"],
      availableCategories
    );
    return {
      category: matched || "Transferência entre contas",
    };
  }

  // 4. Assessoria / Contabilidade (assessoria, contabilidade, consultoria)
  const hasContabilidade = keywordMatches(rawDescription, "contabilidade");
  const hasAssessoria = keywordMatches(rawDescription, "assessoria") || keywordMatches(rawDescription, "consultoria");

  if (hasContabilidade || hasAssessoria) {
    const candidates = hasContabilidade
      ? ["Contabilidade", "Serviços Profissionais", "Prestadores / Terceiros"]
      : ["Serviços Profissionais", "Contabilidade", "Prestadores / Terceiros"];
    const matched = findCategoryByNames(candidates, availableCategories);
    return {
      category: matched || (hasContabilidade ? "Contabilidade" : "Serviços Profissionais"),
      type: "expense",
    };
  }

  return null;
}

export function isBlacklistedCategory(categoryName: string, rawDescription: string): boolean {
  const normDesc = normalizeText(rawDescription);
  const normCat = normalizeText(categoryName);

  // Regra 5: Nunca permitir que descrições contendo "rendimento" caiam em "Equipamentos / TI"
  if (normDesc.includes('rendimento') && (normCat === 'equipamentos / ti' || normCat.includes('equipamentos') || normCat === 'ti')) {
    return true;
  }

  // Regra 6: Nunca permitir que descrições contendo "banco" ou "pagamento" caiam em "Jogos / Games"
  if ((normDesc.includes('banco') || normDesc.includes('pagamento')) && (normCat === 'jogos / games' || normCat.includes('jogos') || normCat.includes('games'))) {
    return true;
  }

  return false;
}

function isTransfer(text: string) {
  const t = normalizeText(text);
  return (
    t.includes("pix enviado") ||
    t.includes("transferencia") ||
    t.includes("transferência")
  );
}

async function classifyByLearning(text: string, userId?: string) {

  const learned = await getLearnedCategory(text, userId);

  if (learned?.category) {
    return learned.category;
  }

  const categories = await getCategories(userId);

  for (const cat of categories) {
    if (!cat.keywords) continue;
    if (isBlacklistedCategory(cat.name, text)) continue;

    if (cat.keywords.some((k: string) => keywordMatches(text, k))) {
      return cat.name;
    }
  }

  return null;
}



// 🔥 identidades financeiras internas
async function classifyInternalTransfer(
  text: string,
  userId?: string
) {

  if (!userId) return null;
  const identities =
    await getAccountIdentities(userId);

  for (const identity of identities) {

    if (!identity.isActive) continue;

    const aliases = [
      identity.normalizedName,
      ...(identity.aliases || []),
    ];

    const matched = aliases.some(
      (alias: string) =>
        alias &&
        text.includes(alias)
    );

    if (matched) {
      return {
        category: 'Transferencia',
        type: 'transfer',
      };
    }
  }

  return null;
}


// Fallback IA local — síncrono, sem I/O
function classifyByAISync(text: string): string | null {
  if (text.includes('mercado') || text.includes('supermercado')) return 'Supermercado';
  if (text.includes('posto') || text.includes('gasolina')) return 'Transporte';
  if (text.includes('farmacia')) return 'Saúde';
  
  // NOVOS padrões de alta confiança (fallback)
  if (text.includes('netflix') || text.includes('spotify') || text.includes('amazon prime')) return 'Streaming / Assinaturas';
  if (text.includes('uber') || text.includes('99 pop')) return 'Uber / 99';
  if (text.includes('ifood') || text.includes('rappi')) return 'Delivery';
  if (text.includes('academia') || text.includes('smart fit')) return 'Academia';
  if (text.includes('cinema') || text.includes('ingresso')) return 'Cinema / Teatro';
  if (text.includes('hospital') || text.includes('clinica')) return 'Consultas médicas';
  if (text.includes('dentista') || text.includes('odonto')) return 'Odontologia';
  if (text.includes('seguro') || text.includes('porto seguro')) return 'Seguros';
  if (text.includes('pedagio') || text.includes('sem parar')) return 'Pedágio';
  if (text.includes('estacionamento') || text.includes('park')) return 'Estacionamento';
  if (text.includes('pet') || text.includes('veterinario')) return 'Pets';
  if (text.includes('livraria') || text.includes('livro')) return 'Livros';
  if (text.includes('pix') && text.includes('enviado')) return 'PIX entre pessoas';
  return null;
}

// 🔥 NOVO: fallback IA simples (wrapper async para compatibilidade)
async function classifyByAI(text: string) {
  return classifyByAISync(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXTO DE CLASSIFICAÇÃO — carregado 1 única vez por sessão de importação
// ─────────────────────────────────────────────────────────────────────────────

export type ClassificationContext = {
  /** Lista de categorias com keywords — carregada 1 vez */
  categories: Category[];
  /** Identidades financeiras (contas próprias/família) — carregada 1 vez */
  accountIdentities: AccountIdentity[];
  /** Map fingerprint → category com todo o aprendizado — carregado 1 vez */
  learningMap: Map<string, string>;
};

/**
 * Carrega o contexto necessário para classificar transações em memória.
 * Deve ser chamado UMA VEZ antes do loop de importação.
 * Executa 3 queries em paralelo: categories, identities e category_learning.
 */
export async function buildClassificationContext(userId?: string): Promise<ClassificationContext> {
  const [categories, accountIdentities, learningSnap] = await Promise.all([
    getCategories(userId).catch(err => {
      console.error('Erro ao carregar categorias no contexto:', err);
      return [];
    }),
    (userId ? getAccountIdentities(userId) : Promise.resolve([])).catch(err => {
      console.error('Erro ao carregar identidades no contexto:', err);
      return [];
    }),
    (userId 
      ? getDocs(query(collection(db, 'category_learning'), where('userId', '==', userId)))
      : getDocs(collection(db, 'category_learning'))
    ).catch(err => {
      console.error('Erro ao carregar aprendizado no contexto:', err);
      return { docs: [] } as any;
    }),
  ]);

  const learningMap = new Map<string, string>();
  for (const d of learningSnap.docs) {
    const data = d.data();
    if (data.fingerprint && data.category) {
      learningMap.set(data.fingerprint, data.category);
    }
  }

  return { categories, accountIdentities, learningMap };
}

/**
 * Classifica uma transação usando contexto pré-carregado.
 * SÍNCRONO — zero I/O por transação. Use junto com buildClassificationContext().
 * Resultado idêntico ao classifyTransaction() assíncrono.
 */
export function classifyTransactionWithContext(
  rawText: string,
  amount: number,
  context: ClassificationContext
): ParsedTransaction {
  const text = normalizeText(rawText);

  // 1. Identidade interna (em memória)
  for (const identity of context.accountIdentities) {
    if (!identity.isActive) continue;
    const aliases = [identity.normalizedName, ...(identity.aliases || [])];
    if (aliases.some((alias: string) => alias && text.includes(alias))) {
      return {
        date: '',
        description: rawText,
        merchant: rawText,
        category: 'Transferencia',
        amount: Math.abs(amount),
        type: 'transfer',
      };
    }
  }

  // 2. Transferência por keyword textual
  if (isTransfer(text)) {
    return {
      date: '',
      description: rawText,
      merchant: rawText,
      category: 'Transferência',
      amount: Math.abs(amount),
      type: 'transfer',
    };
  }

  // 3. Lookup O(1) no Map de aprendizado
  const fingerprint = buildLearningFingerprint(text);
  const learned = context.learningMap.get(fingerprint) ?? null;

  // 4. Priority classification layers (inferCategoryFromDescription)
  const inferred = learned ? null : inferCategoryFromDescription(
    rawText,
    amount >= 0 ? 'income' : 'expense',
    context.categories
  );

  // 5. Keyword de categoria (em memória)
  const categoryByKeyword = learned ?? inferred?.category ?? (
    context.categories.find(
      (cat) => {
        if (isBlacklistedCategory(cat.name, rawText)) return false;
        return cat.keywords?.some((k: string) => keywordMatches(rawText, k));
      }
    )?.name ?? null
  );

  // 6. Fallback IA síncrona
  const ai = categoryByKeyword ? null : classifyByAISync(text);
  const category = categoryByKeyword || ai || 'Outros';

  return {
    date: '',
    description: rawText,
    merchant: rawText,
    category,
    amount: Math.abs(amount),
    type: inferred?.type || (amount >= 0 ? 'income' : 'expense'),
  };
}

/**
 * Classifica uma transação com I/O direto ao Firestore.
 * Mantida para compatibilidade com chamadas externas existentes.
 * Em loops de importação, prefira buildClassificationContext() + classifyTransactionWithContext().
 */
export async function classifyTransaction(
  rawText: string,
  amount: number,
  userId?: string
): Promise<ParsedTransaction> {

  const text = normalizeText(rawText);

  // transferência por identidade familiar
  const internalTransfer = await classifyInternalTransfer(text, userId);

  if (internalTransfer) {
    return {
      date: '',
      description: rawText,
      merchant: rawText,
      category: internalTransfer.category,
      amount: Math.abs(amount),
      type: 'transfer',
    };
  }

  // transferência
  if (isTransfer(text)) {
    return {
      date: '',
      description: rawText,
      merchant: rawText,
      category: 'Transferência',
      amount: Math.abs(amount),
      type: 'transfer',
    };
  }

  // prioridade 1: aprendizado
  const learned = await classifyByLearning(text, userId);

  // priority inference (layer 2)
  const categories = await getCategories(userId);
  const inferred = learned ? null : inferCategoryFromDescription(rawText, amount >= 0 ? 'income' : 'expense', categories);

  // prioridade 3: IA fallback
  const ai = (learned || inferred?.category) ? null : await classifyByAI(text);

  const category = learned || inferred?.category || ai || 'Outros';

  return {
    date: '',
    description: rawText,
    merchant: rawText,
    category,
    amount: Math.abs(amount),
    type: inferred?.type || (amount >= 0 ? 'income' : 'expense'),
  };
}
