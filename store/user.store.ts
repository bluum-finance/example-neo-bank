import { config } from '@/lib/config';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  email: string;
  name: string;
  externalAccountId?: string;
  investmentChoice?: 'ai-wealth' | 'self-directed';
  phoneNumber?: string;
  streetAddress?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasLoaded: boolean;
  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setExternalAccountId: (accountId: string) => void;
  clearExternalAccountId: () => void;
  // Auth helpers
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Demo credentials
export const INVESTOR_EMAIL1 = 'johndoe@bluuminvest.com'; // AI Wealth flow
export const INVESTOR_EMAIL2 = 'investor@bluuminvest.com'; // New investor flow

const DEMO_INVESTOR_ACCOUNT_ID = config.demoInvestorAccountId;

// Mock user account data for demo
const mockUserAccount = {
  name: 'Demo Investor',
  phoneNumber: '+1 (555) 123-4567',
  streetAddress: ['123 Investment Ave'],
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'United States',
  firstName: 'Demo',
  lastName: 'Investor',
  dateOfBirth: '1990-01-15',
  countryOfBirth: 'United States',
};

const generateRandomEmail = () => {
  return `investor${Math.floor(1000 + Math.random() * 9000)}@bluuminvest.com`;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasLoaded: false,
      isLoading: false,

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      clearUser: () => {
        set({ user: null, isAuthenticated: false });
      },

      setExternalAccountId: (accountId: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, externalAccountId: accountId } });
        }
      },

      clearExternalAccountId: () => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, externalAccountId: undefined } });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Demo login validation
        const isEmailValid = email === INVESTOR_EMAIL1 || email === INVESTOR_EMAIL2;
        const isPasswordValid = password.length >= 8;

        if (!isEmailValid || !isPasswordValid) {
          set({ isLoading: false });
          return { success: false, error: 'Invalid email or password.' };
        }

        const isNewInvestor = email === INVESTOR_EMAIL2;
        const userEmail = isNewInvestor ? generateRandomEmail() : email;
        const investmentChoice = isNewInvestor ? 'ai-wealth' : undefined;

        set({
          user: {
            email: userEmail,
            name: mockUserAccount.name,
            phoneNumber: mockUserAccount.phoneNumber,
            streetAddress: mockUserAccount.streetAddress,
            city: mockUserAccount.city,
            state: mockUserAccount.state,
            postalCode: mockUserAccount.postalCode,
            country: mockUserAccount.country,
            firstName: mockUserAccount.firstName,
            lastName: mockUserAccount.lastName,
            dateOfBirth: mockUserAccount.dateOfBirth,
            countryOfBirth: mockUserAccount.countryOfBirth,
            externalAccountId: isNewInvestor ? undefined : DEMO_INVESTOR_ACCOUNT_ID,
            investmentChoice: investmentChoice,
          },
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'bluum-user',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasLoaded = true;
        }
      },
    }
  )
);

// Selector hooks for common use cases
export const useHasLoaded = () => useUserStore((state) => state.hasLoaded);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useUser = () => useUserStore((state) => state.user);
export const useExternalAccountId = () => useUserStore((state) => state.user?.externalAccountId);
