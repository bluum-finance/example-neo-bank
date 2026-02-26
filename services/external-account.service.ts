/**
 * External Account Service
 * Handles API calls for external accounts (checking, savings, loans, etc.)
 */

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

export interface ExternalAccount {
  external_account_id: string;
  account_id: string;
  name: string;
  account_type: string;
  is_asset: boolean;
  balance: string;
  currency: string;
  institution?: string;
  notes?: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at?: string;
}

export interface ExternalAccountListResponse {
  external_accounts: ExternalAccount[];
  total_count: number;
}

export interface CreateExternalAccountRequest {
  name: string;
  account_type: string;
  is_asset: boolean;
  balance: string;
  currency?: string;
  institution?: string;
  notes?: string;
}

export interface UpdateExternalAccountRequest {
  name?: string;
  account_type?: string;
  is_asset?: boolean;
  balance?: string;
  currency?: string;
  institution?: string;
  notes?: string;
  status?: 'active' | 'archived';
}

export class ExternalAccountService {
  /**
   * Create a new external account
   */
  static async createExternalAccount(
    accountId: string,
    data: CreateExternalAccountRequest,
    idempotencyKey?: string
  ): Promise<ExternalAccount> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch('/api/wealth/external-accounts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        account_id: accountId,
        ...data,
      }),
    });
    return handleResponse<ExternalAccount>(response);
  }

  /**
   * Retrieves all external accounts for an account
   */
  static async listExternalAccounts(
    accountId: string,
    filters?: {
      status?: 'active' | 'archived';
      is_asset?: boolean;
      account_type?: string;
    }
  ): Promise<ExternalAccountListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('account_id', accountId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.is_asset !== undefined) queryParams.append('is_asset', String(filters.is_asset));
    if (filters?.account_type) queryParams.append('account_type', filters.account_type);

    const response = await fetch(`/api/wealth/external-accounts?${queryParams.toString()}`);
    return handleResponse<ExternalAccountListResponse>(response);
  }

  /**
   * Retrieves details for a specific external account
   */
  static async getExternalAccount(accountId: string, externalAccountId: string): Promise<ExternalAccount> {
    const queryParams = new URLSearchParams({ account_id: accountId });
    const response = await fetch(
      `/api/wealth/external-accounts/${externalAccountId}?${queryParams.toString()}`
    );
    return handleResponse<ExternalAccount>(response);
  }

  /**
   * Updates an existing external account
   */
  static async updateExternalAccount(
    accountId: string,
    externalAccountId: string,
    data: UpdateExternalAccountRequest
  ): Promise<ExternalAccount> {
    const response = await fetch(`/api/wealth/external-accounts/${externalAccountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: accountId,
        ...data,
      }),
    });
    return handleResponse<ExternalAccount>(response);
  }

  /**
   * Soft-deletes an external account by setting its status to archived
   */
  static async deleteExternalAccount(accountId: string, externalAccountId: string): Promise<void> {
    const queryParams = new URLSearchParams({ account_id: accountId });
    const response = await fetch(
      `/api/wealth/external-accounts/${externalAccountId}?${queryParams.toString()}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      await handleResponse(response);
    }
  }
}
