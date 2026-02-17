'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { InvestOnboarding } from '@/components/invest/onboarding';
import { PortfolioPerformanceChart } from '@/components/invest/portfolio-performance-chart';
import { QuickActionsWidget } from '@/components/invest/quick-actions-widget';

import { InvestmentService, type Position } from '@/services/investment.service';
import { AccountService } from '@/services/account.service';
import { WidgetService, type PerformanceDataPoint } from '@/services/widget.service';
import { getAuth, setExternalAccountId, clearExternalAccountId } from '@/lib/auth';
import { FundingOptionsWidget } from '@/components/dashboard/funding-options-widget';
import { ActionsList } from '@/components/dashboard/actions-list';
import { AccountsWidget } from '@/components/dashboard/accounts-widget';
import { MoneyMovementWidget } from '@/components/dashboard/money-movement-widget';
import { TransactionDatatable } from '@/components/dashboard/transaction-datatable';

export default function Invest() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [portfolioGains, setPortfolioGains] = useState({ totalGain: 0, totalGainPercent: 0 });
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<PerformanceDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [hasAccountId, setHasAccountId] = useState(false);
  const [showAIOnboarding, setShowAIOnboarding] = useState(false);

  const loadSummaryData = async (userAccountId: string, detectedPortfolioId: string) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const summary = await WidgetService.getPortfolioSummary(
        userAccountId,
        detectedPortfolioId,
      );
      setSummaryData(summary);
    } catch (error: any) {
      console.error('Failed to load portfolio summary', error);
      setSummaryError(error?.message || 'Unable to load portfolio summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadChartData = async (
    userAccountId: string,
    detectedPortfolioId: string,
    range: '1W' | '1M' | '3M' | '1Y' | 'All' = '1M',
  ) => {
    setChartLoading(true);
    setChartError(null);
    try {
      const data = await WidgetService.getPortfolioPerformanceData(
        range,
        userAccountId,
        detectedPortfolioId,
      );
      setChartData(data);
    } catch (error: any) {
      console.error('Failed to load performance data', error);
      setChartError(error?.message || 'Unable to load chart data');
    } finally {
      setChartLoading(false);
    }
  };

  const handleRangeChange = async (range: '1W' | '1M' | '3M' | '1Y' | 'All') => {
    if (accountId && portfolioId) {
      await loadChartData(accountId, portfolioId, range);
    }
  };

  const loadPortfolio = async (userAccountId: string) => {
    try {
      setLoading(true);

      setAccountId(userAccountId);
      let account;
      try {
        account = await AccountService.getAccount(userAccountId);
      } catch (err) {
        toast.error('Error fetching account. Please try again later.');
        setLoading(false);
        return;
      }

      const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
      setAccountBalance(balanceValue);
      const accountData = account as any;
      const detectedPortfolioId =
        accountData?.portfolios?.find((p: any) => p.status === 'active')?.id ||
        'ptf_demo_main';
      setPortfolioId(detectedPortfolioId);

      if (detectedPortfolioId) {
        await Promise.all([
          loadSummaryData(userAccountId, detectedPortfolioId),
          loadChartData(userAccountId, detectedPortfolioId),
        ]);
      } else {
        setSummaryData(null);
        setSummaryError(null);
        setChartData([]);
        setChartError(null);
      }

      // Fetch positions
      const positionsData = await InvestmentService.getPositions(userAccountId);
      setPositions(positionsData);

      // Calculate portfolio gains
      const totals = InvestmentService.calculatePortfolioTotals(positionsData);
      setPortfolioGains({
        totalGain: totals.totalGain,
        totalGainPercent: totals.totalGainPercent,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portfolio';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getAuth();
    const userAccountId = user?.externalAccountId;

    if (userAccountId) {
      setHasAccountId(true);
      setAccountId(userAccountId);
      loadPortfolio(userAccountId);
    } else {
      setHasAccountId(false);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              portfolioValue={
                accountBalance + positions.reduce((sum, pos) => sum + (pos.value || 0), 0)
              }
              data={chartData}
              portfolioPerformance={portfolioGains.totalGainPercent}
              summaryData={summaryData}
              summaryLoading={summaryLoading}
              summaryError={summaryError}
              onRangeChange={handleRangeChange}
              accountId={accountId || undefined}
              portfolioId={portfolioId || undefined}
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
