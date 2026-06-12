export type BankAccountId = '3168' | '2651';

export interface BankAccount {
  id: BankAccountId;
  label: string;
  type: 'Checking' | 'Savings';
  mask: string;
  routingNumber: string;
  bankName: string;
  bankAddress: string[];
  /** Default balance before any demo trading activity */
  defaultBalance: number;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: '3168',
    label: 'Checking ••3168',
    type: 'Checking',
    mask: '••3168',
    routingNumber: '121145433',
    bankName: 'Column N.A.',
    bankAddress: ['1 Letterman Drive', 'Building A, Suite A4-700', 'San Francisco, CA 94129'],
    defaultBalance: 25000,
  },
  {
    id: '2651',
    label: 'Savings ••2651',
    type: 'Savings',
    mask: '••2651',
    routingNumber: '121145433',
    bankName: 'Column N.A.',
    bankAddress: ['1 Letterman Drive', 'Building A, Suite A4-700', 'San Francisco, CA 94129'],
    defaultBalance: 10000,
  },
];

export function getBankAccountById(id: string): BankAccount | undefined {
  return BANK_ACCOUNTS.find((a) => a.id === id);
}

export function walletIdForBankAccount(accountId: BankAccountId): string {
  return `bank-${accountId}`;
}

export function bankAccountIdFromWalletId(walletId: string): BankAccountId | undefined {
  const match = walletId.match(/^bank-(3168|2651)$/);
  return match ? (match[1] as BankAccountId) : undefined;
}

export function formatBankBalance(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
