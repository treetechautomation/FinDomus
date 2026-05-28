const BRASILAPI_BASE = 'https://brasilapi.com.br/api';

export interface BrasilCNPJ {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  natureza_juridica: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string | null;
  telefone: string | null;
  data_situacao_cadastral: string;
  situacao_cadastral: string;
  capital_social: number;
  porte: string | null;
  porte_descricao: string | null;
}

export interface BrasilCEP {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location?: { type: string; coordinates: { longitude: string; latitude: string } };
}

export interface BrasilHoliday {
  date: string;
  name: string;
  type: string;
}

export interface BrasilDDD {
  state: string;
  cities: string[];
}

export async function getCNPJ(cnpj: string): Promise<BrasilCNPJ> {
  const cleaned = cnpj.replace(/\D/g, '');
  const url = `${BRASILAPI_BASE}/cnpj/v1/${cleaned}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error('CNPJ não encontrado');
    throw new Error(`BrasilAPI CNPJ error: ${res.status}`);
  }
  return res.json();
}

export async function getCEP(cep: string): Promise<BrasilCEP> {
  const cleaned = cep.replace(/\D/g, '');
  const url = `${BRASILAPI_BASE}/cep/v2/${cleaned}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error('CEP não encontrado');
    throw new Error(`BrasilAPI CEP error: ${res.status}`);
  }
  return res.json();
}

export async function getHolidays(year: number = new Date().getFullYear()): Promise<BrasilHoliday[]> {
  const url = `${BRASILAPI_BASE}/feriados/v1/${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BrasilAPI holidays error: ${res.status}`);
  return res.json();
}

export async function getDDD(ddd: string): Promise<BrasilDDD> {
  const url = `${BRASILAPI_BASE}/ddd/v1/${ddd.replace(/\D/g, '')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BrasilAPI DDD error: ${res.status}`);
  return res.json();
}

export async function getIBGEStates(): Promise<{ sigla: string; nome: string }[]> {
  const url = `${BRASILAPI_BASE}/ibge/uf/v1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BrasilAPI IBGE states error: ${res.status}`);
  return res.json();
}

export async function getIBGECities(state: string): Promise<{ nome: string; codigo_ibge: string }[]> {
  const url = `${BRASILAPI_BASE}/ibge/municipios/v1/${state}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BrasilAPI IBGE cities error: ${res.status}`);
  return res.json();
}

export async function getBankList(): Promise<{ ispb: string; name: string; code: number; fullName: string }[]> {
  const url = `${BRASILAPI_BASE}/banks/v1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BrasilAPI banks error: ${res.status}`);
  return res.json();
}
