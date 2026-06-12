import { create } from 'zustand';
import type { Wallet } from '@/lib/bluum-api.types';
import { WalletService } from '@/services/wallet.service';

interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  lastInvestorId: string | null;
  fetchWallets: (investorId: string) => Promise<Wallet[]>;
  getActiveWallet: (currency: string) => Wallet | null;
  clearWallets: () => void;
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  wallets: [],
  isLoading: false,
  error: null,
  lastInvestorId: null,

  fetchWallets: async (investorId: string) => {
    set({ isLoading: true, error: null, lastInvestorId: investorId });
    try {
      const wallets = await WalletService.getWallets(investorId);
      set({ wallets, isLoading: false });
      return wallets;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load wallets';
      set({ wallets: [], error: message, isLoading: false });
      return [];
    }
  },

  getActiveWallet: (currency: string) => {
    return get().wallets.find((w) => w.currency === currency && w.status === 'active') ?? null;
  },

  clearWallets: () => set({ wallets: [], isLoading: false, error: null, lastInvestorId: null }),
}));

export const useWallets = () => useWalletStore((s) => s.wallets);
export const useWalletsLoading = () => useWalletStore((s) => s.isLoading);
export const useFetchWallets = () => useWalletStore((s) => s.fetchWallets);
