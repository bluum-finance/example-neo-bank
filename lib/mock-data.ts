// Mock data service - re-exports from centralized data folder

export type { Transaction, Stock, SavingsPlan, Card, UserData } from '@/data';

export {
  userData as mockUserAccount,
  transactions as mockTransactions,
  stocks as mockStocks,
  savingsPlans as mockSavingsPlans,
  cards as mockCards,
  investmentBalance as mockInvestmentBalance,
  totalGain as mockTotalGain,
  totalGainPercent as mockTotalGainPercent,
  totalSavings as mockTotalSavings,
} from '@/data';

// Helper functions to simulate API calls
import { transactions, stocks, savingsPlans, cards } from '@/data';
import type { Transaction, Stock, SavingsPlan, Card } from '@/data';

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

// AI Wealth Management Landing Page Mock Data

export interface NetWorthDataPoint {
  month: string;
  netWorth: number;
  event?: {
    label: string;
    type: 'milestone' | 'action' | 'opportunity';
  };
}

export interface PersonalizedInsight {
  id: string;
  type: 'rebalancing' | 'tax-loss' | 'risk' | 'market-trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel?: string;
}

export interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export async function getNetWorthChartData(): Promise<NetWorthDataPoint[]> {
  return new Promise((resolve) => {
    const data: NetWorthDataPoint[] = [
      { month: 'Jan 2023', netWorth: 5000 },
      { month: 'Feb 2023', netWorth: 5200 },
      { month: 'Mar 2023', netWorth: 5500, event: { label: 'Started Investing', type: 'milestone' } },
      { month: 'Apr 2023', netWorth: 5800 },
      { month: 'May 2023', netWorth: 6200 },
      { month: 'Jun 2023', netWorth: 6800 },
      { month: 'Jul 2023', netWorth: 7200 },
      { month: 'Aug 2023', netWorth: 7800 },
      { month: 'Sep 2023', netWorth: 8500 },
      { month: 'Oct 2023', netWorth: 9200 },
      { month: 'Nov 2023', netWorth: 9800 },
      { month: 'Dec 2023', netWorth: 10200, event: { label: 'First $10K', type: 'milestone' } },
      { month: 'Jan 2024', netWorth: 10800 },
      { month: 'Feb 2024', netWorth: 11200, event: { label: 'Portfolio Rebalancing', type: 'action' } },
      { month: 'Mar 2024', netWorth: 11800 },
      { month: 'Apr 2024', netWorth: 12500 },
      { month: 'May 2024', netWorth: 13200, event: { label: 'Market Opportunity', type: 'opportunity' } },
      { month: 'Jun 2024', netWorth: 14000 },
      { month: 'Jul 2024', netWorth: 14800 },
      { month: 'Aug 2024', netWorth: 15600 },
      { month: 'Sep 2024', netWorth: 16500, event: { label: 'Retirement Goal Progress', type: 'milestone' } },
      { month: 'Oct 2024', netWorth: 17400 },
      { month: 'Nov 2024', netWorth: 18300 },
      { month: 'Dec 2024', netWorth: 19200 },
    ];
    setTimeout(() => resolve(data), 300);
  });
}

export async function getPersonalizedInsights(): Promise<PersonalizedInsight[]> {
  return new Promise((resolve) => {
    const insights: PersonalizedInsight[] = [
      {
        id: '1',
        type: 'rebalancing',
        title: 'Portfolio Rebalancing Recommendation',
        description: 'Your portfolio has drifted 8% from target allocation. Consider rebalancing to maintain optimal risk-return profile.',
        priority: 'high',
        actionLabel: 'Review Strategy',
      },
      {
        id: '2',
        type: 'tax-loss',
        title: 'Tax-Loss Harvesting Opportunity',
        description: 'We identified $1,200 in unrealized losses that can offset gains and reduce your tax liability.',
        priority: 'high',
        actionLabel: 'Learn More',
      },
      {
        id: '3',
        type: 'risk',
        title: 'Risk Adjustment Suggestion',
        description: 'Based on recent market volatility, consider increasing bond allocation by 5% for better stability.',
        priority: 'medium',
        actionLabel: 'Adjust Risk',
      },
      {
        id: '4',
        type: 'market-trend',
        title: 'Market Trend Alert',
        description: 'Technology sector showing strong momentum. Your current tech allocation aligns well with market trends.',
        priority: 'low',
        actionLabel: 'View Details',
      },
    ];
    setTimeout(() => resolve(insights), 300);
  });
}

export async function getTrendingStocks(): Promise<TrendingStock[]> {
  return new Promise((resolve) => {
    const trending: TrendingStock[] = [
      { symbol: 'NVDA', name: 'NVIDIA Corp', price: 485.20, change: 12.50, changePercent: 2.65 },
      { symbol: 'AAPL', name: 'Apple Inc', price: 175.50, change: 3.20, changePercent: 1.86 },
      { symbol: 'MSFT', name: 'Microsoft', price: 380.25, change: 5.75, changePercent: 1.53 },
      { symbol: 'GOOGL', name: 'Alphabet', price: 142.30, change: -2.10, changePercent: -1.45 },
      { symbol: 'AMZN', name: 'Amazon.com', price: 148.90, change: 4.30, changePercent: 2.97 },
      { symbol: 'TSLA', name: 'Tesla Inc', price: 245.80, change: 8.50, changePercent: 3.58 },
      { symbol: 'META', name: 'Meta Platforms', price: 312.40, change: 6.20, changePercent: 2.02 },
      { symbol: 'NFLX', name: 'Netflix Inc', price: 425.60, change: -5.30, changePercent: -1.23 },
    ];
    setTimeout(() => resolve(trending), 300);
  });
}
