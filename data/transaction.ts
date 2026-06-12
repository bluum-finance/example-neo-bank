// Transaction data

import type { BankAccountId } from '@/lib/demo/bank-accounts';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  category?: string;
  accountId?: BankAccountId;
}

export const transactions: Transaction[] = [
  {
    id: '1',
    accountId: '3168',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    amount: 5000,
    type: 'credit',
    description: 'Salary Payment',
    status: 'completed',
    category: 'Income',
  },
  {
    id: '2',
    accountId: '3168',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    amount: 2500,
    type: 'debit',
    description: 'Grocery Shopping',
    status: 'completed',
    category: 'Food',
  },
  {
    id: '3',
    accountId: '3168',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    amount: 15000,
    type: 'debit',
    description: 'Electricity Bill',
    status: 'completed',
    category: 'Utilities',
  },
  {
    id: '4',
    accountId: '2651',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    amount: 10000,
    type: 'credit',
    description: 'Transfer from Checking',
    status: 'completed',
    category: 'Transfer',
  },
  {
    id: '5',
    accountId: '2651',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    amount: 3000,
    type: 'debit',
    description: 'Netflix Subscription',
    status: 'completed',
    category: 'Entertainment',
  },
  {
    id: '6',
    accountId: '3168',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    amount: 50000,
    type: 'debit',
    description: 'Investment Deposit',
    status: 'completed',
    category: 'Investment',
  },
];

export function getTransactionsForAccount(accountId: string): Transaction[] {
  return transactions.filter((t) => t.accountId === accountId);
}
