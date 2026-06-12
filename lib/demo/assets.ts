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

/**
 * Demo asset catalog — symbols, venues, and currencies match real listings.
 * Prices and daily moves are approximate snapshots (~Jun 2026 for US/KE; NGX May–Jun 2026).
 */
const ASSET_SEEDS: AssetSeed[] = [
  // US — NASDAQ / NYSE (15)
  { symbol: 'AAPL', name: 'Apple Inc.', price: 295.34, change: 3.85, changePercent: 1.32, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 390.03, change: -7.32, changePercent: -1.84, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 204.66, change: 4.32, changePercent: 2.16, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 568.39, change: -2.39, changePercent: -0.42, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', price: 488.45, change: 36.05, changePercent: 7.97, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 399.15, change: 8.71, changePercent: 2.23, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 357.77, change: 1.39, changePercent: 0.39, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', price: 81.27, change: -0.73, changePercent: -0.89, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 241.51, change: 3.51, changePercent: 1.47, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', price: 385.57, change: 13.47, changePercent: 3.62, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', price: 975.69, change: -7.68, changePercent: -0.78, market: 'XNAS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 313.49, change: 4.35, changePercent: 1.41, market: 'XNYS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'V', name: 'Visa Inc.', price: 319.05, change: -3.91, changePercent: -1.21, market: 'XNYS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'DIS', name: 'The Walt Disney Company', price: 100.34, change: 1.73, changePercent: 1.75, market: 'XNYS', currency: 'USD', country: 'US', class: 'equity' },
  { symbol: 'WMT', name: 'Walmart Inc.', price: 120.5, change: -0.09, changePercent: -0.07, market: 'XNYS', currency: 'USD', country: 'US', class: 'equity' },
  // Nigeria — NGX / XNSA (10)
  { symbol: 'MTNN', name: 'MTN Nigeria Communications Plc', price: 793.0, change: 3.0, changePercent: 0.38, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'DANGCEM', name: 'Dangote Cement Plc', price: 1180.0, change: 25.0, changePercent: 2.16, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'GTCO', name: 'Guaranty Trust Holding Company Plc', price: 136.0, change: 4.85, changePercent: 3.7, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'ZENITHBANK', name: 'Zenith Bank Plc', price: 129.0, change: -1.09, changePercent: -0.84, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'AIRTELAFRI', name: 'Airtel Africa Plc', price: 3655.7, change: 12.5, changePercent: 0.34, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'BUACEMENT', name: 'BUA Cement Plc', price: 414.0, change: 10.9, changePercent: 2.71, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'BUAFOODS', name: 'BUA Foods PLC', price: 967.0, change: 0, changePercent: 0, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'SEPLAT', name: 'Seplat Energy Plc', price: 11495.0, change: 125.0, changePercent: 1.1, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'UBA', name: 'United Bank for Africa Plc', price: 43.3, change: 0.2, changePercent: 0.46, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  { symbol: 'ACCESSCORP', name: 'Access Holdings Plc', price: 24.0, change: -0.55, changePercent: -2.29, market: 'XNSA', currency: 'NGN', country: 'NG', class: 'equity' },
  // Kenya — NSE / XNAI (5)
  { symbol: 'SCOM', name: 'Safaricom PLC', price: 31.1, change: -0.1, changePercent: -0.32, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
  { symbol: 'EQTY', name: 'Equity Group Holdings Plc', price: 75.5, change: 0.25, changePercent: 0.33, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
  { symbol: 'KCB', name: 'KCB Group PLC', price: 69.25, change: 0, changePercent: 0, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
  { symbol: 'EABL', name: 'East African Breweries PLC', price: 253.0, change: 4.0, changePercent: 1.61, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
  { symbol: 'BAT', name: 'British American Tobacco Kenya Plc', price: 517.0, change: -0.98, changePercent: -0.19, market: 'XNAI', currency: 'KES', country: 'KE', class: 'equity' },
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

/** Default watchlist when the user has no saved symbols. */
export const DEFAULT_WATCHLIST_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'META', 'MSFT'] as const;

const MARKET_MOVER_GAINER_SYMBOLS = ['AMD', 'AVGO', 'DIS', 'MTNN', 'AMZN'] as const;
const MARKET_MOVER_LOSER_SYMBOLS = ['MSFT', 'V', 'NFLX', 'ACCESSCORP', 'COST'] as const;

export function getDemoMarketMoverSymbols(): string[] {
  return [...MARKET_MOVER_GAINER_SYMBOLS, ...MARKET_MOVER_LOSER_SYMBOLS];
}

export function getDemoMarketMovers(): { gainers: MarketDataAsset[]; losers: MarketDataAsset[] } {
  return {
    gainers: getDemoAssetsBatch([...MARKET_MOVER_GAINER_SYMBOLS]),
    losers: getDemoAssetsBatch([...MARKET_MOVER_LOSER_SYMBOLS]),
  };
}

export function getDemoWatchlistQuotes(symbols: readonly string[]): MarketDataAsset[] {
  return getDemoAssetsBatch([...symbols]);
}
