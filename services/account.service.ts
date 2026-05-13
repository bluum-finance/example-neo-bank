import type { Account as BluumInvestorAccount, ComplianceInitiationResponse } from '@/lib/bluum-api.types';
import { apiClient } from '@/lib/api-client';

/** Investor resource from GET `/api/bluum/investors/:id` (Bluum `/v1/investors` envelope). */
export type Account = BluumInvestorAccount;

/** Same envelope as GET investor; POST create returns the resource. */
export type CreateAccountResponse = Account;

export class AccountService {
  static async getAccount(accountId: string): Promise<Account> {
    const { data } = await apiClient.get<Account>(`/api/bluum/investors/${encodeURIComponent(accountId)}`);
    return data;
  }

  static async createAccount(accountData: unknown): Promise<CreateAccountResponse> {
    const { data } = await apiClient.post<CreateAccountResponse>('/api/bluum/investors', accountData);
    return data;
  }
}
