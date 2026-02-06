import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Bluum API Client
 *
 * - Use in: app/api route.ts files (server-side only)
 * - Never import this module in client components or client-side code
 */
const BLUUM_API_BASE_URL =
  process.env.BLUUM_API_BASE_URL || 'https://test-service.bluumfinance.com/v1';
const BLUUM_API_KEY = process.env.BLUUM_API_KEY || '';
const BLUUM_SECRET_KEY = process.env.BLUUM_SECRET_KEY || '';

class BluumApiClient {
  private client: AxiosInstance;

  constructor() {
    // Create base64 encoded credentials for Basic Auth
    const credentials = Buffer.from(`${BLUUM_API_KEY}:${BLUUM_SECRET_KEY}`).toString('base64');

    this.client = axios.create({
      baseURL: BLUUM_API_BASE_URL,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          console.error('Bluum API Error:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  // Account Management
  async createAccount(data: any) {
    const response = await this.client.post('/accounts', data);
    return response.data;
  }

  async getAccount(accountId: string) {
    const response = await this.client.get(`/accounts/${accountId}`);
    return response.data;
  }

  // Asset Management
  async searchAssets(params: {
    q?: string;
    status?: 'active' | 'inactive';
    asset_class?: 'us_equity' | 'crypto' | 'us_option';
    limit?: number;
  }) {
    const response = await this.client.get('/assets/search', { params });
    return response.data;
  }

  async listAssets(params?: {
    status?: 'active' | 'inactive';
    asset_class?: 'us_equity' | 'crypto' | 'us_option';
    tradable?: boolean;
  }) {
    const response = await this.client.get('/assets/list', { params });
    return response.data;
  }

  async getAssetBySymbol(symbol: string) {
    const response = await this.client.get(`/assets/${symbol}`);
    return response.data;
  }

  async getChartData(params: {
    symbol: string;
    timeframe: '1Min' | '5Min' | '15Min' | '30Min' | '1Hour' | '1Day' | '1Week' | '1Month';
    start?: string;
    end?: string;
    limit?: number;
    adjustment?: 'raw' | 'split' | 'dividend' | 'all';
    feed?: 'iex' | 'sip' | 'otc';
  }) {
    const response = await this.client.get('/assets/chart', { params });
    return response.data;
  }

  // Trading
  async placeOrder(accountId: string, orderData: any) {
    const response = await this.client.post(
      `/trading/accounts/${accountId}/orders`,
      orderData
    );
    return response.data;
  }

  async listOrders(
    accountId: string,
    params?: {
      status?: 'accepted' | 'filled' | 'partially_filled' | 'canceled' | 'rejected';
      symbol?: string;
      side?: 'buy' | 'sell';
      limit?: number;
      offset?: number;
    }
  ) {
    const response = await this.client.get(`/trading/accounts/${accountId}/orders`, {
      params,
    });
    return response.data;
  }

  async getOrder(orderId: string) {
    const response = await this.client.get(`/trading/orders/${orderId}`);
    return response.data;
  }

  // Positions
  async listPositions(
    accountId: string,
    params?: {
      symbol?: string;
      non_zero_only?: boolean;
      refresh_prices?: boolean;
    }
  ) {
    const response = await this.client.get(`/trading/accounts/${accountId}/positions`, {
      params,
    });
    return response.data;
  }

  async listTransactions(
    accountId: string,
    params?: {
      type?: 'deposit' | 'withdrawal';
      status?: 'pending' | 'processing' | 'received' | 'completed' | 'submitted' | 'expired' | 'canceled' | 'failed';
      currency?: string;
      date_from?: string;
      date_to?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const response = await this.client.get(`/accounts/${accountId}/transactions`, {
      params,
    });
    return response.data.transactions;
  }


  // Plaid Integration
  async getPlaidLinkToken(accountId: string, body: Record<string, any> = {}) {
    const response = await this.client.post(`/accounts/${accountId}/funding-sources/plaid/link-token`, body);
    return response.data;
  }

  async connectPlaidFundingSource(accountId: string, data: Record<string, any>) {
    const response = await this.client.post(`/accounts/${accountId}/funding-sources/plaid/connect`, data);
    return response.data;
  }

  // Deposits
  async createDeposit(
    accountId: string,
    depositData: {
      amount: string;
      currency?: string;
      method: 'ach_plaid' | 'manual_bank_transfer' | 'wire';
      description?: string;
      plaid_options?: {
        public_token?: string;
        item_id?: string;
        account_id?: string;
      };
    },
    idempotencyKey?: string
  ) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.post(`/accounts/${accountId}/deposits`, depositData, {
      headers,
    });
    return response.data;
  }

  // Withdrawals
  async createWithdrawal(
    accountId: string,
    withdrawalData: {
      amount: string;
      currency?: string;
      method: 'ach_plaid' | 'wire';
      description?: string;
      plaid_options: {
        item_id: string;
        account_id: string;
      };
    },
    idempotencyKey?: string
  ) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.post(`/accounts/${accountId}/withdrawals`, withdrawalData, {
      headers,
    });
    return response.data;
  }

  async getFundingSources(accountId: string, type: 'plaid' | 'all' = 'plaid') {
    const response = await this.client.get(`/accounts/${accountId}/funding-sources`, {
      params: { type },
    });
    return response.data;
  }

  async disconnectPlaidItem(accountId: string, fundingSourceId: string) {
    const response = await this.client.delete(
      `/accounts/${accountId}/funding-sources/${fundingSourceId}`
    );
    return response.data;
  }

  // Wealth Management - Goals
  async getGoals(
    accountId: string,
    params?: {
      status?: 'active' | 'completed' | 'archived';
      goal_type?: string;
      include_projections?: boolean;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/goals`, { params });
    return response.data.goals || [];
  }

  // Wealth Management - Investment Policy
  async getInvestmentPolicy(
    accountId: string,
    params?: {
      version?: string;
      include_history?: boolean;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/investment-policy`, {
      params,
    });
    return response.data;
  }

  // Wealth Management - Insights
  async getInsights(
    accountId: string,
    params?: {
      category?: 'all' | 'opportunity' | 'risk' | 'tax' | 'rebalancing';
      limit?: number;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/insights`, { params });
    return response.data.insights || [];
  }

  // Wealth Management - Recommendations
  async getRecommendations(
    accountId: string,
    params?: {
      type?: 'allocation' | 'security' | 'strategy' | 'all';
      goal_id?: string;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/recommendations`, {
      params,
    });
    return response.data.recommendations || [];
  }

  // Wealth Management - Portfolio Performance
  async getPortfolioPerformance(
    accountId: string,
    portfolioId: string,
    params?: {
      period?: '1d' | '1w' | '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | 'all';
      start_date?: string;
      end_date?: string;
      benchmark?: string;
    }
  ) {
    const response = await this.client.get(
      `/wealth/accounts/${accountId}/portfolios/${portfolioId}/performance`,
      { params }
    );
    return response.data;
  }

  // Wealth Management - Portfolio Summary
  async getPortfolioSummary(
    accountId: string,
    portfolioId: string,
    params?: {
      refresh_prices?: boolean;
    }
  ) {
    const response = await this.client.get(
      `/wealth/accounts/${accountId}/portfolios/${portfolioId}/summary`,
      { params }
    );
    return response.data;
  }

  // Wealth Management - Portfolio Holdings
  async getPortfolioHoldings(
    accountId: string,
    portfolioId: string,
    params?: {
      refresh_prices?: boolean;
      include_lots?: boolean;
      group_by?: 'asset_class' | 'sector' | 'none';
    }
  ) {
    const response = await this.client.get(
      `/wealth/accounts/${accountId}/portfolios/${portfolioId}/holdings`,
      { params }
    );
    return response.data;
  }

  // Wealth Management - AI Assistant Chat
  async chatWithAssistant(
    accountId: string,
    data: {
      message: string;
      context?: {
        portfolio_id?: string;
        include_positions?: boolean;
      };
    }
  ) {
    const response = await this.client.post(`/wealth/accounts/${accountId}/assistant/chat`, data);
    return response.data;
  }
}

export const bluumApi = new BluumApiClient();
