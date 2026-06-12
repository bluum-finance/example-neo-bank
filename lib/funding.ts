import type { DepositMethod, WithdrawalMethod } from '@/lib/bluum-api.types';

export interface DepositMethodOption {
  id: string;
  method: DepositMethod;
  label: string;
  disabled?: boolean;
}

/** Deposit UI options per wallet currency. */
export const DEPOSIT_METHOD_OPTIONS_BY_CURRENCY: Record<string, DepositMethodOption[]> = {
  USD: [
    { id: 'digital_wallet', method: 'manual_bank_transfer', label: 'Digital Wallet' },
    { id: 'ach', method: 'ach', label: 'ACH Transfer' },
    { id: 'wire', method: 'wire', label: 'Wire Transfer', disabled: true },
  ],
  NGN: [
    { id: 'digital_wallet', method: 'manual_bank_transfer', label: 'Digital Wallet' },
    { id: 'bank_transfer', method: 'manual_bank_transfer', label: 'Bank transfer' },
    { id: 'wire', method: 'wire', label: 'Wire Transfer', disabled: true },
  ],
};

export function getDepositMethodOptions(currency: string): DepositMethodOption[] {
  return DEPOSIT_METHOD_OPTIONS_BY_CURRENCY[currency] ?? [];
}

export function getEnabledDepositMethodOptions(currency: string): DepositMethodOption[] {
  return getDepositMethodOptions(currency).filter((o) => !o.disabled);
}

export function defaultDepositOptionForCurrency(currency: string): DepositMethodOption {
  return getEnabledDepositMethodOptions(currency)[0] ?? {
    id: 'digital_wallet',
    method: 'manual_bank_transfer',
    label: 'Digital Wallet',
  };
}

export function getDepositOptionLabel(currency: string, optionId: string): string {
  return getDepositMethodOptions(currency).find((o) => o.id === optionId)?.label ?? 'Deposit';
}

export function getDepositMethodLabel(method: DepositMethod, currency: string): string {
  const match = getDepositMethodOptions(currency).find((o) => o.method === method && !o.disabled);
  if (match) return match.label;
  const fallback: Record<DepositMethod, string> = {
    manual_bank_transfer: currency === 'NGN' ? 'Bank transfer' : 'Digital Wallet',
    ach: 'ACH Transfer',
    wire: 'Wire Transfer',
  };
  return fallback[method];
}

/** @deprecated Use getDepositMethodOptions */
export const DEPOSIT_METHODS_BY_CURRENCY: Record<string, DepositMethod[]> = {
  NGN: ['manual_bank_transfer'],
  USD: ['manual_bank_transfer', 'ach', 'wire'],
};

export const DEPOSIT_METHOD_SELECT_LABELS: Record<DepositMethod, string> = {
  ach: 'ACH Transfer',
  wire: 'Wire Transfer',
  manual_bank_transfer: 'Digital Wallet',
};

/** @deprecated Use getEnabledDepositMethodOptions */
export function getAvailableDepositMethods(currency: string): DepositMethod[] {
  return [...new Set(getEnabledDepositMethodOptions(currency).map((o) => o.method))];
}

/** @deprecated Use defaultDepositOptionForCurrency */
export function defaultDepositMethodForCurrency(currency: string): DepositMethod {
  return defaultDepositOptionForCurrency(currency).method;
}

/** Withdrawal methods available per wallet currency. */
export const WITHDRAWAL_METHODS_BY_CURRENCY: Record<string, WithdrawalMethod[]> = {
  NGN: ['wire'],
  USD: ['ach', 'wire'],
};

export const WITHDRAWAL_METHOD_SELECT_LABELS: Record<WithdrawalMethod, string> = {
  ach: 'ACH to linked bank account',
  wire: 'Wire withdrawal',
};

export function getAvailableWithdrawalMethods(currency: string): WithdrawalMethod[] {
  return WITHDRAWAL_METHODS_BY_CURRENCY[currency] ?? [];
}

export function defaultWithdrawalMethodForCurrency(currency: string): WithdrawalMethod {
  return getAvailableWithdrawalMethods(currency)[0] ?? 'wire';
}
