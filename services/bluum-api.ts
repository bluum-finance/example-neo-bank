import axios, { AxiosInstance, AxiosError } from 'axios';

const BLUUM_API_BASE_URL =
  process.env.BLUUM_API_BASE_URL || 'https://sandbox.api.bluum.finance/v1';
const BLUUM_API_KEY =
  process.env.BLUUM_API_KEY ||
  'test_bluum_f9ff3f567b9a558ecae2920e26670d6d7890e4c4425e8f39ea216b573c1940cc';
const BLUUM_SECRET_KEY =
  process.env.BLUUM_SECRET_KEY ||
  '061ee6a8010f0303bc9954fb4931b154f84721b47f0dbef2becad4629d7e01ce';

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

  async listAccounts() {
    const response = await this.client.get('/accounts');
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
    }
  ) {
    const response = await this.client.get(`/trading/accounts/${accountId}/positions`, {
      params,
    });
    return response.data;
  }

  async getPosition(accountId: string, positionId: string) {
    const response = await this.client.get(
      `/trading/accounts/${accountId}/positions/${positionId}`
    );
    return response.data;
  }

  // Wallet
  async fundAccount(accountId: string, fundData: any) {
    const response = await this.client.post(`/wallet/accounts/${accountId}/funding`, fundData);
    return response.data;
  }

  async listTransactions(
    accountId: string,
    params?: {
      type?: 'deposit' | 'withdrawal';
      status?: 'pending' | 'processing' | 'settled' | 'failed' | 'canceled';
      funding_type?: 'fiat' | 'crypto';
      date_from?: string;
      date_to?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const response = await this.client.get(`/wallet/accounts/${accountId}/transactions`, {
      params,
    });
    return response.data;
  }

  async withdrawFunds(withdrawalData: any) {
    const response = await this.client.post('/wallet/withdrawals', withdrawalData);
    return response.data;
  }
}

export const bluumApi = new BluumApiClient();

