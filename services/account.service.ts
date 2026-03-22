// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    const errorMessage = typeof error.error === 'string' ? error.error : error.error?.message || 'An error occurred';
    const errorWithStatus = new Error(errorMessage) as Error & { status: number };
    errorWithStatus.status = response.status;
    throw errorWithStatus;
  }
  return response.json();
}

// Account types
export interface Account {
  id: string;
  account_number?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  balance?: string;
  currency: string;
  last_equity: string;
  created_at: string;
  account_type: string;
}

export interface ComplianceCheck {
  verification_url?: string;
}

export interface CreateAccountResponse extends Account {
  compliance_checks?: ComplianceCheck[];
}

// Account Service
export class AccountService {
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
  static async createAccount(accountData: any): Promise<CreateAccountResponse> {
    const response = await fetch('/api/investment/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });
    return handleResponse<CreateAccountResponse>(response);
  }
}
