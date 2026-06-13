'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronRight, Plus, ArrowLeftRight } from 'lucide-react';

import { PortfolioPerformanceChart } from '@/components/invest/portfolio-performance-chart';
import { FinancialPlan } from '@/components/invest/financial-plan';
import { InvestmentPolicyWidget } from '@/components/invest/investment-policy-widget';
import { QuickActionsWidget } from '@/components/invest/quick-actions-widget';
import { WelcomeInsightsCard } from '@/components/invest/welcome-insights-card';
import { MarketMoversOverview } from '@/components/widget/market-movers-overview';

import { InvestmentService } from '@/services/investment.service';
import { WidgetService, type WealthInsight, type Recommendation, type PerformanceDataPoint, FinancialGoal } from '@/services/widget.service';
import { useUser, useUserStore } from '@/store/user.store';
import {
  useAccountBalance,
  useAccountStore,
  useChartData,
  usePortfolioId,
  usePortfolioValue,
  usePositions,
  useSummaryData,
  useSummaryLoading,
} from '@/store/account.store';

import { OnboardingLandingPage } from '@/components/invest/onboarding-landing-page';
import HoldingsOverview from '@/components/widget/HoldingsOverview';
import { Watchlist } from '@/components/widget/watchlist';
import QuickTrade from '@/components/trade/quick-trade';
import { RecentTrades } from '@/components/widget/recent-trades';
import { NewsInsights } from '@/components/widget/news-insights';
import { PersonalizedStrategyCTA2 } from '@/components/ai-wealth/personalized-strategy-cta-2';
import { DepositDialog } from '@/components/payment/deposit-dialog';
import { WithdrawalDialog } from '@/components/payment/withdrawal-dialog';
import { isTradingDemo } from '@/lib/demo-mode';
import { resolveDemoInvestorKey } from '@/lib/demo/trading-store';

