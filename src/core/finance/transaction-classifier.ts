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
  originalAmount?: number;
  hasIdentityMatch?: boolean;
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

  // Fronteira de palavra exigida nos DOIS lados — evita que uma keyword curta
  // (ex.: "gol") case como prefixo/sufixo de uma palavra maior não relacionada
  // (ex.: "GOLD"). Continua casando keywords compostas normalmente, porque \b
  // só avalia a borda no início/fim do trecho inteiro, não os espaços internos.
  const escapedKw = escapeRegExp(normKw);
  const regex = new RegExp(`\\b${escapedKw}\\b`, 'i');
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
  // 0. Encargos / Juros de Mora / Multas / Rotativo (Juros de Mora, Juros Rotativo, IOF Rotativo, Juros de Atraso, Multa, Encargos de Refinanciamento)
  const isEncargoMora = [
    "juros de mora",
    "juros mora",
    "juros rotativo",
    "juros de atraso",
    "juros atraso",
    "juros s/ fatura",
    "juros fatura",
    "iof rotativo",
    "rotativo",
    "multa contratual",
    "multa de mora",
    "multa mora",
    "multa por atraso",
    "multa atraso",
    "encargos de refinanciamento",
    "encargos refinanciamento",
    "encargos financeiros",
    "encargos de atraso",
  ].some((kw) => keywordMatches(rawDescription, kw));

  if (isEncargoMora) {
    const isRefinanciamento = keywordMatches(rawDescription, "refinanciamento") || keywordMatches(rawDescription, "encargos de refinanciamento");
    const candidates = isRefinanciamento
      ? ["Dívidas / Empréstimos", "Juros / Multas", "Encargos Financeiros", "Outros"]
      : ["Juros / Multas", "Dívidas / Empréstimos", "Encargos Financeiros", "Outros"];

    const matched = findCategoryByNames(candidates, availableCategories);
    return {
      category: matched || (isRefinanciamento ? "Dívidas / Empréstimos" : "Juros / Multas"),
      type: "expense",
    };
  }

  // 1. [REMOVIDO — INVEST.CLASSIFIER.1 Fase B] Regra antiga interceptava
  // qualquer texto contendo "rendimento"/"cdb"/"renda fixa"/"remuneracao"/
  // JCP/dividendos ANTES do catálogo real competir, e tentava resolver por
  // nomes fixos ("Rendimentos", "Investimentos", "CDB / Renda Fixa", "Outros
  // recebimentos") — nomes que em parte não existem mais no catálogo atual.
  // Consequência comprovada (INVEST.CLASSIFIER.1 Fase A): "Dividendos",
  // "JCP" e "Rendimento líquido" caíam em "CDB / Renda Fixa" só porque esse
  // era o único nome da lista fixa que ainda existia — mesmo quando a
  // categoria real e correta ("Dividendos") já existia no catálogo e nunca
  // era consultada. Remover a interceptação deixa esses textos seguirem
  // normalmente para o matcher de keywords do catálogo real (com ranking de
  // especificidade — ver resolveCategoryByKeyword), que já sabe achar
  // "Dividendos" via suas próprias keywords.

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

  // 3. [REMOVIDO — OFX.5 Fase B] "Bancos / Transferências" decidia a
  // categoria com base só no nome do banco/processador da contraparte
  // mencionado no texto (banco inter, nubank, btg, itau, bradesco,
  // santander, caixa, "bb"). Como esse nome é metadado bancário — não
  // evidência da natureza econômica da movimentação — sua cobertura
  // incompleta (não incluía "Banco do Brasil" nem "NU PAGAMENTOS - IP")
  // fazia transações economicamente idênticas caírem em categorias
  // diferentes só por causa do banco citado (comprovado na OFX.5 — Fase A:
  // Santander/Bradesco/Itaú/Caixa/Banco Inter → "Outros" via barreira
  // categoria×tipo; "BCO DO BRASIL"/"NU PAGAMENTOS" escapavam e chegavam à
  // keyword "transferencia recebida" do catálogo → "Recebimentos").
  // Adicionar os bancos que faltavam tornaria o resultado uniforme, mas
  // continuaria sendo o nome do banco decidindo a categoria — o princípio
  // violado é o mesmo. A remoção deixa a busca seguir normalmente para
  // aprendizado/keywords de catálogo (steps seguintes), que já decidem de
  // forma idêntica independente de qual banco aparece no texto.

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

