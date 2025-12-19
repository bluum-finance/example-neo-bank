// Savings data

export interface SavingsPlan {
  id: string;
  name: string;
  type: 'fixed' | 'flexible';
  amount: number;
  targetAmount?: number;
  interestRate: number;
  startDate: string;
  maturityDate?: string;
  status: 'active' | 'matured' | 'cancelled';
}

export const savingsPlans: SavingsPlan[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    type: 'fixed',
    amount: 50000,
    interestRate: 12,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    maturityDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 305).toISOString(),
    status: 'active',
  },
  {
    id: '2',
    name: 'Vacation Fund',
    type: 'flexible',
    amount: 25000,
    targetAmount: 100000,
    interestRate: 8,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    status: 'active',
  },
  {
    id: '3',
    name: 'Car Purchase',
    type: 'flexible',
    amount: 15000,
    targetAmount: 500000,
    interestRate: 8,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    status: 'active',
  },
];

export const totalSavings = savingsPlans.reduce((sum, plan) => sum + plan.amount, 0);

