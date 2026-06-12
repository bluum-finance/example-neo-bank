'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/store/user.store';
import { getBankAccountsWithBalances } from '@/lib/wallet-display';
import { resolveDemoInvestorKey } from '@/lib/demo/trading-store';
import { isTradingDemo } from '@/lib/demo-mode';
import { formatBankBalance } from '@/lib/demo/bank-accounts';

export function useBankAccounts() {
  const user = useUser();
  const investorKey = resolveDemoInvestorKey(user?.externalAccountId ?? user?.email ?? 'local-demo');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isTradingDemo()) return;
    const onUpdate = () => setTick((t) => t + 1);
    window.addEventListener('demo-trading-updated', onUpdate);
    return () => window.removeEventListener('demo-trading-updated', onUpdate);
  }, []);

  void tick;

  return getBankAccountsWithBalances(isTradingDemo() ? investorKey : undefined).map((account) => ({
    id: account.id,
    label: account.label,
    mask: account.mask,
    type: account.type,
    balance: account.balance,
    balanceFormatted: formatBankBalance(account.balance),
  }));
}
