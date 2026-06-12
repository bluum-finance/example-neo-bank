import { create } from 'zustand';
import type { ExternalAccountStatus } from '@/lib/bluum-api.types';
import { AccountService, type Account } from '@/services/account.service';
import { InvestmentService, type Order, type Position } from '@/services/investment.service';
import { WidgetService, type PerformanceDataPoint } from '@/services/widget.service';
import { calculatePortfolioValue } from '@/lib/portfolio-value';
import { isTradingDemo } from '@/lib/demo-mode';
import { useUserStore } from '@/store/user.store';

/** Investor not yet active — show compliance / verification overlay */
export type OnboardingGateStatus = 'onboarding' | 'under_review' | 'awaiting_documents' | 'declined';

function deriveOnboardingGateStatus(status?: ExternalAccountStatus): OnboardingGateStatus | null {
  if (status === 'declined') return 'declined';
  if (
    status === 'onboarding' ||
    status === 'under_review' ||
    status === 'awaiting_documents' ||
    status === 'setup_failed' ||
    status === 'suspended'
  ) {
    return status === 'setup_failed' || status === 'suspended' ? 'under_review' : status;
  }
  return null;
}

interface AccountState {
  // Data
  account: Account | null;
  accountBalance: number;
  portfolioId: string;
  positions: Position[];
  orders: Order[];
  summaryData: unknown | null;
  chartData: PerformanceDataPoint[];
  /** Non-active investor — dashboard may show compliance overlay */
  onboardingGateStatus: OnboardingGateStatus | null;

  // Status
  isLoading: boolean;
  isPositionsLoading: boolean;
  isOrdersLoading: boolean;
  isSummaryLoading: boolean;
  isChartLoading: boolean;
  error: string | null;

  // Actions
  fetchAccount: (accountId: string, options?: { silent?: boolean; force?: boolean }) => Promise<Account | null>;
  fetchPositions: (accountId: string, options?: { force?: boolean }) => Promise<Position[]>;
  fetchOrders: (accountId: string, opts?: { limit?: number }) => Promise<Order[]>;
  fetchSummary: (accountId: string, portfolioId: string) => Promise<void>;
  fetchChartData: (accountId: string, portfolioId: string, range?: '1W' | '1M' | '3M' | '1Y' | 'All') => Promise<void>;
  setAccountBalance: (balance: number) => void;
  setPortfolioId: (portfolioId: string) => void;
  setOnboardingGateStatus: (status: OnboardingGateStatus | null) => void;
  clearAccount: () => void;
}

const accountFetchInFlight = new Map<string, Promise<Account | null>>();
const positionsFetchInFlight = new Map<string, Promise<Position[]>>();

export const useAccountStore = create<AccountState>()((set, get) => ({
  account: null,
  accountBalance: 0,
  portfolioId: 'ptf_demo_main',
  positions: [],
  orders: [],
  summaryData: null,
  chartData: [],
  onboardingGateStatus: null,
  isLoading: false,
  isPositionsLoading: false,
  isOrdersLoading: false,
  isSummaryLoading: false,
  isChartLoading: false,
  error: null,

  fetchAccount: async (accountId: string, options?: { silent?: boolean; force?: boolean }) => {
    const cached = get().account;
    if (!options?.force && cached?.id === accountId) {
      return cached;
    }

    const pending = accountFetchInFlight.get(accountId);
    if (!options?.force && pending) {
      return pending;
    }

    const run = (async () => {
      if (!options?.silent) {
        set({ isLoading: true, error: null });
      }
      try {
        const account = await AccountService.getAccount(accountId);
        if (account?.id && account.id !== accountId) {
          useUserStore.getState().setExternalAccountId(account.id);
        }
        const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
        const portfolioId: string = (account as any)?.portfolios?.find((p: any) => p.status === 'active')?.id ?? 'ptf_demo_main';

        set({
          account,
          accountBalance: isTradingDemo() ? 0 : balanceValue,
          portfolioId,
          isLoading: false,
          onboardingGateStatus: deriveOnboardingGateStatus(account.status as ExternalAccountStatus),
        });

        return account;
      } catch (err: any) {
        set({
          onboardingGateStatus: null,
          error: err?.message ?? 'Failed to load account',
          isLoading: false,
        });
        throw err;
      } finally {
        accountFetchInFlight.delete(accountId);
      }
    })();

    accountFetchInFlight.set(accountId, run);
    return run;
  },

  fetchPositions: async (accountId: string, options?: { force?: boolean }) => {
    const { account, positions, isPositionsLoading } = get();
    if (!options?.force && account?.id === accountId && positions.length > 0 && !isPositionsLoading) {
      return positions;
    }

    const pending = positionsFetchInFlight.get(accountId);
    if (!options?.force && pending) {
      return pending;
    }

    const run = (async () => {
      set({ isPositionsLoading: true, error: null });
      try {
        const nextPositions = await InvestmentService.getPositions(accountId);
        set({ positions: nextPositions, isPositionsLoading: false });
        return nextPositions;
      } catch (err: any) {
        set({ error: err?.message ?? 'Failed to load positions', isPositionsLoading: false });
        throw err;
      } finally {
        positionsFetchInFlight.delete(accountId);
      }
    })();

    positionsFetchInFlight.set(accountId, run);
    return run;
  },

  fetchOrders: async (accountId: string, opts?: { limit?: number }) => {
    set({ isOrdersLoading: true, error: null });
    try {
      const orders = await InvestmentService.getOrders(accountId, { limit: opts?.limit ?? 50 });
      set({ orders, isOrdersLoading: false });
      return orders;
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to load orders', isOrdersLoading: false });
      throw err;
    }
  },

  fetchSummary: async (accountId: string, portfolioId: string) => {
    if (get().summaryData && !get().isSummaryLoading) {
      return;
    }
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
      orders: [],
      summaryData: null,
      chartData: [],
      onboardingGateStatus: null,
      isPositionsLoading: false,
      isOrdersLoading: false,
      isSummaryLoading: false,
      isChartLoading: false,
      error: null,
    }),
}));

// Selector hooks
export const useAccount = () => useAccountStore((state) => state.account);
export const useAccountBalance = () => useAccountStore((state) => state.accountBalance);
export const usePortfolioId = () => useAccountStore((state) => state.portfolioId);
export const useAccountLoading = () => useAccountStore((state) => state.isLoading);
export const usePositions = () => useAccountStore((state) => state.positions);
export const useOrders = () => useAccountStore((state) => state.orders);
export const useOrdersLoading = () => useAccountStore((state) => state.isOrdersLoading);
export const useSummaryData = () => useAccountStore((state) => state.summaryData);
export const useChartData = () => useAccountStore((state) => state.chartData);
export const useSummaryLoading = () => useAccountStore((state) => state.isSummaryLoading);
export const useChartLoading = () => useAccountStore((state) => state.isChartLoading);
export const usePortfolioValue = () =>
  useAccountStore((state) => calculatePortfolioValue(state.accountBalance, state.positions));
export const useOnboardingGateStatus = () => useAccountStore((state) => state.onboardingGateStatus);
