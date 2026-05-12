import type { DepositMethod, ExternalDepositResponse, ExternalWithdrawalResponse, WithdrawalMethod } from '@/lib/bluum-api.types';
import { unwrapList } from '@/lib/utils';

const AMOUNT_DECIMAL = /^\d+(\.\d{1,2})?$/;

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    let errorMessage = typeof error.error === 'string' ? error.error : error.error?.message || 'An error occurred';
    if (response.status === 404 && /not\s*found/i.test(errorMessage)) {
      errorMessage += ` If you reset the API database or changed BLUUM_API_BASE_URL, sign out and complete onboarding again (or use an investor id that exists in that environment).`;
    }
    const errorWithStatus = new Error(errorMessage) as Error & { status: number };
    errorWithStatus.status = response.status;
    throw errorWithStatus;
  }
  return response.json();
}

function depositHeaders(idempotency_key?: string): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idempotency_key) headers['Idempotency-Key'] = idempotency_key;
  return headers;
}

export interface DepositRequest {
  amount: string;
  currency: string;
  method: DepositMethod;
  description?: string;
  funding_source_id?: string;
  manual_options?: Record<string, unknown>;
  wire_options?: Record<string, unknown>;
  idempotency_key?: string;
}

export interface WithdrawalRequest {
  amount: string;
  currency: string;
  method: WithdrawalMethod;
  description?: string;
  funding_source_id?: string;
  wire_options?: Record<string, unknown>;
  idempotency_key?: string;
}

export class TransferService {
  /**
   * Initiate a new deposit
   */
  static async createDeposit(accountId: string, data: DepositRequest): Promise<ExternalDepositResponse> {
    if (!data.amount) {
      throw new Error('amount is required');
    }
    const amountStr = String(data.amount);
    if (!AMOUNT_DECIMAL.test(amountStr)) {
      throw new Error('amount must be a valid decimal with up to two fractional digits');
    }
    const { method } = data;
    if (!['ach', 'manual_bank_transfer', 'wire'].includes(method)) {
      throw new Error('method is required and must be one of ach, manual_bank_transfer, or wire');
    }
    if (method === 'ach' && !data.funding_source_id) {
      throw new Error('funding_source_id is required when method is ach');
    }

    const body = {
      amount: amountStr,
      currency: data.currency || 'USD',
      description: data.description,
      method: data.method,
      funding_source_id: data.funding_source_id,
      manual_options: data.manual_options,
      wire_options: data.wire_options,
    };

    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/deposits`, {
      method: 'POST',
      headers: depositHeaders(data.idempotency_key),
      body: JSON.stringify(body),
    });
    return handleResponse<ExternalDepositResponse>(response);
  }

  /**
   * Initiate a new withdrawal
   */
  static async createWithdrawal(accountId: string, data: WithdrawalRequest): Promise<ExternalWithdrawalResponse> {
    if (!data.amount) {
      throw new Error('amount is required');
    }
    const amountStr = String(data.amount);
    if (!AMOUNT_DECIMAL.test(amountStr)) {
      throw new Error('amount must be a valid decimal with up to two fractional digits');
    }
    const { method } = data;
    if (!['ach', 'wire'].includes(method)) {
      throw new Error('method is required and must be ach or wire');
    }
    if (method === 'ach' && !data.funding_source_id) {
      throw new Error('funding_source_id is required when method is ach');
    }

    const body = {
      amount: amountStr,
      currency: data.currency || 'USD',
      method: data.method,
      description: data.description,
      funding_source_id: data.funding_source_id,
      wire_options: data.wire_options,
    };

    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/withdrawals`, {
      method: 'POST',
      headers: depositHeaders(data.idempotency_key),
      body: JSON.stringify(body),
    });
    return handleResponse<ExternalWithdrawalResponse>(response);
  }

  /**
   * List deposits for an investor
   */
  static async getDeposits(accountId: string): Promise<ExternalDepositResponse[]> {
    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(accountId)}/deposits`);
    const raw = await handleResponse<unknown>(response);
    return unwrapList<ExternalDepositResponse>(raw);
  }
}