export default function Invest() {
  const router = useRouter();
  const user = useUser();
  const clearExternalAccountId = useUserStore((state) => state.clearExternalAccountId);

  // Account Store
  const accountBalance = useAccountBalance();
  const portfolioValue = usePortfolioValue();
  const portfolioId = usePortfolioId();
  const positions = usePositions();
  const summaryData = useSummaryData();
  const chartData = useChartData();
  const summaryLoading = useSummaryLoading();
  const { fetchAccount, fetchPositions, fetchOrders, fetchSummary, fetchChartData } = useAccountStore();
  const isAiWealth = user?.investmentChoice === 'AI-WEALTH';

  // Account & Portfolio State
  const [accountId, setAccountId] = useState<string | null>(null);

  // Loading & Error States
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);

  // Data States
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [investmentPolicy, setInvestmentPolicy] = useState<any>(null);
  const [widgetInsights, setWidgetInsights] = useState<{ insights: WealthInsight[]; recommendations: Recommendation[] } | undefined>(undefined);

  const loadWidgetData = useCallback(async (userAccountId: string) => {
    setInsightsLoading(true);
    setGoalsLoading(true);
    try {
      const [goals, policy, insights] = await Promise.all([
        WidgetService.getFinancialGoals(userAccountId).catch((err) => {
          console.error('Goals failed', err);
          return [];
        }),
        WidgetService.getInvestmentPolicy(userAccountId).catch((err) => {
          console.error('Policy failed', err);
          return null;
        }),
        WidgetService.getWidgetInsights(userAccountId).catch((err) => {
          console.error('Insights failed', err);
          return undefined;
        }),
      ]);

      setFinancialGoals(goals);
      setInvestmentPolicy(policy);
      setWidgetInsights(insights);
    } finally {
      setInsightsLoading(false);
      setGoalsLoading(false);
    }
  }, []);

  const loadAccountData = useCallback(
    async (opts: { wealthAccountId?: string; tradingAccountId: string }) => {
      const { wealthAccountId, tradingAccountId } = opts;
      const positionsAccountId = isTradingDemo() ? tradingAccountId : (wealthAccountId ?? tradingAccountId);

      try {
        const portfolioTasks: Promise<unknown>[] = [
          fetchPositions(positionsAccountId).catch(() => {}),
          fetchOrders(positionsAccountId, { limit: 5 }).catch(() => {}),
        ];

        if (wealthAccountId) {
          const account = await fetchAccount(wealthAccountId);
          const gate: string[] = ['onboarding', 'under_review', 'awaiting_documents', 'declined'];
          if (account?.status && gate.includes(account.status)) {
            return;
          }

          const currentPortfolioId = useAccountStore.getState().portfolioId;
          portfolioTasks.push(
            fetchSummary(wealthAccountId, currentPortfolioId).catch(() => {}),
            fetchChartData(wealthAccountId, currentPortfolioId).catch(() => {})
          );

          if (isAiWealth) {
            portfolioTasks.push(loadWidgetData(wealthAccountId).catch(() => {}));
          } else {
            setInsightsLoading(false);
            setGoalsLoading(false);
          }
        } else {
          setInsightsLoading(false);
          setGoalsLoading(false);
        }

        await Promise.all(portfolioTasks);
      } catch (err: any) {
        if (wealthAccountId && err?.status === 404) {
          clearExternalAccountId();
          router.push('/onboarding');
          return;
        }
        toast.error(err?.message || 'Failed to load portfolio');
      }
    },
    [clearExternalAccountId, fetchAccount, fetchChartData, fetchOrders, fetchPositions, fetchSummary, isAiWealth, loadWidgetData, router]
  );

  useEffect(() => {
    const tradingAccountId = resolveDemoInvestorKey(user?.externalAccountId ?? user?.email ?? 'local-demo');
    const wealthAccountId = user?.externalAccountId;

    if (!wealthAccountId && !isTradingDemo()) return;

    setAccountId(wealthAccountId ?? tradingAccountId);
    void loadAccountData({ wealthAccountId, tradingAccountId });
  }, [loadAccountData, user?.externalAccountId, user?.email]);

  useEffect(() => {
    if (!isTradingDemo()) return;
    const tradingAccountId = resolveDemoInvestorKey(user?.externalAccountId ?? user?.email ?? 'local-demo');
    const onUpdate = () => {
      void fetchPositions(tradingAccountId, { force: true });
      void fetchOrders(tradingAccountId, { limit: 5 });
    };
    window.addEventListener('demo-trading-updated', onUpdate);
    return () => window.removeEventListener('demo-trading-updated', onUpdate);
  }, [fetchOrders, fetchPositions, user?.externalAccountId, user?.email]);

  const handleRangeChange = (range: '1W' | '1M' | '3M' | '1Y' | 'All') => {
    const wealthAccountId = user?.externalAccountId ?? accountId;
    if (wealthAccountId && portfolioId) {
      fetchChartData(wealthAccountId, portfolioId, range).catch((error) => {
        console.error('Failed to update performance range', error);
      });
    }
  };

  const insightsList = widgetInsights?.insights || [];
  const portfolioGains = useMemo(() => InvestmentService.calculatePortfolioTotals(positions), [positions]);

  const resolvedAccountId =
    accountId ?? (isTradingDemo() ? resolveDemoInvestorKey(user?.externalAccountId ?? user?.email ?? 'local-demo') : undefined);

  if (!resolvedAccountId) {
    return (
      <div className="max-w-5xl mx-auto">
        <OnboardingLandingPage />
      </div>
    );
  }

  const dashboardProps = {
    insightsList,
    insightsLoading,
    totalPortfolioValue: portfolioValue,
    chartData,
    portfolioGains,
    summaryData,
    summaryLoading,
    handleRangeChange,
    accountId: resolvedAccountId,
    portfolioId,
    financialGoals,
    goalsLoading,
    investmentPolicy,
  };

  return user?.investmentChoice === 'AI-WEALTH' ? (
    <AiWealthDashboard {...dashboardProps} />
  ) : (
    <SelfDirectedDashboard {...dashboardProps} />
  );
}

