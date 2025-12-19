// Mock data service - re-exports from centralized data folder

export type {
  Transaction,
  Stock,
  SavingsPlan,
  Card,
  UserAccount,
} from '~/data';

export {
  userAccount as mockUserAccount,
  transactions as mockTransactions,
  stocks as mockStocks,
  savingsPlans as mockSavingsPlans,
  cards as mockCards,
  investmentBalance as mockInvestmentBalance,
  totalGain as mockTotalGain,
  totalGainPercent as mockTotalGainPercent,
  totalSavings as mockTotalSavings,
} from '~/data';

// Helper functions to simulate API calls
import { transactions, stocks, savingsPlans, cards } from '~/data';
import type { Transaction, Stock, SavingsPlan, Card } from '~/data';

export async function getTransactions(): Promise<Transaction[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(transactions), 500);
  });
}

export async function getStocks(): Promise<Stock[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(stocks), 500);
  });
}

export async function getSavingsPlans(): Promise<SavingsPlan[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(savingsPlans), 500);
  });
}

export async function getCards(): Promise<Card[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(cards), 500);
  });
}

