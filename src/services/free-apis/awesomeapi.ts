const AWESOMEAPI_BASE = 'https://economia.awesomeapi.com.br';

export interface AwesomeCurrencyRate {
  code: string;
  codein: string;
  name: string;
  high: string;
  low: string;
  pctChange: string;
  bid: string;
  ask: string;
  timestamp: string;
  create_date: string;
}

export interface AwesomeResponse {
  [currencyPair: string]: AwesomeCurrencyRate[];
}

export async function getCurrencyRates(currencies: string[] = ['USD', 'EUR', 'GBP', 'ARS', 'BTC']): Promise<AwesomeResponse> {
  const pairs = currencies.map(c => `${c}-BRL`).join(',');
  const url = `${AWESOMEAPI_BASE}/json/${pairs}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`AwesomeAPI error: ${res.status}`);
  return res.json();
}

export async function getCurrencyRate(currency: string): Promise<AwesomeCurrencyRate> {
  const data = await getCurrencyRates([currency]);
  const pair = `${currency}-BRL`;
  const rates = data[pair];
  if (!rates?.length) throw new Error(`Moeda ${currency} não encontrada`);
  return rates[0];
}

export async function getHistoricalRates(currency: string, days: number = 30): Promise<{ date: string; bid: number }[]> {
  const url = `${AWESOMEAPI_BASE}/json/daily/${currency}-BRL/${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AwesomeAPI historical error: ${res.status}`);
  const data = await res.json();
  return data.map((item: any) => ({
    date: item.timestamp ? new Date(Number(item.timestamp) * 1000).toISOString().split('T')[0] : item.create_date?.split(' ')[0],
    bid: Number(item.bid),
  }));
}
