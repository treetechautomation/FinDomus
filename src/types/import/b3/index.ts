export interface B3Position {
  id?: string;
  ticker: string;
  nome: string;
  tipo: string;
  instituicao: string;
  quantidade: number;
  preco: number;
  valorAtualizado: number;
  ano: number;
}

export interface B3Dividend {
  id?: string;
  ticker: string;
  tipo: string;
  valor: number;
  ano: number;
}

export interface B3ParseResult {
  positions: B3Position[];
  dividends: B3Dividend[];
  errors: string[];
}

// Persistência no Firestore
export interface InvestmentPosition {
  id: string; // pos_${userId}_B3_${year}_${ticker}_${type}
  userId: string;
  year: number;
  ticker: string;
  name: string;
  type: string;
  institution: string;
  quantity: number;
  price: number;
  marketValue: number;
  importedAt: any; // Firestore Timestamp
}

export interface InvestmentIncome {
  id: string; // inc_${userId}_B3_${year}_${ticker}_${typeSlug}
  userId: string;
  year: number;
  ticker: string;
  type: string;
  amount: number;
  importedAt: any; // Firestore Timestamp
}

export interface InvestmentImport {
  id: string; // imp_${userId}_B3_${year}_${fileHash}
  userId: string;
  fileName: string;
  year: number;
  totalPositions: number;
  totalIncome: number;
  importedAt: any; // Firestore Timestamp
}