// PIX/TED/DOC/"transferência" descrevem o MEIO bancário, e nomes de
// gateway/processador/instituição de pagamento (picpay, mercado pago, stone,
// cielo, getnet, pagseguro, pagbank, asaas, stripe, rede) descrevem o
// INTERMEDIÁRIO — nenhum dos dois é a natureza econômica da movimentação
// (OFX.4 — Fase B / B.2, princípio central). Um gateway aparece no MEMO do
// OFX na mesma posição estrutural que o nome de um banco tradicional (ex.:
// "FOOD TO SAVE LTDA - ... - PICPAY (0380) Agência: 1 Conta: ...", igual a
// "... - BCO SANTANDER (BRASIL) S.A. (0033) Agência: ...") — é metadado
// bancário da contraparte, não o motivo da compra. Uma categoria só pode ser
// decidida por essas palavras quando não há nenhuma evidência mais específica
// (aprendizado, inferência semântica, keyword de negócio/merchant real) — e
// mesmo assim não decide `type` sozinha nem sobrevive à barreira
// categoria×tipo se o `type` final não for 'transfer'. Keywords compostas
// (ex. "recebimento stone", "taxa gateway") continuam válidas — só o nome
// isolado do gateway é rebaixado.
const MECHANISM_ONLY_KEYWORDS = [
  'pix', 'ted', 'doc', 'transferencia',
  'picpay', 'mercado pago', 'mercadopago', 'pagbank', 'recargapay', 'ame digital',
  'stone', 'pagseguro', 'cielo', 'getnet', 'rede', 'asaas', 'stripe',
];

function isMechanismOnlyKeyword(keyword: string): boolean {
  return MECHANISM_ONLY_KEYWORDS.includes(normalizeForMatch(keyword));
}

// Uma categoria "casa" só pelo mecanismo bancário quando TODA keyword sua que
// bateu no texto é um termo de mecanismo (ex.: "pix", "ted", "transferencia").
// Se alguma keyword mais específica também bateu (ex.: "ted mesma titularidade"),
// a categoria continua elegível normalmente — isso preserva keywords compostas.
function matchesOnlyMechanismKeywords(
  category: { keywords?: string[] },
  rawText: string
): boolean {
  const matched = (category.keywords || []).filter((k) => keywordMatches(rawText, k));
  if (matched.length === 0) return false;
  return matched.every(isMechanismOnlyKeyword);
}

// ─────────────────────────────────────────────────────────────────────────────
// INVEST.CLASSIFIER.1 — Fase B — MATCHER DE KEYWORDS POR ESPECIFICIDADE
// ─────────────────────────────────────────────────────────────────────────────
// Fase A comprovou dois problemas estruturais no matcher antigo
// (`categories.find(cat => cat.keywords.some(...))`, primeira categoria do
// array vence):
//
//   A) FIRST-MATCH ARBITRÁRIO — nenhum critério de especificidade decidia
//      entre candidatas concorrentes; a ordem de inserção no array (que nem
//      é garantida pelo Firestore sem orderBy explícito) decidia sozinha.
//      Caso comprovado: "Resgate CDB" caía em "CDB / Renda Fixa" (keyword
//      composta "resgate cdb") em vez de "Resgate investimento" — a
//      categoria correta ficava em segundo lugar só por posição no array.
//
//   B) EVENTO × CLASSE DE ATIVO — o catálogo mistura duas dimensões:
//      categorias de EVENTO financeiro (Aporte investimento, Resgate
//      investimento) e categorias de CLASSE DE ATIVO (CDB / Renda Fixa,
//      Tesouro Direto, Ações, Cripto, Fundos ...). Uma transação como
//      "Aplicação CDB" description a NATUREZA do evento (aporte) mais do que
//      o instrumento (CDB) — o campo `category` hoje representa o evento,
//      não a classe do ativo (INVEST.1, que modelaria posição/ativo
//      separadamente, continua fora de escopo aqui).
//
// rankCategoryKeywordMatches() substitui o `.find()` por um ranking
// determinístico: (1) nº de tokens da keyword casada [mais tokens = mais
// específica], (2) categoryType === 'investment' [uma categoria com
// metadata explícita de investimento é preferida a uma legada/sem tipo em
// empate de especificidade], (3) categoryType === type da transação, (4)
// nome da categoria em ordem alfabética [desempate 100% determinístico,
// independente da ordem de inserção no array/Firestore].
type CategoryKeywordCandidate = {
  category: Category;
  matchedKeyword: string;
  tokenCount: number;
};

