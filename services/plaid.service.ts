import { apiClient } from '@/lib/api-client';

export interface PlaidLinkTokenResponse {
  status: string;
  data: {
    link_token: string;
  };
}

export interface InitiateTransferRequest {
  public_token?: string;
  item_id?: string;
  plaid_account_id?: string; // Plaid account ID (different from Bluum account_id)
  amount: string;
  currency?: string;
  description?: string;
}

export interface InitiateWithdrawalRequest {
  public_token?: string;
  item_id?: string;
  plaid_account_id?: string; // Plaid account ID (different from Bluum account_id)
  amount: string;
  currency?: string;
  description?: string;
}

export interface ConnectedAccount {
  id: string;
  itemId: string;
  institutionId: string;
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
    const response = await apiClient.post<PlaidLinkTokenResponse>(
      '/api/investment/plaid/link-token',
      { account_id: accountId }
    );
    return response.data.data.link_token;
  }

  /**
   * Initiate a deposit transfer
   */
  static async initiateTransfer(accountId: string, request: InitiateTransferRequest) {
    const response = await apiClient.post('/api/investment/plaid/transfer', {
      account_id: accountId,
      ...request,
    });
    return response.data;
  }

  /**
   * Initiate a withdrawal
   */
  static async initiateWithdrawal(accountId: string, request: InitiateWithdrawalRequest) {
    const response = await apiClient.post('/api/investment/plaid/withdrawal', {
      account_id: accountId,
      ...request,
    });
    return response.data;
  }

  /**
   * Connect a bank account (without initiating transfer)
   */
  static async connectAccount(accountId: string, publicToken: string) {
    const response = await apiClient.post('/api/investment/plaid/connect', {
      account_id: accountId,
      public_token: publicToken,
    });
    return response.data;
  }

  /**
   * Get connected accounts for an account
   */
  static async getConnectedAccounts(accountId: string): Promise<ConnectedAccount[]> {
    const response = await apiClient.get<{ data: ConnectedAccountsResponse }>(
      `/api/investment/plaid/connected`,
      { params: { account_id: accountId } }
    );
    console.log('getConnectedAccounts response', response.data);
    return response.data.data.items;
  }

  /**
   * Disconnect a Plaid item
   */
  static async disconnectItem(itemId: string) {
    const response = await apiClient.delete('/api/investment/plaid/disconnect', {
      params: { item_id: itemId },
    });
    return response.data;
  }
}
