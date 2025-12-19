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

// Account types
export interface Account {
  id: string;
  account_number?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  currency: string;
  last_equity: string;
  created_at: string;
  account_type: string;
}

// Account Service
export class AccountService {
  /**
   * Get all accounts for the authenticated user
   */
  static async getAccounts(): Promise<Account[]> {
    const response = await fetch('/api/investment/accounts');
    return handleResponse<Account[]>(response);
  }

  /**
   * Get a specific account by ID
   */
  static async getAccount(accountId: string): Promise<Account> {
    const response = await fetch(`/api/investment/accounts/${accountId}`);
    return handleResponse<Account>(response);
  }

  /**
   * Create a new investment account
   */
  static async createAccount(accountData: any): Promise<Account> {
    const response = await fetch('/api/investment/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });
    return handleResponse<Account>(response);
  }
}
