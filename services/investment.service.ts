import type {
  MarketDataAsset,
  Order,
  OrderRequest,
  Position,
} from '@/lib/bluum-api.types';
import { unwrapList, unwrapResource } from '@/lib/utils';

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
    const response = await fetch(`/api/bluum/assets/${encodeURIComponent(symbol)}${qs}`);
    const raw = await handleResponse<unknown>(response);
    return unwrapResource<MarketDataAsset>(raw);
  }

  static async getAssetQuotes(symbols: string[]): Promise<MarketDataAsset[]> {
    const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))];
    const results = await Promise.allSettled(unique.map((symbol) => this.getAssetBySymbol(symbol)));
    return results
      .filter((r): r is PromiseFulfilledResult<MarketDataAsset> => r.status === 'fulfilled')
      .map((r) => r.value);
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
