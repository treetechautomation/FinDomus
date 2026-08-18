export type ReconciliationCandidate = {
  id: string;
  amount: number;
  originalAmount?: number;
  date: string; // Formato esperado: YYYY-MM-DD ou ISO string
  description: string;
  type: string; // 'transfer', 'income', 'expense'
  owner: string; // 'PF' | 'PJ'
  categoryType?: string;
  hasIdentityMatch?: boolean;
};

export type MatchResult = {
  sourceId: string;
  targetId: string;
  score: number;
  confidence: 'high' | 'medium' | 'low' | 'none';
};

export function normalizeTransferText(text: string) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function calculateDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1.split('T')[0]).getTime();
  const d2 = new Date(date2.split('T')[0]).getTime();
  return Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
}

export function calculateMatchScore(
  source: ReconciliationCandidate,
  target: ReconciliationCandidate
): number {
  // 1. Filtro Rígido: Apenas transferências
  if (source.type !== 'transfer' || target.type !== 'transfer') return 0;

  // 2. Filtro Rígido: Valor exato
  if (Math.abs(source.amount) !== Math.abs(target.amount)) return 0;

  // 3. Filtro Rígido: Sinais Opostos (exige originalAmount para verificar)
  if (source.originalAmount !== undefined && target.originalAmount !== undefined) {
    if (Math.sign(source.originalAmount) === Math.sign(target.originalAmount)) return 0;
  }

  // 4. Filtro Rígido: Mesma Entidade (Owner incompatível)
  if (source.owner !== target.owner) return 0;

  // 5. Filtro Rígido: Investimento não concorre
  if (source.categoryType === 'investment' || target.categoryType === 'investment') return 0;

  let score = 0;

  // 6. Janela Heurística de Data (Reduzida para ser menos agressiva)
  const daysDiff = calculateDaysDifference(source.date, target.date);

  if (daysDiff === 0) {
    score += 30; // Mesmo dia (Era 60)
  } else if (daysDiff === 1) {
    score += 20; // 1 dia de diferença (Era 40)
  } else if (daysDiff <= 2) {
    score += 10; // Janela padrão: 2 dias de diferença
  } else if (daysDiff <= 3) {
    score += 5;  // Fallback: 3 dias de diferença
  } else {
    return 0; // Fora da janela permitida
  }

  // 7. Similaridade de Descrição e Evidência Semântica
  const normSource = normalizeTransferText(source.description);
  const normTarget = normalizeTransferText(target.description);

  // Identity Match (Evidência Forte)
  if (source.hasIdentityMatch || target.hasIdentityMatch) {
    score += 50;
  }

  let explicitOwnTransfer = false;
  if (normSource.includes('mesma titularidade') || normTarget.includes('mesma titularidade') ||
      normSource.includes('conta propria') || normTarget.includes('conta propria')) {
    explicitOwnTransfer = true;
    score += 40;
  }

  // Palavras-chave genéricas de transferência (Evidência Fraca)
  const keywords = ['ted', 'pix', 'transf', 'transferencia', 'doc'];
  let keywordMatch = false;
  for (const kw of keywords) {
    if (normSource.includes(kw) && normTarget.includes(kw)) {
      keywordMatch = true;
      break;
    }
  }

  if (keywordMatch) {
    score += 10; // Reduzido (Era 20), PIX sozinho não prova conta própria
  }

  // Descrição idêntica ou muito parecida
  if (normSource === normTarget && normSource.length > 3) {
    score += 10;
  } else if (
    normSource.includes(normTarget) ||
    normTarget.includes(normSource)
  ) {
    if (normSource.length > 5 && normTarget.length > 5) {
      score += 10;
    }
  }

  // HARD GATE #5 - Evidência Semântica Mínima
  const hasStrongEvidence = source.hasIdentityMatch || target.hasIdentityMatch || explicitOwnTransfer;
  if (!hasStrongEvidence) {
    // Se não há evidência forte de conta própria, NUNCA sugerimos (capping < 50)
    score = Math.min(score, 49);
  }

  return Math.min(score, 100);
}

export function getConfidenceLevel(
  score: number
): 'high' | 'medium' | 'low' | 'none' {
  if (score >= 80) return 'high'; // Sugestão Forte
  if (score >= 50) return 'medium'; // Sugestão Média
  if (score > 0) return 'low';
  return 'none';
}

export function getReconciliationReason(score: number, source: ReconciliationCandidate, target: ReconciliationCandidate): string {
  const isOpposite = source.originalAmount !== undefined && target.originalAmount !== undefined
    ? Math.sign(source.originalAmount) !== Math.sign(target.originalAmount)
    : true;

  const parts = [];
  parts.push('Mesmo valor');
  if (isOpposite) parts.push('sinais opostos');
  if (calculateDaysDifference(source.date, target.date) === 0) parts.push('mesmo dia');
  if (source.hasIdentityMatch || target.hasIdentityMatch) parts.push('conta própria identificada');

  return parts.join(', ');
}

export function findBestMatches(
  source: ReconciliationCandidate,
  candidates: ReconciliationCandidate[]
): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const candidate of candidates) {
    // Não comparar com si mesmo
    if (source.id === candidate.id) continue;

    const score = calculateMatchScore(source, candidate);
    if (score >= 50) { // OMIT CANDIDATES THAT ARE LOW CONFIDENCE FROM BEING MATCHED GREEDILY
      matches.push({
        sourceId: source.id,
        targetId: candidate.id,
        score,
        confidence: getConfidenceLevel(score),
      });
    }
  }

  // Ordena por maior score, e como tie-break usa a menor diferença de dias, depois por ID estável
  return matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const candA = candidates.find(c => c.id === a.targetId);
    const candB = candidates.find(c => c.id === b.targetId);
    if (candA && candB) {
      const diffA = calculateDaysDifference(source.date, candA.date);
      const diffB = calculateDaysDifference(source.date, candB.date);
      if (diffA !== diffB) return diffA - diffB;
      // Stable ID tie break
      return candA.id.localeCompare(candB.id);
    }
    return 0;
  });
}
