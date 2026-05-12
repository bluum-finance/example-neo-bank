import type { Account as BluumInvestorAccount, ComplianceInitiationResponse } from '@/lib/bluum-api.types';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    const errorMessage =
      typeof error.error === 'string' ? error.error : (error.error as { message?: string })?.message || 'An error occurred';
    const errorWithStatus = new Error(errorMessage) as Error & { status: number };
    errorWithStatus.status = response.status;
    throw errorWithStatus;
  }
  return response.json();
}

/** Investor resource from GET `/api/bluum/investors/:id` (Bluum `/v1/investors` envelope). */
export type Account = BluumInvestorAccount;

/** Same envelope as GET investor; POST create returns the resource. */
export type CreateAccountResponse = Account;

export class AccountService {
  static async getAccount(accountId: string): Promise<Account> {
    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}`);
    return handleResponse<Account>(response);
  }

  static async restartComplianceWorkflow(accountId: string): Promise<ComplianceInitiationResponse> {
    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/compliance/restart`, {
      method: 'POST',
    });
    return handleResponse<ComplianceInitiationResponse>(response);
  }

  static async createAccount(accountData: unknown): Promise<CreateAccountResponse> {
    const response = await fetch('/api/bluum/investors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });
    return handleResponse<CreateAccountResponse>(response);
  }
}