function bestMatchedKeyword(category: Category, rawText: string): { keyword: string; tokenCount: number } | null {
  let best: { keyword: string; tokenCount: number } | null = null;
  for (const kw of category.keywords || []) {
    if (!keywordMatches(rawText, kw)) continue;
    const tokenCount = normalizeForMatch(kw).split(' ').filter(Boolean).length;
    if (!best || tokenCount > best.tokenCount) {
      best = { keyword: kw, tokenCount };
    }
  }
  return best;
}

function rankCategoryKeywordMatches(
  rawText: string,
  categories: Category[],
  transactionType: 'income' | 'expense' | 'transfer'
): CategoryKeywordCandidate[] {
  const matchText = withFinancialAcronymAliases(rawText);
  const candidates: CategoryKeywordCandidate[] = [];
  for (const cat of categories) {
    if (isBlacklistedCategory(cat.name, rawText)) continue;
    if (matchesOnlyMechanismKeywords(cat, matchText)) continue;
    const best = bestMatchedKeyword(cat, matchText);
    if (!best) continue;
    candidates.push({ category: cat, matchedKeyword: best.keyword, tokenCount: best.tokenCount });
  }

  candidates.sort((a, b) => {
    if (b.tokenCount !== a.tokenCount) return b.tokenCount - a.tokenCount;
    const aIsInvestment = a.category.categoryType === 'investment' ? 1 : 0;
    const bIsInvestment = b.category.categoryType === 'investment' ? 1 : 0;
    if (bIsInvestment !== aIsInvestment) return bIsInvestment - aIsInvestment;
    const aTypeMatch = a.category.categoryType === transactionType ? 1 : 0;
    const bTypeMatch = b.category.categoryType === transactionType ? 1 : 0;
    if (bTypeMatch !== aTypeMatch) return bTypeMatch - aTypeMatch;
    return a.category.name.localeCompare(b.category.name);
  });

  return candidates;
}

// Categorias de EVENTO de investimento reconhecidas pelo próprio nome
// ("Aporte investimento", "Resgate investimento") — a distinção é genérica
// (não cita nenhum banco/produto/usuário específico) e usa a mesma
// convenção de nomenclatura que o catálogo padrão da aplicação já adota
// (ver default-category-catalog.ts). Só considera categoryType='investment'
// para não colidir com categorias legadas homônimas sem esse metadata
// (ex.: "Investimentos (aporte)", categoryType=undefined).
const INVESTMENT_EVENT_TERMS = ['aporte', 'resgate'];

function isEventInvestmentCategory(category: Category): boolean {
  if (category.categoryType !== 'investment') return false;
  const normName = normalizeText(category.name);
  return INVESTMENT_EVENT_TERMS.some((term) => normName.includes(term));
}

