import type {
  DepositMethod,
  ExternalDepositResponse,
  ExternalWithdrawalResponse,
  OrderRequest,
  WithdrawalMethod,
} from '@/lib/bluum-api.types';
import { unwrapList } from '@/lib/utils';
import { TransferService } from '@/services/transfer.service';

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(typeof error.error === 'string' ? error.error : error.error?.message || 'An error occurred');
  }
  return response.json();
}

export interface Position {
  symbol: string;
  name: string;
  currency: string;
  shares: number;
  currentPrice: number;
  purchasePrice: number;
  value: number;
  gain: number;
  gainPercent: number;
}

export interface AssetQuote {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  previousClose?: number;
  bidPrice?: number;
  askPrice?: number;
}

function mapPositionRow(pos: Record<string, unknown>): Position {
  const shares = parseFloat(String(pos.quantity ?? 0)) || 0;
  const toNum = (v: unknown) => (v != null && v !== '' ? parseFloat(String(v)) : 0) || 0;
  return {
    symbol: String(pos.symbol ?? ''),
    name: String(pos.symbol ?? ''),
    currency: String(pos.currency ?? 'USD'),
    shares,
    currentPrice: pos.current_price != null && pos.current_price !== '' ? parseFloat(String(pos.current_price)) : 0,
    purchasePrice: pos.average_cost_basis != null && pos.average_cost_basis !== '' ? parseFloat(String(pos.average_cost_basis)) : 0,
    value: shares === 0 ? 0 : pos.market_value != null && pos.market_value !== '' ? parseFloat(String(pos.market_value)) : 0,
    gain: pos.unrealized_pl != null && pos.unrealized_pl !== '' ? parseFloat(String(pos.unrealized_pl)) : 0,
    gainPercent: pos.unrealized_pl_percent != null && pos.unrealized_pl_percent !== '' ? parseFloat(String(pos.unrealized_pl_percent)) : 0,
  };
}

// Investment Service
export class InvestmentService {
  // Positions API (Holdings)
  static async getPositions(accountId: string): Promise<Position[]> {
    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/positions`);
    const raw = await handleResponse<unknown>(response);
    const rows = unwrapList<Record<string, unknown>>(raw);
    return rows.map((pos) => mapPositionRow(pos));
  }

  // Assets API
  static async searchAssets(query: string): Promise<any[]> {
    const response = await fetch(`/api/bluum/assets/search?q=${encodeURIComponent(query)}&limit=50`);
    const raw = await handleResponse<unknown>(response);
    return unwrapList(raw);
  }

  static async getAssetBySymbol(symbol: string, params?: { market?: string }): Promise<any> {
    const qs = params?.market ? `?market=${encodeURIComponent(params.market)}` : '';
    const response = await fetch(`/api/bluum/assets/${encodeURIComponent(symbol)}${qs}`);
    const data = await handleResponse<{ data?: any } | any>(response);
    if (data && typeof data === 'object' && 'data' in data && data.data !== undefined) {
      return data.data;
    }
    return data;
  }

  static async getAssetQuotes(symbols: string[]): Promise<AssetQuote[]> {
    const response = await fetch(`/api/bluum/market-data/assets?symbols=${encodeURIComponent(symbols.join(','))}`);
    const raw = await handleResponse<unknown>(response);
    const list = unwrapList<AssetQuote>(raw);
    const merged =
      list.length > 0 ? list : (raw as { data?: AssetQuote[]; quotes?: AssetQuote[] } | null)?.data ??
      (raw as { data?: AssetQuote[]; quotes?: AssetQuote[] } | null)?.quotes ??
      [];
    const bySymbol = new Map<string, AssetQuote>();
    for (const q of merged) {
      const sym = (q.symbol ?? '').toUpperCase();
      if (!sym) continue;
      if (!bySymbol.has(sym)) bySymbol.set(sym, { ...q, symbol: sym });
    }
    return Array.from(bySymbol.values());
  }

  static async getChartData(symbol: string, timeframe: string = '1Day', limit: number = 100): Promise<any> {
    const qs = new URLSearchParams({
      symbol,
      timeframe,
      limit: String(limit),
    });
    const response = await fetch(`/api/bluum/assets/chart?${qs}`);
    return handleResponse(response);
  }

  // Trading API
  static async placeOrder(accountId: string, orderData: OrderRequest): Promise<any> {
    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  }

  static async getOrders(
    accountId: string,
    params?: {
      status?: string;
      symbol?: string;
      side?: 'buy' | 'sell';
      limit?: number;
    }
  ): Promise<any[]> {
    const queryParams = new URLSearchParams({
      ...(params?.status && { status: params.status }),
      ...(params?.symbol && { symbol: params.symbol }),
      ...(params?.side && { side: params.side }),
      ...(params?.limit && { limit: params.limit.toString() }),
    });

    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/orders?${queryParams}`);
    const raw = await handleResponse<unknown>(response);
    return unwrapList(raw);
  }

  // Deposits API
  static async createDeposit(depositData: {
    account_id: string;
    amount: string;
    currency: string;
    method: DepositMethod;
    description?: string;
    manual_options?: Record<string, unknown>;
    wire_options?: Record<string, unknown>;
    idempotency_key?: string;
    funding_source_id?: string;
  }): Promise<ExternalDepositResponse> {
    const { account_id, ...rest } = depositData;
    return TransferService.createDeposit(account_id, rest);
  }

  // Withdrawals API
  static async createWithdrawal(withdrawalData: {
    account_id: string;
    amount: string;
    currency: string;
    method: WithdrawalMethod;
    description?: string;
    wire_options?: Record<string, unknown>;
    idempotency_key?: string;
    funding_source_id?: string;
  }): Promise<ExternalWithdrawalResponse> {
    const { account_id, ...rest } = withdrawalData;
    return TransferService.createWithdrawal(account_id, rest);
  }

  static async getTransactions(
    accountId: string,
    params?: {
      type?: 'deposit' | 'withdrawal';
      status?: string;
      limit?: number;
    }
  ): Promise<any[]> {
    const queryParams = new URLSearchParams({
      ...(params?.type && { type: params.type }),
      ...(params?.status && { status: params.status }),
      ...(params?.limit && { limit: params.limit.toString() }),
    });

    const response = await fetch(
      `/api/bluum/investors/${encodeURIComponent(accountId)}/transactions?${queryParams}`
    );
    const raw = await handleResponse<unknown>(response);
    return unwrapList(raw);
  }

  // Helper function to calculate portfolio totals from positions
  static calculatePortfolioTotals(positions: Position[]): {
    balance: number;
    totalGain: number;
    totalGainPercent: number;
  } {
    const balance = positions.reduce((sum, pos) => sum + pos.value, 0);
    const totalGain = positions.reduce((sum, pos) => sum + pos.gain, 0);
    const totalCost = positions.reduce((sum, pos) => sum + pos.purchasePrice * pos.shares, 0);
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return {
      balance,
      totalGain,
      totalGainPercent,
    };
  }
}
