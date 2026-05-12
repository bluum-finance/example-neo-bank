import axios, { AxiosInstance, AxiosError, type AxiosRequestConfig } from 'axios';
import { config } from './config';
import { unwrapList } from './utils';

export { unwrapList } from './utils';

/**
 * Bluum API Client
 *
 * - Use in: app/api route.ts files (server-side only)
 * - Never import this module in client components or client-side code
 *
 * Paths are relative to `apiBaseUrl`, which should end in `/v1`.
 */
const BLUUM_API_BASE_URL = config.apiBaseUrl;
const BLUUM_API_KEY = config.apiKey;
const BLUUM_SECRET_KEY = config.secretKey;

class BluumApiClient {
  private client: AxiosInstance;

  constructor() {
    const credentials = Buffer.from(`${BLUUM_API_KEY}:${BLUUM_SECRET_KEY}`).toString('base64');

    this.client = axios.create({
      baseURL: BLUUM_API_BASE_URL,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => {
        console.info('Bluum API URL:', response.config.url);
        return response;
      },
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

  /**
   * Low-level forwarder for the dynamic API proxy. Does not throw on HTTP error status;
   * returns Bluum response body and status as-is.
   */
  async forward(config: AxiosRequestConfig): Promise<{ status: number; data: unknown }> {
    const response = await this.client.request({
      ...config,
      validateStatus: () => true,
    });
    return { status: response.status, data: response.data };
  }

  /** POST /investors/:investorId/compliance/restart */
  async restartComplianceWorkflow(investorId: string) {
    const response = await this.client.post(`/investors/${investorId}/compliance/restart`);
    return response.data;
  }

  async createAccount(data: unknown) {
    const response = await this.client.post('/investors', data);
    return response.data;
  }

  async getAccount(investorId: string) {
    const response = await this.client.get(`/investors/${investorId}`);
    return response.data;
  }

  async searchAssets(params: {
    q?: string;
    status?: 'active' | 'inactive';
    asset_class?: 'us_equity' | 'crypto' | 'us_option';
    limit?: number;
  }) {
    const response = await this.client.get('/assets/search', { params });
    return unwrapList(response.data);
  }

  async listAssets(params?: { status?: 'active' | 'inactive'; asset_class?: 'us_equity' | 'crypto' | 'us_option'; tradable?: boolean }) {
    const response = await this.client.get('/assets', { params });
    return unwrapList(response.data);
  }

  async getAssetBySymbol(symbol: string, params?: { market?: string }) {
    const response = await this.client.get(`/assets/${symbol}`, {
      params: params?.market ? { market: params.market } : undefined,
    });
    return response.data;
  }

  async getAssetQuotes(symbols: string[]) {
    const response = await this.client.get('/market-data/assets', {
      params: { symbols: symbols.join(',') },
    });
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

  async placeOrder(investorId: string, orderData: unknown) {
    const response = await this.client.post(`/investors/${investorId}/orders`, orderData);
    return response.data;
  }

  async listOrders(
    investorId: string,
    params?: {
      status?: 'accepted' | 'filled' | 'partially_filled' | 'canceled' | 'rejected';
      symbol?: string;
      side?: 'buy' | 'sell';
      limit?: number;
      offset?: number;
    }
  ) {
    const response = await this.client.get(`/investors/${investorId}/orders`, { params });
    return unwrapList(response.data);
  }

  async getOrder(investorId: string, orderId: string) {
    const response = await this.client.get(`/investors/${investorId}/orders/${orderId}`);
    return response.data;
  }

  async listPositions(
    investorId: string,
    params?: {
      symbol?: string;
      non_zero_only?: boolean;
      refresh_prices?: boolean;
    }
  ) {
    const response = await this.client.get(`/investors/${investorId}/positions`, { params });
    return unwrapList(response.data);
  }

  async listTransactions(
    investorId: string,
    params?: {
      type?: string;
      status?: string;
      currency?: string;
      date_from?: string;
      date_to?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const response = await this.client.get(`/investors/${investorId}/transactions`, {
      params,
    });
    return unwrapList(response.data);
  }

  async getPlaidLinkToken(investorId: string, body: Record<string, unknown> = {}) {
    const response = await this.client.post(`/investors/${investorId}/funding-sources/plaid/link-token`, body);
    return response.data;
  }

  async connectFundingSource(investorId: string, data: Record<string, unknown>) {
    const response = await this.client.post(`/investors/${investorId}/funding-sources/connect`, data);
    return response.data;
  }

  async createDeposit(
    investorId: string,
    depositData: {
      amount: string;
      currency: string;
      method: 'ach' | 'manual_bank_transfer' | 'wire';
      description?: string;
      funding_source_id?: string;
      manual_options?: Record<string, unknown>;
      wire_options?: Record<string, unknown>;
    },
    idempotencyKey?: string
  ) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.post(`/investors/${investorId}/deposits`, depositData, {
      headers,
    });
    return response.data;
  }

  async createWithdrawal(
    investorId: string,
    withdrawalData: {
      amount: string;
      currency: string;
      method: 'ach' | 'wire';
      description?: string;
      funding_source_id?: string;
      wire_options?: Record<string, unknown>;
    },
    idempotencyKey?: string
  ) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.post(`/investors/${investorId}/withdrawals`, withdrawalData, {
      headers,
    });
    return response.data;
  }

  async getFundingSources(investorId: string, type: 'plaid' | 'manual' | 'all' = 'all') {
    const response = await this.client.get(`/investors/${investorId}/funding-sources`, {
      params: { type },
    });
    return unwrapList(response.data);
  }

  async disconnectFundingSource(investorId: string, fundingSourceId: string, type: 'plaid' | 'manual' = 'plaid') {
    const response = await this.client.delete(`/investors/${investorId}/funding-sources/${fundingSourceId}`, {
      params: { type },
    });
    return response.data;
  }

  async getNigerianBanks() {
    return this.getBanksByCountry('NG');
  }

  /** Contract: `{ status, data: { banks } }` — return payload as-is */
  async getBanksByCountry(country: string) {
    const response = await this.client.get('/banks', { params: { country } });
    return response.data;
  }

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

  async getGoal(
    accountId: string,
    goalId: string,
    params?: {
      include_projections?: boolean;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/goals/${goalId}`, {
      params,
    });
    return response.data;
  }

  async createGoal(
    accountId: string,
    goalData: {
      name: string;
      goal_type: 'retirement' | 'education' | 'emergency' | 'wealth_growth' | 'home_purchase' | 'custom';
      target_amount: string;
      target_date?: string;
      priority?: number;
      monthly_contribution?: string;
    },
    idempotencyKey?: string
  ) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.post(`/wealth/accounts/${accountId}/goals`, goalData, {
      headers,
    });
    return response.data;
  }

  async updateGoal(
    accountId: string,
    goalId: string,
    goalData: Partial<{
      name: string;
      goal_type: 'retirement' | 'education' | 'emergency' | 'wealth_growth' | 'home_purchase' | 'custom';
      target_amount: string;
      target_date: string;
      priority: number;
      monthly_contribution: string;
      status: 'active' | 'completed' | 'archived';
    }>
  ) {
    const response = await this.client.put(`/wealth/accounts/${accountId}/goals/${goalId}`, goalData);
    return response.data;
  }

  async deleteGoal(accountId: string, goalId: string) {
    const response = await this.client.delete(`/wealth/accounts/${accountId}/goals/${goalId}`);
    return response.data;
  }

  async createLifeEvent(
    accountId: string,
    data: {
      name: string;
      event_type: 'college' | 'wedding' | 'home_purchase' | 'retirement' | 'major_purchase' | 'career_change' | 'custom';
      expected_date: string;
      estimated_cost: string;
      currency?: string;
      recurring?: boolean;
      linked_goal_id?: string;
      notes?: string;
    }
  ) {
    const response = await this.client.post(`/wealth/accounts/${accountId}/life-events`, data);
    return response.data;
  }

  async listLifeEvents(
    accountId: string,
    params?: {
      status?: 'active' | 'completed' | 'archived';
      event_type?: string;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/life-events`, { params });
    return response.data;
  }

  async getLifeEvent(accountId: string, eventId: string) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/life-events/${eventId}`);
    return response.data;
  }

  async updateLifeEvent(
    accountId: string,
    eventId: string,
    data: Partial<{
      name: string;
      event_type: 'college' | 'wedding' | 'home_purchase' | 'retirement' | 'major_purchase' | 'career_change' | 'custom';
      expected_date: string;
      estimated_cost: string;
      currency: string;
      recurring: boolean;
      status: 'active' | 'completed' | 'archived';
      linked_goal_id: string | null;
      notes: string;
    }>
  ) {
    const response = await this.client.put(`/wealth/accounts/${accountId}/life-events/${eventId}`, data);
    return response.data;
  }

  async deleteLifeEvent(accountId: string, eventId: string) {
    const response = await this.client.delete(`/wealth/accounts/${accountId}/life-events/${eventId}`);
    return response.data;
  }

  async createExternalAccount(
    accountId: string,
    data: {
      name: string;
      account_type: string;
      is_asset: boolean;
      balance: string;
      currency?: string;
      institution?: string;
      notes?: string;
    },
    idempotencyKey?: string
  ) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.post(`/wealth/accounts/${accountId}/external-accounts`, data, { headers });
    return response.data;
  }

  async listExternalAccounts(
    accountId: string,
    params?: {
      status?: 'active' | 'archived';
      is_asset?: boolean;
      account_type?: string;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/external-accounts`, { params });
    return response.data;
  }

  async getExternalAccount(accountId: string, externalAccountId: string) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/external-accounts/${externalAccountId}`);
    return response.data;
  }

  async updateExternalAccount(
    accountId: string,
    externalAccountId: string,
    data: Partial<{
      name: string;
      account_type: string;
      is_asset: boolean;
      balance: string;
      currency: string;
      institution: string;
      notes: string;
      status: 'active' | 'archived';
    }>
  ) {
    const response = await this.client.put(`/wealth/accounts/${accountId}/external-accounts/${externalAccountId}`, data);
    return response.data;
  }

  async deleteExternalAccount(accountId: string, externalAccountId: string) {
    const response = await this.client.delete(`/wealth/accounts/${accountId}/external-accounts/${externalAccountId}`);
    return response.data;
  }

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

  async createOrUpdateInvestmentPolicy(
    accountId: string,
    policyData: {
      risk_profile: {
        risk_tolerance: 'conservative' | 'moderate_conservative' | 'moderate' | 'moderate_aggressive' | 'aggressive';
        risk_score?: number;
        volatility_tolerance?: 'low' | 'medium' | 'high';
      };
      time_horizon: {
        years: number;
        category: 'short_term' | 'medium_term' | 'long_term';
      };
      investment_objectives: {
        primary: string;
        secondary?: string[];
        target_annual_return?: string;
      };
      target_allocation: {
        equities?: {
          target_percent: string;
          min_percent?: string;
          max_percent?: string;
        };
        fixed_income?: {
          target_percent: string;
          min_percent?: string;
          max_percent?: string;
        };
        treasury?: {
          target_percent: string;
          min_percent?: string;
          max_percent?: string;
        };
        alternatives?: {
          target_percent: string;
          min_percent?: string;
          max_percent?: string;
        };
      };
      constraints: {
        liquidity_requirements?: {
          minimum_cash_percent: string;
          emergency_fund_months?: number;
        };
        tax_considerations?: {
          tax_loss_harvesting?: boolean;
          tax_bracket?: string;
        };
        restrictions?: {
          excluded_sectors?: string[];
          esg_screening?: boolean;
        };
        rebalancing_policy?: {
          frequency: string;
          threshold_percent: string;
          tax_aware?: boolean;
        };
      };
    },
    idempotencyKey?: string
  ) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.put(`/wealth/accounts/${accountId}/investment-policy`, policyData, { headers });
    return response.data;
  }

  async validatePortfolioAgainstIPS(accountId: string, portfolioId: string) {
    const response = await this.client.post(`/wealth/accounts/${accountId}/investment-policy/validate`, { portfolio_id: portfolioId });
    return response.data;
  }

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
    const response = await this.client.get(`/wealth/accounts/${accountId}/portfolios/${portfolioId}/performance`, { params });
    return response.data;
  }

  async getPortfolioSummary(
    accountId: string,
    portfolioId: string,
    params?: {
      refresh_prices?: boolean;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/portfolios/${portfolioId}/summary`, { params });
    return response.data;
  }

  async getPortfolioHoldings(
    accountId: string,
    portfolioId: string,
    params?: {
      refresh_prices?: boolean;
      include_lots?: boolean;
      group_by?: 'asset_class' | 'sector' | 'none';
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/portfolios/${portfolioId}/holdings`, { params });
    return response.data;
  }

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

  async getAutoInvestSchedules(
    accountId: string,
    params?: {
      status?: 'active' | 'paused' | 'completed' | 'cancelled';
      portfolio_id?: string;
    }
  ) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/auto-invest`, {
      params,
    });
    return response.data;
  }

  async getAutoInvestSchedule(accountId: string, scheduleId: string) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/auto-invest/${scheduleId}`);
    return response.data;
  }

  async createAutoInvestSchedule(
    accountId: string,
    scheduleData: {
      name: string;
      portfolio_id: string;
      funding_source_id: string;
      amount: string;
      currency: string;
      frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
      schedule: {
        day_of_month?: number;
        day_of_week?: number;
        time: string;
      };
      allocation_rule: 'ips_target' | 'custom';
      start_date: string;
    },
    idempotencyKey?: string
  ) {
    const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};
    const response = await this.client.post(`/wealth/accounts/${accountId}/auto-invest`, scheduleData, { headers });
    return response.data;
  }

  async updateAutoInvestSchedule(
    accountId: string,
    scheduleId: string,
    scheduleData: Partial<{
      name: string;
      amount: string;
      frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
      schedule: {
        day_of_month?: number;
        day_of_week?: number;
        time: string;
      };
      allocation_rule: 'ips_target' | 'custom';
      status: 'active' | 'paused' | 'completed' | 'cancelled';
    }>
  ) {
    const response = await this.client.patch(`/wealth/accounts/${accountId}/auto-invest/${scheduleId}`, scheduleData);
    return response.data;
  }

  async deleteAutoInvestSchedule(accountId: string, scheduleId: string) {
    const response = await this.client.delete(`/wealth/accounts/${accountId}/auto-invest/${scheduleId}`);
    return response.data;
  }

  async pauseAutoInvestSchedule(accountId: string, scheduleId: string) {
    const response = await this.client.post(`/wealth/accounts/${accountId}/auto-invest/${scheduleId}/pause`);
    return response.data;
  }

  async resumeAutoInvestSchedule(accountId: string, scheduleId: string) {
    const response = await this.client.post(`/wealth/accounts/${accountId}/auto-invest/${scheduleId}/resume`);
    return response.data;
  }

  async getDripConfiguration(accountId: string, portfolioId: string) {
    const response = await this.client.get(`/wealth/accounts/${accountId}/portfolios/${portfolioId}/drip`);
    return response.data;
  }

  async updateDripConfiguration(
    accountId: string,
    portfolioId: string,
    dripData: {
      enabled: boolean;
      reinvestment_rule: 'same_security' | 'portfolio_allocation' | 'custom';
      minimum_amount?: string;
      cash_sweep_enabled?: boolean;
      cash_sweep_threshold?: string;
    }
  ) {
    const response = await this.client.put(`/wealth/accounts/${accountId}/portfolios/${portfolioId}/drip`, dripData);
    return response.data;
  }
}

export const bluumApi = new BluumApiClient();
