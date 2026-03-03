import { create } from 'zustand';
import { AccountService, type Account } from '@/services/account.service';

interface AccountState {
  // Data
  account: Account | null;
  accountBalance: number;
  portfolioId: string;

  // Status
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAccount: (accountId: string) => Promise<Account | null>;
  setAccountBalance: (balance: number) => void;
  setPortfolioId: (portfolioId: string) => void;
  clearAccount: () => void;
}

export const useAccountStore = create<AccountState>()((set) => ({
  account: null,
  accountBalance: 0,
  portfolioId: 'ptf_demo_main',
  isLoading: false,
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
      });

      return account;
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to load account', isLoading: false });
      throw err;
    }
  },

  setAccountBalance: (balance: number) => set({ accountBalance: balance }),

  setPortfolioId: (portfolioId: string) => set({ portfolioId }),

  clearAccount: () => set({ account: null, accountBalance: 0, portfolioId: 'ptf_demo_main', error: null }),
}));

// Selector hooks
export const useAccount = () => useAccountStore((state) => state.account);
export const useAccountBalance = () => useAccountStore((state) => state.accountBalance);
export const usePortfolioId = () => useAccountStore((state) => state.portfolioId);
export const useAccountLoading = () => useAccountStore((state) => state.isLoading);
