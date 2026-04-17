import { apiClient } from '@/lib/api-client';
import type { DepositMethod, WithdrawalMethod } from '@/types/bluum';

export interface PlaidLinkTokenResponse {
  status: string;
  data: {
    link_token: string;
  };
}

export interface CreateDepositRequest {
  amount: string;
  currency: string;
  description?: string;
  method?: DepositMethod;
  manual_options?: Record<string, unknown>;
  wire_options?: Record<string, unknown>;
}

export interface InitiateWithdrawalRequest {
  amount: string;
  currency: string;
  description?: string;
  method?: WithdrawalMethod;
  wire_options?: Record<string, unknown>;
}

export interface ConnectedAccount {
  id: string;
  itemId?: string; // Plaid item ID (from API)
  providerId?: string; // Legacy field, maps to itemId
  institutionId?: string;
  institutionName: string;
  status: string;
  accounts: Array<{
    id: string;
    accountId: string;
    accountName: string;
    accountType: string;
    accountSubtype: string;
    mask: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectedAccountsResponse {
  items: ConnectedAccount[];
}

export class PlaidService {
  /**
   * Get Plaid Link token for an account
   */
  static async getLinkToken(accountId: string): Promise<string> {
    const response = await apiClient.post<PlaidLinkTokenResponse>('/api/investment/plaid/link-token', { account_id: accountId });
    return response.data.data.link_token;
  }

  /**
   * Initiate a deposit transfer
   */
  static async createDeposit(accountId: string, request: CreateDepositRequest) {
    const response = await apiClient.post('/api/investment/deposits', {
      account_id: accountId,
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      method: request.method || 'ach',
      manual_options: request.manual_options,
      wire_options: request.wire_options,
    });
    return response.data;
  }

  /**
   * Initiate a withdrawal
   * Uses the new withdrawals endpoint with proper plaid_options structure
   */
  static async initiateWithdrawal(accountId: string, request: InitiateWithdrawalRequest) {
    const response = await apiClient.post('/api/investment/withdrawals', {
      account_id: accountId,
      amount: request.amount,
      currency: request.currency,
      method: request.method || 'ach',
      description: request.description,
      wire_options: request.wire_options,
    });
    return response.data;
  }

  /**
   * Connect a bank account (without initiating transfer)
   */
  static async connectAccount(accountId: string, publicToken: string) {
    const response = await apiClient.post('/api/investment/plaid/connect', {
      account_id: accountId,
      publicToken,
    });
    return response.data;
  }

  /**
   * Normalize connected account data to ensure consistent structure
   */
  private static normalizeConnectedAccount(item: any): ConnectedAccount {
    return {
      id: item.id,
      itemId: item.itemId || item.providerId, // Use itemId from API, fallback to providerId
      providerId: item.providerId || item.itemId, // Keep providerId for backward compatibility
      institutionId: item.institutionId,
      institutionName: item.institutionName,
      status: item.status,
      accounts: item.accounts || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  /**
   * Get connected accounts for an account
   */
  static async getConnectedAccounts(accountId: string): Promise<ConnectedAccount[]> {
    const response = await apiClient.get<{ status: string; data: ConnectedAccountsResponse }>(`/api/investment/plaid/connected`, {
      params: { account_id: accountId, type: 'plaid' },
    });
    console.log('getConnectedAccounts response', response.data);

    // Handle both response structures for backward compatibility
    let items: any[] = [];
    if (response.data.data.items) {
      items = response.data.data.items;
    } else if ((response.data.data as any).fundingSources) {
      items = (response.data.data as any).fundingSources;
    }

    // Normalize each item to ensure consistent structure
    return items.map((item) => this.normalizeConnectedAccount(item));
  }

  /**
   * Disconnect a Plaid item
   */
  static async disconnectItem(accountId: string, fundingSourceId: string) {
    const response = await apiClient.delete('/api/investment/plaid/disconnect', {
      params: {
        account_id: accountId,
        funding_source_id: fundingSourceId,
      },
    });
    return response.data;
  }
}
