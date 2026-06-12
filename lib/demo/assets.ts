import type { AssetClass, MarketDataAsset } from '@/lib/bluum-api.types';
import { getMarketByMic } from '@/lib/market';

type AssetSeed = {
  symbol: string;
  name: string;
  price: number;
  change?: number;
  changePercent?: number;
  market: string;
  currency: string;
  country: string;
  class?: AssetClass;
};

const ASSET_SEEDS: AssetSeed[] = [
  // US — NASDAQ (5)
  { symbol: 'AAPL', name: 'Apple Inc.', price: 176.35, change: 2.12, changePercent: 1.2, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 380.25, change: 5.32, changePercent: 1.4, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'NVDA', name: 'Nvidia Corp.', price: 501.12, change: 17.04, changePercent: 3.5, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'META', name: 'Meta Platforms', price: 312.45, change: 13.12, changePercent: 4.2, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'AMD', name: 'AMD Inc.', price: 115.2, change: 3.23, changePercent: 2.8, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  // US — NYSE (extras for movers / watchlist)
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 250.65, change: -2.01, changePercent: -0.8, market: 'XNYS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.3, change: -4.12, changePercent: -2.9, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'NFLX', name: 'Netflix', price: 420.1, change: -5.04, changePercent: -1.2, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  // Nigeria — NGX (5)
  { symbol: 'MTNN', name: 'MTN Nigeria', price: 185.0, change: 4.5, changePercent: 2.5, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'DANGCEM', name: 'Dangote Cement', price: 285.5, change: -3.2, changePercent: -1.1, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'GTCO', name: 'GTCO Plc', price: 42.85, change: 0.65, changePercent: 1.54, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'ZENITHBANK', name: 'Zenith Bank', price: 38.2, change: 0.45, changePercent: 1.19, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'AIRTELAFRI', name: 'Airtel Africa', price: 2100.0, change: 35.0, changePercent: 1.69, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  // Kenya — NSE (5)
  { symbol: 'SCOM', name: 'Safaricom', price: 28.5, change: 0.35, changePercent: 1.24, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
  { symbol: 'EQTY', name: 'Equity Group Holdings', price: 52.75, change: -0.85, changePercent: -1.59, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
  { symbol: 'KCB', name: 'KCB Group', price: 48.3, change: 0.6, changePercent: 1.26, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
  { symbol: 'EABL', name: 'East African Breweries', price: 185.0, change: 2.5, changePercent: 1.37, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
  { symbol: 'BAT', name: 'BAT Kenya', price: 415.0, change: -5.0, changePercent: -1.19, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
];

function catalogKey(symbol: string, market: string): string {
  return `${symbol.trim().toUpperCase()}|${market}`;
}

function toMarketDataAsset(seed: AssetSeed): MarketDataAsset {
  const spread = seed.price * 0.001;
  const marketEntry = getMarketByMic(seed.market);
  return {
    id: `asset_${seed.symbol.toLowerCase()}_${seed.market.toLowerCase()}`,
    object: 'asset',
    livemode: false,
    symbol: seed.symbol,
    name: seed.name,
    display_name: seed.name,
    class: seed.class ?? 'equity',
    country: seed.country,
    market: seed.market,
    market_name: marketEntry?.exchange,
    currency: seed.currency,
    price: seed.price,
    change: seed.change ?? 0,
    changePercent: seed.changePercent ?? 0,
    previousClose: seed.price - (seed.change ?? 0),
    bidPrice: seed.price - spread / 2,
    askPrice: seed.price + spread / 2,
    tradable: true,
  };
}

const CATALOG = new Map(ASSET_SEEDS.map((s) => [catalogKey(s.symbol, s.market), toMarketDataAsset(s)]));

const SYMBOL_INDEX = new Map<string, MarketDataAsset[]>();
for (const seed of ASSET_SEEDS) {
  const upper = seed.symbol.toUpperCase();
  const list = SYMBOL_INDEX.get(upper) ?? [];
  list.push(toMarketDataAsset(seed));
  SYMBOL_INDEX.set(upper, list);
}

const MARKET_PRIORITY = ['XNAS', 'XNYS', 'XNSA', 'XNAI'];

function resolveListing(symbol: string, market?: string): MarketDataAsset | undefined {
  const upper = symbol.trim().toUpperCase();
  if (market) {
    return CATALOG.get(catalogKey(upper, market));
  }
  const listings = SYMBOL_INDEX.get(upper);
  if (!listings?.length) return undefined;
  if (listings.length === 1) return listings[0];
  return (
    [...listings].sort((a, b) => {
      const ai = MARKET_PRIORITY.indexOf(a.market ?? '');
      const bi = MARKET_PRIORITY.indexOf(b.market ?? '');
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })[0] ?? listings[0]
  );
}

export function getDemoAssetBySymbol(symbol: string, market?: string): MarketDataAsset {
  const asset = resolveListing(symbol, market);
  if (!asset) {
    const hint = market ? ` on market ${market}` : '';
    throw new Error(`Asset "${symbol.toUpperCase()}"${hint} not found.`);
  }
  return { ...asset };
}

export function getDemoAssetsBatch(symbols: string[], market?: string): MarketDataAsset[] {
  const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))];
  return unique.map((sym) => getDemoAssetBySymbol(sym, market));
}

export function getDemoAssetPrice(symbol: string, market?: string): number | null {
  return resolveListing(symbol, market)?.price ?? null;
}

export function getAllDemoAssets(): MarketDataAsset[] {
  return [...CATALOG.values()].map((a) => ({ ...a }));
}
