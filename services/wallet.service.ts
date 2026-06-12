import type { Wallet } from '@/lib/bluum-api.types';
import { getDemoWallets } from '@/lib/demo/trading-store';
import { isTradingDemo } from '@/lib/demo-mode';
import { unwrapList } from '@/lib/utils';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
    const msg = typeof error.error === 'string' ? error.error : error.error?.message || 'An error occurred';
    throw new Error(msg);
  }
  return response.json();
}

export class WalletService {
  static async getWallets(investorId: string): Promise<Wallet[]> {
    if (isTradingDemo()) {
      return getDemoWallets(investorId);
    }
    const response = await fetch(`/api/bluum/investors/${encodeURIComponent(investorId)}/wallets`);
    const raw = await handleResponse<unknown>(response);
    return unwrapList<Wallet>(raw);
  }
}
