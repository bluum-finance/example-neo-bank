// Transaction data

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  category?: string;
}

export const transactions: Transaction[] = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    amount: 5000,
    type: 'credit',
    description: 'Salary Payment',
    status: 'completed',
    category: 'Income',
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    amount: 2500,
    type: 'debit',
    description: 'Grocery Shopping',
    status: 'completed',
    category: 'Food',
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    amount: 15000,
    type: 'debit',
    description: 'Electricity Bill',
    status: 'completed',
    category: 'Utilities',
  },
  {
    id: '4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    amount: 10000,
    type: 'credit',
    description: 'Transfer from Jane Doe',
    status: 'completed',
    category: 'Transfer',
  },
  {
    id: '5',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    amount: 3000,
    type: 'debit',
    description: 'Netflix Subscription',
    status: 'completed',
    category: 'Entertainment',
  },
  {
    id: '6',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    amount: 50000,
    type: 'debit',
    description: 'Investment Deposit',
    status: 'completed',
    category: 'Investment',
  },
];

