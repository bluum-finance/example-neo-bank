import type {
  MarketDataAsset,
  Order,
  OrderListStatus,
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

  /** `GET /v1/assets/batch` — comma-separated symbols (max 20 per request), optional market hint. */
  static async getAssetsBatch(symbols: string[], params?: { market?: string }): Promise<MarketDataAsset[]> {
    const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, 20);
    if (unique.length === 0) return [];

    const qs = new URLSearchParams({ symbols: unique.join(',') });
    if (params?.market) qs.set('market', params.market);

    const response = await fetch(`/api/bluum/assets/batch?${qs.toString()}`);
    const raw = await handleResponse<unknown>(response);
    return unwrapList<unknown>(raw).map((item) => unwrapResource<MarketDataAsset>(item));
  }

  static async getAssetQuotes(symbols: string[], params?: { market?: string }): Promise<MarketDataAsset[]> {
    const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))];
    if (unique.length === 0) return [];

    const quotes: MarketDataAsset[] = [];
    for (let i = 0; i < unique.length; i += 20) {
      const chunk = unique.slice(i, i + 20);
      const batch = await this.getAssetsBatch(chunk, params);
      quotes.push(...batch);
    }
    return quotes;
  }

  static async getOrders(
    accountId: string,
    params?: { limit?: number; offset?: number; status?: OrderListStatus; symbol?: string }
  ): Promise<Order[]> {
    const qs = new URLSearchParams();
    if (params?.limit != null) qs.set('limit', String(params.limit));
    if (params?.offset != null) qs.set('offset', String(params.offset));
    if (params?.status) qs.set('status', params.status);
    if (params?.symbol) qs.set('symbol', params.symbol);
    const query = qs.toString();
    const response = await fetch(
      `/api/bluum/investors/${encodeURIComponent(accountId)}/orders${query ? `?${query}` : ''}`
    );
    const raw = await handleResponse<unknown>(response);
    return unwrapList<Order>(raw);
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
