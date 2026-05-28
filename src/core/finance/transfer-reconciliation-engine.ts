export type ReconciliationCandidate = {
  id: string;
  amount: number;
  date: string; // Formato esperado: YYYY-MM-DD ou ISO string
  description: string;
  type: string; // 'transfer', 'income', 'expense'
  owner: string; // 'PF' | 'PJ'
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

  // 3. Filtro Rígido: Mesma Entidade (Owner)
  if (source.owner !== target.owner) return 0;

  let score = 0;

  // 5. Janela Heurística de Data (Até 60 pontos)
  const daysDiff = calculateDaysDifference(source.date, target.date);

  if (daysDiff === 0) {
    score += 60; // Mesmo dia
  } else if (daysDiff === 1) {
    score += 40; // 1 dia de diferença
  } else if (daysDiff <= 2) {
    score += 20; // Janela padrão: 2 dias de diferença
  } else if (daysDiff <= 3) {
    score += 10; // Fallback: 3 dias de diferença (ex: sexta para segunda)
  } else {
    return 0; // Fora da janela permitida
  }

  // 6. Similaridade de Descrição (Bônus até 40 pontos)
  const normSource = normalizeTransferText(source.description);
  const normTarget = normalizeTransferText(target.description);

  // Palavras-chave em comum de transferências
  const keywords = ['ted', 'pix', 'transf', 'transferencia', 'doc'];
  let keywordMatch = false;
  for (const kw of keywords) {
    if (normSource.includes(kw) && normTarget.includes(kw)) {
      keywordMatch = true;
      break;
    }
  }

  if (keywordMatch) {
    score += 20;
  }

  // Descrição idêntica ou muito parecida
  if (normSource === normTarget && normSource.length > 3) {
    score += 20;
  } else if (
    normSource.includes(normTarget) ||
    normTarget.includes(normSource)
  ) {
    // Partial match
    if (normSource.length > 5 && normTarget.length > 5) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

export function getConfidenceLevel(
  score: number
): 'high' | 'medium' | 'low' | 'none' {
  if (score >= 80) return 'high'; // Sugestão Forte (pré-selecionável no staging, mas requer confirmação)
  if (score >= 40) return 'medium'; // Sugestão Dúvidosa (UI exige clique do usuário)
  if (score > 0) return 'low';
  return 'none';
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
    if (score > 0) {
      matches.push({
        sourceId: source.id,
        targetId: candidate.id,
        score,
        confidence: getConfidenceLevel(score),
      });
    }
  }

  // Ordena por maior score
  return matches.sort((a, b) => b.score - a.score);
}