// Padrão estrutural, genérico (não específico de RDB/CDB/nenhum banco):
// "aplicação <substantivo>" SEM a preposição "de" no meio. Extratos
// bancários brasileiros usam essa forma para aportes em produtos de
// investimento ("Aplicação RDB", "Aplicação CDB", "Aplicação Fundo XYZ").
// Já o uso genérico do verbo "aplicar" em outros contextos ("aplicação de
// multa", "aplicação de desconto", "aplicação de taxa") sempre intercala a
// preposição "de" — por isso ela é usada como filtro negativo.
function hasBareInvestmentApplicationPattern(rawText: string): boolean {
  const norm = normalizeForMatch(rawText);
  return /\baplicacao\b(?!\s+de\b)\s+\S/.test(norm);
}

// INVEST.CLASSIFIER.1 — Fase B.1 — JCP/JSCP são duas grafias da MESMA sigla
// financeira padrão (Juros sobre Capital Próprio) — não é uma equivalência
// inventada para este caso, é convenção de mercado já usada por instituições
// diferentes. Um único par de alias, documentado, não uma lista crescente.
// Aplicado só na etapa de keyword de catálogo (não em learning/identidade).
const FINANCIAL_ACRONYM_ALIASES: Array<[RegExp, string]> = [
  [/\bjcp\b/i, 'jscp'],
];

function withFinancialAcronymAliases(rawText: string): string {
  let expanded = rawText;
  for (const [pattern, alias] of FINANCIAL_ACRONYM_ALIASES) {
    if (pattern.test(rawText) && !new RegExp(`\\b${alias}\\b`, 'i').test(rawText)) {
      expanded += ` ${alias}`;
    }
  }
  return expanded;
}

// INVEST.CLASSIFIER.1 — Fase B.1 — EXIGÊNCIA DE CORROBORAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
// Fase B comprovou falsos positivos: "investimento em curso" e "resgate de
// pontos" viravam Aporte/Resgate investimento só pela palavra genérica
// isolada ("investimento"/"resgate") já ser, sozinha, uma keyword real dessas
// categorias. Uma palavra-evento isolada não é evidência suficiente de que a
// transação é sobre um INSTRUMENTO financeiro — precisa de uma segunda peça
// de evidência independente do domínio de investimento (qualquer keyword de
// QUALQUER categoria categoryType='investment' — CDB/Renda Fixa, Tesouro
// Direto, Ações, Cripto, Fundos... — ou uma keyword composta, ≥2 tokens, na
// própria categoria de evento, ex.: "resgate investimento", "resgate cdb").
// Isso é evidência POSITIVA derivada do próprio catálogo (categoryType já
// existente), não uma lista de palavras negativas proibidas — generaliza
// para qualquer "resgate/aporte de <coisa não-financeira>" sem precisar
// listar "pontos", "milhas", "cashback", "curso" etc. um por um.
const BARE_EVENT_TERMS = ['aporte', 'resgate', 'investimento', 'investir'];

// Mesmo padrão estrutural do bridge de "aplicação" (ver
// hasBareInvestmentApplicationPattern), generalizado para "aporte"/"resgate":
// a palavra-evento IMEDIATAMENTE seguida de um substantivo (sem preposição
// "de"/"em"/"por"/"para" no meio) é a forma como extratos bancários citam o
// produto ("Aporte RDB", "Resgate RDB", "Resgate CDB"). Usos genéricos fora
// de investimento sempre intercalam preposição ("resgate DE pontos",
// "resgate DE milhas", "investimento EM curso") — por isso ela funciona como
// filtro negativo aqui também. Só cobre "aporte"/"resgate": "investimento"/
// "investir" ficam de fora de propósito, porque não há gate exigindo esse
// padrão para eles e ampliar o escopo aumentaria o risco de falso positivo
// sem necessidade comprovada.
const STRUCTURALLY_BRIDGEABLE_EVENT_TERMS = ['aporte', 'resgate'];

function hasBareEventProductPattern(rawText: string, eventWord: string): boolean {
  const norm = normalizeForMatch(rawText);
  const regex = new RegExp(`\\b${eventWord}\\b(?!\\s+(?:de|em|por|para)\\b)\\s+\\S`);
  return regex.test(norm);
}

