import type { Transaction } from '@/lib/bluum-api.types';
import { unwrapList } from '@/lib/utils';

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

export type AccountTransactionFilters = {
  type?: 'deposit' | 'withdrawal';
  status?: string;
  currency?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
};

/** Default list size for full-page activity (Bluum APIs typically cap near 100). */
export const ACCOUNT_TRANSACTIONS_PAGE_LIMIT = 100;

/**
 * List investor transactions via the dynamic `/api/bluum/...` proxy
 * (Bluum: GET `/v1/investors/:investor_id/transactions`; investor id is the demo `account_id`).
 */
export class TransactionService {
  static async getAccountTransactions(accountId: string, filters?: AccountTransactionFilters): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (filters?.type) query.set('type', filters.type);
    if (filters?.status) query.set('status', filters.status);
    if (filters?.currency) query.set('currency', filters.currency);
    if (filters?.date_from) query.set('date_from', filters.date_from);
    if (filters?.date_to) query.set('date_to', filters.date_to);
    query.set('limit', String(filters?.limit ?? ACCOUNT_TRANSACTIONS_PAGE_LIMIT));
    if (filters?.offset != null) query.set('offset', String(filters.offset));

    const qs = query.toString();
    const url = `/api/bluum/investors/${encodeURIComponent(accountId)}/transactions${qs ? `?${qs}` : ''}`;
    const response = await fetch(url);
    const raw = await handleResponse<unknown>(response);
    return unwrapList<Transaction>(raw);
  }
}
