import { create } from 'zustand';
import type { AccountStatus } from '@/types/bluum';
import { AccountService, type Account } from '@/services/account.service';
import { InvestmentService, type Position } from '@/services/investment.service';
import { WidgetService, type PerformanceDataPoint } from '@/services/widget.service';

export type OnboardingGateStatus = Extract<AccountStatus, 'PENDING' | 'REJECTED'>;

function deriveOnboardingGateStatus(status?: AccountStatus): OnboardingGateStatus | null {
  if (status === 'PENDING' || status === 'REJECTED') return status;
  return null;
}

interface AccountState {
  // Data
  account: Account | null;
  accountBalance: number;
  portfolioId: string;
  positions: Position[];
  summaryData: unknown | null;
  chartData: PerformanceDataPoint[];
  /** PENDING / REJECTED — dashboard shows compliance onboarding overlay */
  onboardingGateStatus: OnboardingGateStatus | null;

  // Status
  isLoading: boolean;
  isPositionsLoading: boolean;
  isSummaryLoading: boolean;
  isChartLoading: boolean;
  error: string | null;

  // Actions
  fetchAccount: (accountId: string) => Promise<Account | null>;
  fetchPositions: (accountId: string) => Promise<Position[]>;
  fetchSummary: (accountId: string, portfolioId: string) => Promise<void>;
  fetchChartData: (accountId: string, portfolioId: string, range?: '1W' | '1M' | '3M' | '1Y' | 'All') => Promise<void>;
  setAccountBalance: (balance: number) => void;
  setPortfolioId: (portfolioId: string) => void;
  setOnboardingGateStatus: (status: OnboardingGateStatus | null) => void;
  clearAccount: () => void;
}

export const useAccountStore = create<AccountState>()((set) => ({
  account: null,
  accountBalance: 0,
  portfolioId: 'ptf_demo_main',
  positions: [],
  summaryData: null,
  chartData: [],
  onboardingGateStatus: null,
  isLoading: false,
  isPositionsLoading: false,
  isSummaryLoading: false,
  isChartLoading: false,
  error: null,

  fetchAccount: async (accountId: string) => {
    set({ isLoading: true, error: null });
    try {
      const account = await AccountService.getAccount(accountId);
      const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
      const portfolioId: string = (account as any)?.portfolios?.find((p: any) => p.status === 'active')?.id ?? 'ptf_demo_main';

      set({
        account,
        accountBalance: balanceValue,
        portfolioId,
        isLoading: false,
        onboardingGateStatus: deriveOnboardingGateStatus(account.status as AccountStatus),
      });

      return account;
    } catch (err: any) {
      set({
        onboardingGateStatus: null,
        error: err?.message ?? 'Failed to load account',
        isLoading: false,
      });
      throw err;
    }
  },

  fetchPositions: async (accountId: string) => {
    set({ isPositionsLoading: true, error: null });
    try {
      const positions = await InvestmentService.getPositions(accountId);
      set({ positions, isPositionsLoading: false });
      return positions;
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to load positions', isPositionsLoading: false });
      throw err;
    }
  },

  fetchSummary: async (accountId: string, portfolioId: string) => {
    set({ isSummaryLoading: true, error: null });
    try {
      const summaryData = await WidgetService.getPortfolioSummary(accountId, portfolioId);
      set({ summaryData, isSummaryLoading: false });
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to load portfolio summary', isSummaryLoading: false });
      throw err;
    }
  },

  fetchChartData: async (accountId: string, portfolioId: string, range: '1W' | '1M' | '3M' | '1Y' | 'All' = '1M') => {
    set({ isChartLoading: true, error: null });
    try {
      const chartData = await WidgetService.getPortfolioPerformanceData(range, accountId, portfolioId);
      set({ chartData, isChartLoading: false });
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to load performance data', isChartLoading: false });
      throw err;
    }
  },

  setAccountBalance: (balance: number) => set({ accountBalance: balance }),

  setPortfolioId: (portfolioId: string) => set({ portfolioId }),

  setOnboardingGateStatus: (status: OnboardingGateStatus | null) => set({ onboardingGateStatus: status }),

  clearAccount: () =>
    set({
      account: null,
      accountBalance: 0,
      portfolioId: 'ptf_demo_main',
      positions: [],
      summaryData: null,
      chartData: [],
      onboardingGateStatus: null,
      isPositionsLoading: false,
      isSummaryLoading: false,
      isChartLoading: false,
      error: null,
    }),
}));

// Helper function to calculate portfolio value
const calculatePortfolioValue = (accountBalance: number, positions: Position[]): number => {
  const positionsValue = positions.reduce((sum, position) => sum + (position.value || 0), 0);
  return accountBalance + positionsValue;
};

// Selector hooks
export const useAccount = () => useAccountStore((state) => state.account);
export const useAccountBalance = () => useAccountStore((state) => state.accountBalance);
export const usePortfolioId = () => useAccountStore((state) => state.portfolioId);
export const useAccountLoading = () => useAccountStore((state) => state.isLoading);
export const usePositions = () => useAccountStore((state) => state.positions);
export const useSummaryData = () => useAccountStore((state) => state.summaryData);
export const useChartData = () => useAccountStore((state) => state.chartData);
export const useSummaryLoading = () => useAccountStore((state) => state.isSummaryLoading);
export const useChartLoading = () => useAccountStore((state) => state.isChartLoading);
export const usePortfolioValue = () => useAccountStore((state) => calculatePortfolioValue(state.accountBalance, state.positions));
export const useOnboardingGateStatus = () => useAccountStore((state) => state.onboardingGateStatus);
