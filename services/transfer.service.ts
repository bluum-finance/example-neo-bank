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

export interface DepositRequest {
  amount: string;
  currency: string;
  method: string;
  funding_source_id?: string;
  description?: string;
}

export interface DepositResponse {
  deposit_id: string;
  account_id: string;
  wallet_id: string;
  amount: string;
  currency: string;
  method: string;
  status: string;
  description?: string;
  created_at: string;
}

export class TransferService {
  /**
   * Initiate a new deposit
   */
  static async createDeposit(accountId: string, data: DepositRequest): Promise<DepositResponse> {
    const response = await fetch('/api/investment/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        account_id: accountId,
      }),
    });
    return handleResponse<DepositResponse>(response);
  }

  /**
   * List deposits for an account
   */
  static async getDeposits(accountId: string): Promise<DepositResponse[]> {
    // Note: If there's no specific GET route for deposits yet, this might need adjustment
    const response = await fetch(`/api/investment/deposits?account_id=${accountId}`);
    return handleResponse<DepositResponse[]>(response);
  }
}
