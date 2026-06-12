import type {
  MarketDataAsset,
  Order,
  OrderRequest,
  Position,
} from '@/lib/bluum-api.types';
import { unwrapList } from '@/lib/utils';

export type { MarketDataAsset as AssetQuote, Order, Position } from '@/lib/bluum-api.types';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(typeof error.error === 'string' ? error.error : error.error?.message || 'An error occurred');
  }
  return response.json();
}

function parseDecimal(value?: string | null): number {
  if (value == null || value === '') return 0;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export class InvestmentService {
  static async getPositions(accountId: string): Promise<Position[]> {
    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/positions`);
    const raw = await handleResponse<unknown>(response);
    return unwrapList<Position>(raw);
  }

  static async getAssetBySymbol(symbol: string, params?: { market?: string }): Promise<MarketDataAsset> {
    const qs = params?.market ? `?market=${encodeURIComponent(params.market)}` : '';
    const response = await fetch(`/api/bluum/market-data/assets/${encodeURIComponent(symbol)}${qs}`);
    return handleResponse<MarketDataAsset>(response);
  }

  static async getAssetQuotes(symbols: string[]): Promise<MarketDataAsset[]> {
    const response = await fetch(`/api/bluum/market-data/assets?symbols=${encodeURIComponent(symbols.join(','))}`);
    const raw = await handleResponse<unknown>(response);
    const bySymbol = new Map<string, MarketDataAsset>();
    for (const row of unwrapList<MarketDataAsset>(raw)) {
      const key = row.symbol?.toUpperCase();
      if (key && !bySymbol.has(key)) {
        bySymbol.set(key, row);
      }
    }
    return Array.from(bySymbol.values());
  }

  static async placeOrder(accountId: string, orderData: OrderRequest): Promise<Order> {
    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return handleResponse<Order>(response);
  }

  static calculatePortfolioTotals(positions: Position[]): {
    balance: number;
    totalGain: number;
    totalGainPercent: number;
  } {
    const balance = positions.reduce((sum, pos) => sum + parseDecimal(pos.market_value), 0);
    const totalGain = positions.reduce((sum, pos) => sum + parseDecimal(pos.unrealized_pl), 0);
    const totalCost = positions.reduce(
      (sum, pos) => sum + parseDecimal(pos.average_cost_basis) * parseDecimal(pos.quantity),
      0
    );
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return { balance, totalGain, totalGainPercent };
  }
}