function isUncorroboratedBareEventMatch(
  candidate: CategoryKeywordCandidate,
  allCandidates: CategoryKeywordCandidate[],
  rawText: string
): boolean {
  if (candidate.tokenCount !== 1) return false;
  if (!isEventInvestmentCategory(candidate.category)) return false;
  const kw = normalizeForMatch(candidate.matchedKeyword);
  if (!BARE_EVENT_TERMS.includes(kw)) return false;

  if (STRUCTURALLY_BRIDGEABLE_EVENT_TERMS.includes(kw) && hasBareEventProductPattern(rawText, kw)) {
    return false; // corroborado estruturalmente (ex.: "Aporte RDB", "Resgate RDB")
  }

  const hasCorroboration = allCandidates.some(
    (c) => c !== candidate && c.category.categoryType === 'investment'
  );
  return !hasCorroboration;
}

// resolveCategoryByKeyword() é o ponto único de resolução de categoria por
// keyword de catálogo — substitui o `.find()` original dentro de
// classifyTransactionWithContext(). Mantém EXATAMENTE a mesma prioridade
// pré-existente (learning > inferCategoryFromDescription > isto aqui > IA
// fallback) — só troca COMO a etapa de keyword de catálogo decide entre
// candidatas concorrentes.
function resolveCategoryByKeyword(
  rawText: string,
  categories: Category[],
  transactionType: 'income' | 'expense' | 'transfer'
): string | null {
  const rawRanked = rankCategoryKeywordMatches(rawText, categories, transactionType);
  // Descarta candidatas cuja única evidência é uma palavra-evento genérica
  // isolada sem corroboração de domínio de investimento (Fase B.1 — ver
  // isUncorroboratedBareEventMatch). Tratadas como se a categoria nunca
  // tivesse batido, não apenas rebaixadas — para não vazarem como
  // vencedoras por serem a única candidata restante.
  const ranked = rawRanked.filter((c) => !isUncorroboratedBareEventMatch(c, rawRanked, rawText));

  const investmentRanked = ranked.filter((c) => c.category.categoryType === 'investment');
  const eventRanked = investmentRanked.filter((c) => isEventInvestmentCategory(c.category));
  const assetRanked = investmentRanked.filter((c) => !isEventInvestmentCategory(c.category));

  // Bridge — só quando o padrão estrutural de aporte bate E (a) a única
  // evidência real encontrada foi a palavra genérica isolada "aplicacao"
  // (nenhuma keyword mais específica competindo), ou (b) já existe alguma
  // categoria de investimento entre as candidatas reais (o texto já tem
  // evidência investment-adjacent independente, ex.: "cdb"). Isso bloqueia
  // "aplicação de multa/desconto/taxa" (a preposição "de" já impede o
  // padrão) e não promove nada quando a única evidência real é de um
  // domínio claramente não-investimento.
  if (hasBareInvestmentApplicationPattern(rawText)) {
    const onlyBareApplicacaoEvidence =
      ranked.length > 0 && ranked.every((c) => normalizeForMatch(c.matchedKeyword) === 'aplicacao');
    const hasIndependentInvestmentEvidence = investmentRanked.length > 0;
    if (onlyBareApplicacaoEvidence || hasIndependentInvestmentEvidence) {
      const aporteCategory = categories.find(
        (c) => c.categoryType === 'investment' && isEventInvestmentCategory(c) && normalizeText(c.name).includes('aporte')
      );
      if (aporteCategory) return aporteCategory.name;
    }
  }

  // Entre candidatas de investimento, EVENTO sempre vence CLASSE DE ATIVO
  // (ver comentário do bloco acima) — não é desempate por especificidade,
  // é a conclusão arquitetural da Fase A: `category` representa o evento
  // financeiro, não o instrumento.
  if (eventRanked.length > 0 && assetRanked.length > 0) {
    return eventRanked[0].category.name;
  }

  return ranked.length > 0 ? ranked[0].category.name : null;
}

