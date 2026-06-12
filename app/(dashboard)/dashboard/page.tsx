'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PortfolioPerformanceChart } from '@/components/invest/portfolio-performance-chart';
import { AccountService } from '@/services/account.service';
import { WidgetService, type PerformanceDataPoint } from '@/services/widget.service';
import { useUser } from '@/store/user.store';
import { useAccountStore } from '@/store/account.store';
import { isTradingDemo } from '@/lib/demo-mode';
import { resolveDemoInvestorKey } from '@/lib/demo/trading-store';
import { FundingOptionsWidget } from '@/components/dashboard/funding-options-widget';
import { ActionsList } from '@/components/dashboard/actions-list';
import { AccountsWidget } from '@/components/dashboard/accounts-widget';
import { MoneyMovementWidget } from '@/components/dashboard/money-movement-widget';
import { TransactionDatatable } from '@/components/dashboard/transaction-datatable';

export default function Invest() {
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<PerformanceDataPoint[]>([]);
  const user = useUser();
  const fetchPositions = useAccountStore((s) => s.fetchPositions);
  const fetchAccount = useAccountStore((s) => s.fetchAccount);

  const loadSummaryData = async (userAccountId: string, detectedPortfolioId: string) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const summary = await WidgetService.getPortfolioSummary(userAccountId, detectedPortfolioId);
      setSummaryData(summary);
    } catch (error: any) {
      console.error('Failed to load portfolio summary', error);
      setSummaryError(error?.message || 'Unable to load portfolio summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadChartData = async (userAccountId: string, detectedPortfolioId: string, range: '1W' | '1M' | '3M' | '1Y' | 'All' = '1M') => {
    try {
      const data = await WidgetService.getPortfolioPerformanceData(range, userAccountId, detectedPortfolioId);
      setChartData(data);
    } catch (error: any) {
      console.error('Failed to load performance data', error);
    }
  };

  const handleRangeChange = async (range: '1W' | '1M' | '3M' | '1Y' | 'All') => {
    if (accountId && portfolioId) {
      await loadChartData(accountId, portfolioId, range);
    }
  };

  const loadPortfolio = async (wealthAccountId: string) => {
    try {
      setLoading(true);
      setAccountId(wealthAccountId);

      const tradingAccountId = resolveDemoInvestorKey(wealthAccountId ?? user?.email ?? 'local-demo');
      const positionsAccountId = isTradingDemo() ? tradingAccountId : wealthAccountId;

      let account;
      try {
        account = await AccountService.getAccount(wealthAccountId);
      } catch (err) {
        toast.error('Error fetching account. Please try again later.');
        setLoading(false);
        return;
      }

      const accountData = account as any;
      const detectedPortfolioId = accountData?.portfolios?.find((p: any) => p.status === 'active')?.id || 'ptf_demo_main';
      setPortfolioId(detectedPortfolioId);

      await Promise.all([
        fetchAccount(wealthAccountId, { silent: true }),
        loadSummaryData(wealthAccountId, detectedPortfolioId),
        loadChartData(wealthAccountId, detectedPortfolioId),
        fetchPositions(positionsAccountId, { force: true }),
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portfolio';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const wealthAccountId = user?.externalAccountId;
    if (!wealthAccountId && !isTradingDemo()) {
      setLoading(false);
      return;
    }
    if (wealthAccountId) {
      void loadPortfolio(wealthAccountId);
    } else {
      const tradingAccountId = resolveDemoInvestorKey(user?.email ?? 'local-demo');
      setAccountId(tradingAccountId);
      void fetchPositions(tradingAccountId, { force: true }).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.externalAccountId, user?.email]);

  useEffect(() => {
    if (!isTradingDemo()) return;
    const tradingAccountId = resolveDemoInvestorKey(user?.externalAccountId ?? user?.email ?? 'local-demo');
    const onUpdate = () => {
      void fetchPositions(tradingAccountId, { force: true });
    };
    window.addEventListener('demo-trading-updated', onUpdate);
    return () => window.removeEventListener('demo-trading-updated', onUpdate);
  }, [fetchPositions, user?.externalAccountId, user?.email]);

  return (
    <div className="space-y-6 my-4">
      <section>
        <FundingOptionsWidget />
      </section>

      <section className="pt-6 space-y-4">
        <div className="space-y-4">
          <ActionsList />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,60%)_minmax(0,40%)] gap-y-6 lg:gap-x-6 items-stretch">
          {/* Left (2/3 width) */}
          <div className="lg:col-span-1">
            <PortfolioPerformanceChart
              data={chartData}
              summaryData={summaryData}
              summaryLoading={summaryLoading}
              summaryError={summaryError}
              onRangeChange={handleRangeChange}
            />
          </div>

          {/* Right (1/3 width) */}
          <div className="lg:col-span-1">
            <AccountsWidget />
          </div>
        </div>
      </section>

      <section className="pt-6">
        <MoneyMovementWidget />
      </section>

      <section className="pt-6">
        <TransactionDatatable />
      </section>
    </div>
  );
}
