import type { DepositMethod, ExternalDepositResponse, ExternalWithdrawalResponse, WithdrawalMethod } from '@/types/bluum';

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
  method: DepositMethod;
  description?: string;
  manual_options?: Record<string, unknown>;
  wire_options?: Record<string, unknown>;
  idempotency_key?: string;
}

export interface WithdrawalRequest {
  amount: string;
  currency: string;
  method: WithdrawalMethod;
  description?: string;
  wire_options?: Record<string, unknown>;
  idempotency_key?: string;
}

export class TransferService {
  /**
   * Initiate a new deposit
   */
  static async createDeposit(accountId: string, data: DepositRequest): Promise<ExternalDepositResponse> {
    const response = await fetch('/api/investment/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        account_id: accountId,
      }),
    });
    return handleResponse<ExternalDepositResponse>(response);
  }

  /**
   * Initiate a new withdrawal
   */
  static async createWithdrawal(accountId: string, data: WithdrawalRequest): Promise<ExternalWithdrawalResponse> {
    const response = await fetch('/api/investment/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        account_id: accountId,
      }),
    });
    return handleResponse<ExternalWithdrawalResponse>(response);
  }

  /**
   * List deposits for an account
   */
  static async getDeposits(accountId: string): Promise<ExternalDepositResponse[]> {
    // Note: If there's no specific GET route for deposits yet, this might need adjustment
    const response = await fetch(`/api/investment/deposits?account_id=${accountId}`);
    return handleResponse<ExternalDepositResponse[]>(response);
  }
}
