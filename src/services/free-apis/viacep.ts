const VIACEP_BASE = 'https://viacep.com.br/ws';

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function getAddressByCEP(cep: string): Promise<ViaCEPResponse> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) throw new Error('CEP deve ter 8 dígitos');

  const url = `${VIACEP_BASE}/${cleaned}/json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ViaCEP error: ${res.status}`);

  const data: ViaCEPResponse = await res.json();
  if (data.erro) throw new Error('CEP não encontrado');
  return data;
}
