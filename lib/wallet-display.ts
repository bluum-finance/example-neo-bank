import type { Wallet } from '@/lib/bluum-api.types';
import {
  BANK_ACCOUNTS,
  type BankAccount,
  type BankAccountId,
  walletIdForBankAccount,
} from '@/lib/demo/bank-accounts';
import { getDemoTradingState } from '@/lib/demo/trading-store';

export function getWalletLabel(wallet: Wallet): string {
  const label = wallet.metadata?.label;
  if (typeof label === 'string' && label.length > 0) return label;
  return wallet.currency;
}

export function getBankAccountsWithBalances(investorKey?: string): Array<BankAccount & { balance: number }> {
  const state = investorKey ? getDemoTradingState(investorKey) : null;
  return BANK_ACCOUNTS.map((account) => ({
    ...account,
    balance: state?.walletBalances[walletIdForBankAccount(account.id)] ?? account.defaultBalance,
  }));
}

export function getBankAccountWithBalance(id: string, investorKey?: string): (BankAccount & { balance: number }) | undefined {
  const account = BANK_ACCOUNTS.find((a) => a.id === id);
  if (!account) return undefined;
  const state = investorKey ? getDemoTradingState(investorKey) : null;
  return {
    ...account,
    balance: state?.walletBalances[walletIdForBankAccount(account.id as BankAccountId)] ?? account.defaultBalance,
  };
}