// Compatibilidade de LEITURA com fingerprints legados (OFX.4 — Fase B.2).
// Aprendizados antigos (PDF/CSV) foram gravados com fingerprint curto — só a
// contraparte, sem o boilerplate bancário verboso que o Nubank usa no OFX
// ("Transferência recebida/enviada pelo Pix ... (Transferência enviada)").
// Reduz o fingerprint removendo EXATAMENTE essas frases conhecidas (frases
// completas, não palavras soltas, para não corromper um nome real que
// contenha uma delas), reproduzindo o fingerprint que uma importação de
// PDF/CSV mais enxuta teria gerado para a mesma contraparte. Usada só como
// fallback de LEITURA quando o fingerprint verboso não bate em nada — nunca
// escreve, nunca migra, nunca sobrescreve o fingerprint original armazenado.
const LEGACY_FINGERPRINT_BOILERPLATE = [
  'transferencia recebida pelo pix',
  'transferencia enviada pelo pix',
  'transferencia recebida',
  'transferencia enviada',
  'pix recebido',
  'pix enviado',
];

function buildReducedLearningFingerprint(fingerprint: string): string | null {
  let reduced = fingerprint;
  for (const phrase of LEGACY_FINGERPRINT_BOILERPLATE) {
    reduced = reduced.split(phrase).join(' ');
  }
  reduced = buildLearningFingerprint(reduced);
  return reduced && reduced !== fingerprint ? reduced : null;
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
    if (!cat.keywords.some((k: string) => keywordMatches(text, k))) continue;
    if (matchesOnlyMechanismKeywords(cat, text)) continue;

    return cat.name;
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
// OFX.4 — Fase B.2: usa keywordMatches() (fronteira de palavra nos dois
// lados) em vez de .includes() bruto — mesma classe de bug do catálogo
// (ex.: "seguro" casando "pagseguro", "mercado" casando "mercado pago"),
// aqui dentro do fallback de IA local.
function classifyByAISync(text: string): string | null {
  if (keywordMatches(text, 'mercado') || keywordMatches(text, 'supermercado')) return 'Supermercado';
  if (keywordMatches(text, 'posto') || keywordMatches(text, 'gasolina')) return 'Transporte';
  if (keywordMatches(text, 'farmacia')) return 'Saúde';

  // NOVOS padrões de alta confiança (fallback)
  if (keywordMatches(text, 'netflix') || keywordMatches(text, 'spotify') || keywordMatches(text, 'amazon prime')) return 'Streaming / Assinaturas';
  if (keywordMatches(text, 'uber') || keywordMatches(text, '99 pop')) return 'Uber / 99';
  if (keywordMatches(text, 'ifood') || keywordMatches(text, 'rappi')) return 'Delivery';
  if (keywordMatches(text, 'academia') || keywordMatches(text, 'smart fit')) return 'Academia';
  if (keywordMatches(text, 'cinema') || keywordMatches(text, 'ingresso')) return 'Cinema / Teatro';
  if (keywordMatches(text, 'hospital') || keywordMatches(text, 'clinica')) return 'Consultas médicas';
  if (keywordMatches(text, 'dentista') || keywordMatches(text, 'odonto')) return 'Odontologia';
  if (keywordMatches(text, 'seguro') || keywordMatches(text, 'porto seguro')) return 'Seguros';
  if (keywordMatches(text, 'pedagio') || keywordMatches(text, 'sem parar')) return 'Pedágio';
  if (keywordMatches(text, 'estacionamento') || keywordMatches(text, 'park')) return 'Estacionamento';
  if (keywordMatches(text, 'pet') || keywordMatches(text, 'veterinario')) return 'Pets';
  if (keywordMatches(text, 'livraria') || keywordMatches(text, 'livro')) return 'Livros';
  if (keywordMatches(text, 'pix') && keywordMatches(text, 'enviado')) return 'PIX entre pessoas';
  return null;
}

// 🔥 NOVO: fallback IA simples (wrapper async para compatibilidade)
async function classifyByAI(text: string) {
  return classifyByAISync(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// BARREIRA CENTRAL — category.categoryType × transaction.type
// ─────────────────────────────────────────────────────────────────────────────
// O tipo financeiro tem precedência sobre a categoria: NUNCA redefine `type`.
// Apenas invalida uma categoria cuja categoryType (metadata persistida no
// Firestore) contradiga o type já decidido. A origem da categoria (learning,
// keyword, IA ou inferência) é indiferente.
//
// categoryType ausente (custom/legacy) → comportamento legado (mantém).
// categoryType='investment'            → DEFER: não existe type='investment';
//   aportes são expense e resgates/rendimentos são income. Mantém legado.
function findCategoryType(
  categoryName: string,
  categories: Category[]
): Category['categoryType'] {
  const norm = normalizeText(categoryName);
  const found = categories.find((cat) => normalizeText(cat.name) === norm);
  return found?.categoryType;
}

function ensureCategoryTypeCompatibility(
  category: string,
  type: 'income' | 'expense' | 'transfer',
  categories: Category[]
): string {
  const categoryType = findCategoryType(category, categories);

  if (!categoryType || categoryType === 'investment') {
    return category;
  }

  if (categoryType !== type) {
    return 'Outros';
  }

  return category;
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

  // 2. Aprendizado explícito do usuário (O(1), em memória) — tem prioridade
  // sobre qualquer heurística textual genérica de transferência, desde que a
  // etapa 1 (identidade, evidência estrutural) não tenha decidido antes.
  // Fallback: se o fingerprint verboso (OFX) não bater em nada, tenta o
  // fingerprint reduzido (compatível com aprendizados legados de PDF/CSV).
  const fingerprint = buildLearningFingerprint(text);
  let learned = context.learningMap.get(fingerprint) ?? null;
  if (!learned) {
    const reducedFingerprint = buildReducedLearningFingerprint(fingerprint);
    if (reducedFingerprint) {
      learned = context.learningMap.get(reducedFingerprint) ?? null;
    }
  }

  const signType: 'income' | 'expense' = amount >= 0 ? 'income' : 'expense';

  // 3. Inferência semântica específica (rendimento, juros/mora, cartão,
  // contabilidade, banco da contraparte etc.)
  const inferred = learned ? null : inferCategoryFromDescription(
    rawText,
    signType,
    context.categories
  );

  // 4. Keyword de categoria (em memória) — ranking por especificidade
  // (INVEST.CLASSIFIER.1 Fase B — ver resolveCategoryByKeyword) em vez de
  // first-match. Ignora candidatas cuja ÚNICA evidência de match é um termo
  // de mecanismo bancário (pix/ted/doc/transferência) sem nenhuma
  // identidade comprovada: o meio de pagamento não decide a categoria
  // econômica sozinho.
  const categoryByKeyword = learned ?? inferred?.category ?? resolveCategoryByKeyword(
    rawText,
    context.categories,
    signType
  );

  // 5. Fallback IA síncrona
  const ai = categoryByKeyword ? null : classifyByAISync(text);
  const category = categoryByKeyword || ai || 'Outros';

  const type: 'income' | 'expense' | 'transfer' =
    inferred?.type || signType;

  // Barreira central categoria × tipo — roda somente após category e type
  // estarem ambos resolvidos. Nunca altera type.
  const safeCategory = ensureCategoryTypeCompatibility(
    category,
    type,
    context.categories
  );

  return {
    date: '',
    description: rawText,
    merchant: rawText,
    category: safeCategory,
    amount: Math.abs(amount),
    type,
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

  // prioridade 1: aprendizado (inclui fallback por keyword de categoria,
  // já sem deixar um termo de mecanismo bancário decidir sozinho — ver
  // classifyByLearning / matchesOnlyMechanismKeywords)
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