const SelfDirectedDashboard = ({
  insightsList,
  insightsLoading,
  totalPortfolioValue,
  chartData,
  portfolioGains,
  summaryData,
  summaryLoading,
  handleRangeChange,
  accountId,
  portfolioId,
  financialGoals,
  goalsLoading,
  investmentPolicy,
}: {
  insightsList: WealthInsight[];
  insightsLoading: boolean;
  totalPortfolioValue: number;
  chartData: PerformanceDataPoint[];
  portfolioGains: { totalGain: number; totalGainPercent: number };
  summaryData: any;
  summaryLoading: boolean;
  handleRangeChange: (range: '1W' | '1M' | '3M' | '1Y' | 'All') => void;
  accountId: string | undefined;
  portfolioId: string | null;
  financialGoals: FinancialGoal[];
  goalsLoading: boolean;
  investmentPolicy: any;
}) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const accountRecord = useAccountStore((s) => s.account);
  const investorId = accountRecord?.id ?? accountId ?? undefined;

  const data: any[] = [
    { name: 'Stocks', value: 60, color: '#2BEE6C' },
    { name: 'ETFs', value: 25, color: '#047857' },
    { name: 'Cash & Bonds', value: 15, color: '#064E3B' },
  ];

  return (
    <div className="space-y-6 my-4 lg:px-8 mx-auto">
      <section className="pt-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowWithdrawModal(true)}
            className="px-3 py-2 bg-[#1A3A2C] rounded-full flex items-center gap-2 font-inter text-sm font-light text-white hover:bg-[#244d3a] transition-colors"
            aria-label="Withdraw funds"
          >
            <ArrowLeftRight className="w-4 h-4 text-white" />
            <span>Withdraw funds</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDepositModal(true)}
            className="px-3 py-2 bg-[#57B75C] rounded-[32px] flex items-center gap-2 font-inter text-sm font-light text-white hover:bg-[#4ca651] transition-colors"
            aria-label="Deposit funds"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Deposit Funds</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,60%)_minmax(0,40%)] gap-y-6 lg:gap-x-6 items-stretch">
        <div className="lg:col-span-1">
          <PortfolioPerformanceChart
            hideSummary={true}
            data={chartData}
            summaryData={summaryData}
            summaryLoading={summaryLoading}
            onRangeChange={handleRangeChange}
          />
        </div>

        <div className="lg:col-span-1">
          <HoldingsOverview />
        </div>
      </section>

      <section className="pt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,60%)_minmax(0,40%)] gap-y-6 lg:gap-x-6 items-stretch">
        <div className="lg:col-span-1">
          <QuickTrade />
        </div>

        <div className="lg:col-span-1">
          <Watchlist />
        </div>
      </section>

      <section className="pt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketMoversOverview />
        <RecentTrades />
      </section>

      <section className="pt-8">
        <NewsInsights />
      </section>

      {showDepositModal && investorId && (
        <DepositDialog accountId={investorId} onSuccess={() => setShowDepositModal(false)} onCancel={() => setShowDepositModal(false)} />
      )}

      {showWithdrawModal && investorId && (
        <WithdrawalDialog
          accountId={investorId}
          availableBalance={0}
          onSuccess={() => setShowWithdrawModal(false)}
          onCancel={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
};

const AiWealthDashboard = ({
  insightsList,
  insightsLoading,
  totalPortfolioValue,
  chartData,
  portfolioGains,
  summaryData,
  summaryLoading,
  handleRangeChange,
  accountId,
  portfolioId,
  financialGoals,
  goalsLoading,
  investmentPolicy,
}: {
  insightsList: WealthInsight[];
  insightsLoading: boolean;
  totalPortfolioValue: number;
  chartData: PerformanceDataPoint[];
  portfolioGains: { totalGain: number; totalGainPercent: number };
  summaryData: any;
  summaryLoading: boolean;
  handleRangeChange: (range: '1W' | '1M' | '3M' | '1Y' | 'All') => void;
  accountId: string | undefined;
  portfolioId: string | null;
  financialGoals: FinancialGoal[];
  goalsLoading: boolean;
  investmentPolicy: any;
}) => {
  return (
    <div className="space-y-6 my-4 lg:px-8 max-w-5xl mx-auto">
      {/* <section className="pb-6">
        <PersonalizedStrategyCTA />
      </section> */}

      <WelcomeInsightsCard insights={insightsList} insightsLoading={insightsLoading} />

      <section className="py-5">
        <PersonalizedStrategyCTA2 />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,60%)_minmax(0,40%)] gap-y-6 lg:gap-x-6 items-stretch">
        <div className="lg:col-span-1">
          <PortfolioPerformanceChart
            data={chartData}
            summaryData={summaryData}
            summaryLoading={summaryLoading}
            onRangeChange={handleRangeChange}
          />
        </div>

        <div className="lg:col-span-1">
          <QuickActionsWidget />
        </div>
      </section>

      <section className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-base font-semibold text-gray-900 dark:text-white">Financial Plan</div>
          {financialGoals.length > 0 && (
            <Link href="/financial-plan" className="flex items-center gap-0.5 text-sm text-[#57B75C] hover:opacity-80 transition-opacity">
              View all goals
              <ChevronRight className="w-3 h-3 text-[#57B75C]" />
            </Link>
          )}
        </div>
        <FinancialPlan goals={financialGoals.slice(0, 4)} loading={goalsLoading} />
      </section>

      <section className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 flex flex-col justify-start items-start">
            <div className="text-base font-semibold text-gray-900 dark:text-white">Investment Policy Statement</div>
            <div className="text-xs font-normal pt-2 text-gray-500 dark:text-muted-foreground">Your personalized investment guidelines</div>
          </div>
          <div className="px-2 py-1 bg-[rgba(129,140,248,0.12)] rounded-2xl flex items-center justify-center">
            <span className="text-xs font-medium leading-4.5 text-[#818CF8]">On Track</span>
          </div>
        </div>
        <InvestmentPolicyWidget policy={investmentPolicy} />
      </section>

      <section className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketMoversOverview />
        <RecentTrades />
      </section>

      <section className="pt-6">
        <NewsInsights />
      </section>
    </div>
  );
};
