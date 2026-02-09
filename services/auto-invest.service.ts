// Auto-Invest Service - Client-side wrapper for auto-invest API endpoints

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

export interface AutoInvestSchedule {
  auto_invest_id: string;
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
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  next_execution_date?: string;
  last_execution_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AutoInvestSchedulesResponse {
  schedules: AutoInvestSchedule[];
  total_count: number;
}

export class AutoInvestService {
  /**
   * List all auto-invest schedules for an account
   */
  static async getSchedules(
    accountId: string,
    params?: {
      status?: 'active' | 'paused' | 'completed' | 'cancelled';
      portfolio_id?: string;
    }
  ): Promise<AutoInvestSchedule[]> {
    if (!accountId) {
      const err = new Error('accountId is required') as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const queryParams = new URLSearchParams({ account_id: accountId });
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.portfolio_id) {
      queryParams.append('portfolio_id', params.portfolio_id);
    }

    const response = await fetch(`/api/wealth/auto-invest?${queryParams.toString()}`);
    const data = await handleResponse<AutoInvestSchedulesResponse>(response);
    return data.schedules || [];
  }

  /**
   * Get a specific auto-invest schedule
   */
  static async getSchedule(
    accountId: string,
    autoInvestId: string
  ): Promise<AutoInvestSchedule> {
    if (!accountId || !autoInvestId) {
      const err = new Error('accountId and autoInvestId are required') as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const response = await fetch(
      `/api/wealth/auto-invest/${autoInvestId}?account_id=${accountId}`
    );
    return handleResponse<AutoInvestSchedule>(response);
  }

  /**
   * Create a new auto-invest schedule
   */
  static async createSchedule(
    accountId: string,
    scheduleData: {
      name: string;
      portfolio_id: string;
      funding_source_id: string;
      amount: string;
      currency?: string;
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
  ): Promise<AutoInvestSchedule> {
    if (!accountId) {
      const err = new Error('accountId is required') as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch('/api/wealth/auto-invest', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        account_id: accountId,
        ...scheduleData,
      }),
    });

    return handleResponse<AutoInvestSchedule>(response);
  }

  /**
   * Update an existing auto-invest schedule
   */
  static async updateSchedule(
    accountId: string,
    autoInvestId: string,
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
  ): Promise<AutoInvestSchedule> {
    if (!accountId || !autoInvestId) {
      const err = new Error('accountId and autoInvestId are required') as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const response = await fetch(`/api/wealth/auto-invest/${autoInvestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: accountId,
        ...scheduleData,
      }),
    });

    return handleResponse<AutoInvestSchedule>(response);
  }

  /**
   * Delete an auto-invest schedule
   */
  static async deleteSchedule(accountId: string, autoInvestId: string): Promise<void> {
    if (!accountId || !autoInvestId) {
      const err = new Error('accountId and autoInvestId are required') as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const response = await fetch(
      `/api/wealth/auto-invest/${autoInvestId}?account_id=${accountId}`,
      {
        method: 'DELETE',
      }
    );

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
  }

  /**
   * Pause an auto-invest schedule
   */
  static async pauseSchedule(accountId: string, autoInvestId: string): Promise<AutoInvestSchedule> {
    if (!accountId || !autoInvestId) {
      const err = new Error('accountId and autoInvestId are required') as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const response = await fetch(`/api/wealth/auto-invest/${autoInvestId}/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_id: accountId }),
    });

    return handleResponse<AutoInvestSchedule>(response);
  }

  /**
   * Resume a paused auto-invest schedule
   */
  static async resumeSchedule(accountId: string, autoInvestId: string): Promise<AutoInvestSchedule> {
    if (!accountId || !autoInvestId) {
      const err = new Error('accountId and autoInvestId are required') as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const response = await fetch(`/api/wealth/auto-invest/${autoInvestId}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_id: accountId }),
    });

    return handleResponse<AutoInvestSchedule>(response);
  }
}
