const SGS_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';
const BINANCE_BASE = 'https://api.binance.com/api/v3';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const BRAPI_BASE = 'https://brapi.dev/api';

function maskToken(token: string | undefined): string {
  if (!token) return '(not set)';
  if (token.length <= 8) return token.slice(0, 2) + '***';
  return token.slice(0, 4) + '***' + token.slice(-4);
}

async function testBcb(symbol: string, codigo: number) {
  const url = `${SGS_BASE}.${codigo}/dados/ultimos/1?formato=json`;
  console.log(`\n--- BCB ${symbol} (cod ${codigo}) ---`);
  console.log(`URL: ${url}`);
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Response (first 300 chars): ${text.slice(0, 300)}`);
    if (!res.ok) {
      console.log(`ERROR: HTTP ${res.status}`);
      return null;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.log(`ERROR: invalid JSON`);
      return null;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.log(`ERROR: unexpected format: ${JSON.stringify(parsed).slice(0, 200)}`);
      return null;
    }
    const last = parsed[parsed.length - 1];
    const valor = last?.valor;
    const data = last?.data;
    const price = valor ? Number(valor) : null;
    console.log(`Item: data=${data} valor=${valor} price=${price}`);
    return price;
  } catch (err) {
    console.log(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function testBcbAll() {
  const indicators = [
    { symbol: 'USD/BRL', codigo: 10813 },
    { symbol: 'SELIC', codigo: 4189 },
    { symbol: 'CDI', codigo: 4389 },
    { symbol: 'IPCA', codigo: 10844 },
  ];
  for (const ind of indicators) {
    await testBcb(ind.symbol, ind.codigo);
  }
}

async function testBinance(pair: string, label: string) {
  const url = `${BINANCE_BASE}/ticker/24hr?symbol=${pair}`;
  console.log(`\n--- BINANCE ${label} (${pair}) ---`);
  console.log(`URL: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Response (first 300 chars): ${text.slice(0, 300)}`);
    if (!res.ok) {
      console.log(`ERROR: HTTP ${res.status}`);
      return null;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.log(`ERROR: invalid JSON`);
      return null;
    }
    const lastPrice = parsed?.lastPrice;
    const changePercent = parsed?.priceChangePercent;
    console.log(`Item: lastPrice=${lastPrice} priceChangePercent=${changePercent}`);
    return { price: Number(lastPrice), changePercent: Number(changePercent) };
  } catch (err) {
    console.log(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function testBinanceAll() {
  await testBinance('BTCBRL', 'BTC');
  await testBinance('ETHBRL', 'ETH');
  await testBinance('SOLBRL', 'SOL');
}

async function testCoinGecko() {
  const url = `${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl&include_24hr_change=true`;
  console.log(`\n--- COINGECKO ---`);
  console.log(`URL: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Response (first 300 chars): ${text.slice(0, 300)}`);
    if (!res.ok) {
      console.log(`ERROR: HTTP ${res.status}`);
      return null;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.log(`ERROR: invalid JSON`);
      return null;
    }
    console.log(`Item: ${JSON.stringify(parsed).slice(0, 200)}`);
    return parsed;
  } catch (err) {
    console.log(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function testOneBrapi(symbol: string) {
  const token = process.env.BRAPI_TOKEN;
  const url = `${BRAPI_BASE}/quote/${symbol}`;
  console.log(`\n--- BRAPI ${symbol} ---`);
  console.log(`URL: ${url}`);
  console.log(`Auth: ${token ? `Bearer ${maskToken(token)}` : '(none)'}`);
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log(`Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Response (first 300 chars): ${text.slice(0, 300)}`);
    if (!res.ok) return null;
    let parsed;
    try { parsed = JSON.parse(text); } catch { console.log(`ERROR: invalid JSON`); return null; }
    const item = parsed?.results?.[0];
    if (!item) { console.log(`ERROR: empty result`); return null; }
    console.log(`Item: symbol=${item.symbol} price=${item.regularMarketPrice} change=${item.regularMarketChangePercent}`);
    return item;
  } catch (err) {
    console.log(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function testBrapi() {
  const tickers = ['PETR4.SA', 'VALE3.SA', 'ITUB4.SA', '^BVSP', 'BBAS3.SA', 'WEGE3.SA', 'MGLU3.SA', 'MXRF11.SA', 'AMZN', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOG', 'META'];
  const token = process.env.BRAPI_TOKEN;
  console.log(`\n--- BRAPI ---`);
  console.log(`BRAPI_TOKEN_PRESENT=${token ? 'true' : 'false'}`);
  console.log(`BRAPI_TOKEN_LENGTH=${token ? token.length : 0}`);
  const results = await Promise.allSettled(tickers.map((s) => testOneBrapi(s)));
  const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value !== null).length;
  console.log(`\n--- BRAPI SUMMARY ---`);
  console.log(`Requested: ${tickers.length}, Succeeded: ${succeeded}, Failed: ${tickers.length - succeeded}`);
  for (let i = 0; i < tickers.length; i++) {
    const r = results[i];
    const ok = r.status === 'fulfilled' && r.value !== null;
    console.log(`  ${ok ? '✅' : '❌'} ${tickers[i]}`);
  }
}

async function main() {
  console.log('=== DEBUG MARKET SOURCES ===');
  console.log(`Node version: ${process.version}`);
  console.log(`Time: ${new Date().toISOString()}`);

  await testBcbAll();
  await testBinanceAll();
  await testCoinGecko();
  await testBrapi();
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
