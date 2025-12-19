import { API_BASE_URL } from '~/lib/constants';

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(
      typeof error.error === 'string'
        ? error.error
        : error.error?.message || 'An error occurred'
    );
  }
  return response.json();
}

export interface Position {
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  purchasePrice: number;
  value: number;
  gain: number;
  gainPercent: number;
}

export interface OrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  qty?: string;
  notional?: string;
  limit_price?: string;
  stop_price?: string;
  extended_hours?: boolean;
}

export interface FundRequest {
  amount: string;
  currency: string;
  funding_type: 'fiat' | 'crypto';
  account_id: string;
}

// Investment Service
export class InvestmentService {
  // Positions API (Holdings)
  static async getPositions(accountId: string): Promise<Position[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/investment/positions?account_id=${encodeURIComponent(accountId)}`
    );
    return handleResponse<Position[]>(response);
  }

  // Assets API
  static async searchAssets(query: string): Promise<any[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/investment/assets/search?q=${encodeURIComponent(query)}&limit=50`
    );
    const data = await handleResponse<{ data?: any[]; count?: number }>(response);
    return Array.isArray(data) ? data : data.data || [];
  }

  static async getAssetBySymbol(symbol: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/api/investment/assets/${encodeURIComponent(symbol)}`
    );
    const data = await handleResponse<{ data?: any }>(response);
    return data.data || data;
  }

  static async getChartData(
    symbol: string,
    timeframe: string = '1Day',
    limit: number = 100
  ): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/api/investment/assets/${encodeURIComponent(symbol)}/chart?timeframe=${timeframe}&limit=${limit}`
    );
    return handleResponse(response);
  }

  // Trading API
  static async placeOrder(accountId: string, orderData: OrderRequest): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/investment/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        account_id: accountId,
      }),
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
      account_id: accountId,
      ...(params?.status && { status: params.status }),
      ...(params?.symbol && { symbol: params.symbol }),
      ...(params?.side && { side: params.side }),
      ...(params?.limit && { limit: params.limit.toString() }),
    });

    const response = await fetch(`${API_BASE_URL}/api/investment/orders?${queryParams}`);
    return handleResponse<any[]>(response);
  }

  // Wallet API
  static async fundAccount(fundData: FundRequest): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/investment/funding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fundData),
    });
    return handleResponse(response);
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
      account_id: accountId,
      ...(params?.type && { type: params.type }),
      ...(params?.status && { status: params.status }),
      ...(params?.limit && { limit: params.limit.toString() }),
    });

    const response = await fetch(`${API_BASE_URL}/api/investment/transactions?${queryParams}`);
    return handleResponse<any[]>(response);
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
