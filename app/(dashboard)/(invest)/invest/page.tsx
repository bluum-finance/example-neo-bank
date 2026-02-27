'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronRight, ArrowDownLeft, ArrowUpRight, Plus, ArrowLeftRight } from 'lucide-react';

import { PortfolioPerformanceChart } from '@/components/invest/portfolio-performance-chart';
import { FinancialPlan } from '@/components/invest/financial-plan';
import { InvestmentPolicyWidget } from '@/components/invest/investment-policy-widget';
import { QuickActionsWidget } from '@/components/invest/quick-actions-widget';
import { WelcomeInsightsCard } from '@/components/invest/welcome-insights-card';
import { MarketMoversOverview } from '@/components/widget/market-movers-overview';

import { InvestmentService, type Position } from '@/services/investment.service';
import { AccountService } from '@/services/account.service';
import { WidgetService, type Insight, type Recommendation, type PerformanceDataPoint, FinancialGoal } from '@/services/widget.service';
import { useUser, useUserStore } from '@/store/user.store';

import { OnboardingLandingPage } from '@/components/invest/onboarding-landing-page';
import HoldingsOverview from '@/components/widget/HoldingsOverview';
import { Watchlist } from '@/components/widget/watchlist';
import QuickTrade from '@/components/trade/quick-trade';
import { RecentTrades } from '@/components/widget/recent-trades';
import { NewsInsights } from '@/components/widget/news-insights';
import { PersonalizedStrategyCTA } from '@/components/ai-wealth/personalized-strategy-cta';
import { PersonalizedStrategyCTA2 } from '@/components/ai-wealth/personalized-strategy-cta-2';
import { DepositDialog } from '@/components/payment/deposit-dialog';
import { WithdrawalDialog } from '@/components/payment/withdrawal-dialog';

export default function Invest() {
  const router = useRouter();
  const user = useUser();
  const clearExternalAccountId = useUserStore((state) => state.clearExternalAccountId);

  // Account & Portfolio State
  const [accountId, setAccountId] = useState<string | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolioGains, setPortfolioGains] = useState({
    totalGain: 0,
    totalGainPercent: 0,
  });

  // Loading & Error States
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);

  // Data States
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [chartData, setChartData] = useState<PerformanceDataPoint[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [investmentPolicy, setInvestmentPolicy] = useState<any>(null);
  const [widgetInsights, setWidgetInsights] = useState<{ insights: Insight[]; recommendations: Recommendation[] } | undefined>(undefined);

  const loadSummaryData = useCallback(async (userAccountId: string, detectedPortfolioId: string) => {
    setSummaryLoading(true);
    try {
      const summary = await WidgetService.getPortfolioSummary(userAccountId, detectedPortfolioId);
      setSummaryData(summary);
    } catch (error: any) {
      console.error('Failed to load portfolio summary', error);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadChartData = useCallback(
    async (userAccountId: string, detectedPortfolioId: string, range: '1W' | '1M' | '3M' | '1Y' | 'All' = '1M') => {
      setChartLoading(true);
      try {
        const data = await WidgetService.getPortfolioPerformanceData(range, userAccountId, detectedPortfolioId);
        setChartData(data);
      } catch (error: any) {
        console.error('Failed to load performance data', error);
      } finally {
        setChartLoading(false);
      }
    },
    []
  );

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

  const loadPortfolioData = useCallback(
    async (userAccountId: string) => {
      try {
        const account = await AccountService.getAccount(userAccountId);
        const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
        setAccountBalance(balanceValue);

        const detectedPortfolioId = (account as any)?.portfolios?.find((p: any) => p.status === 'active')?.id || 'ptf_demo_main';
        setPortfolioId(detectedPortfolioId);

        const positionsData = await InvestmentService.getPositions(userAccountId);
        setPositions(positionsData);

        const totals = InvestmentService.calculatePortfolioTotals(positionsData);
        setPortfolioGains({
          totalGain: totals.totalGain,
          totalGainPercent: totals.totalGainPercent,
        });

        await Promise.all([
          loadSummaryData(userAccountId, detectedPortfolioId),
          loadChartData(userAccountId, detectedPortfolioId),
          loadWidgetData(userAccountId),
        ]);
      } catch (err: any) {
        if (err?.status === 404) {
          clearExternalAccountId();
          router.push('/onboarding');
          return;
        }
        toast.error(err?.message || 'Failed to load portfolio');
      }
    },
    [loadSummaryData, loadChartData, loadWidgetData, router]
  );

  useEffect(() => {
    const userAccountId = user?.externalAccountId;

    if (!userAccountId) return;

    setAccountId(userAccountId);
    loadPortfolioData(userAccountId);
  }, [loadPortfolioData, router, user?.externalAccountId]);

  const handleRangeChange = (range: '1W' | '1M' | '3M' | '1Y' | 'All') => {
    if (accountId && portfolioId) {
      loadChartData(accountId, portfolioId, range);
    }
  };

  const insightsList = widgetInsights?.insights || [];
  const totalPortfolioValue = accountBalance + positions.reduce((sum, pos) => sum + (pos.value || 0), 0);

  if (!accountId) {
    return (
      <div className="max-w-5xl mx-auto">
        <OnboardingLandingPage />
      </div>
    );
  }

  if (user?.investmentChoice === 'AI-WEALTH') {
    return (
      <AiWealthDashboard
        insightsList={insightsList}
        insightsLoading={insightsLoading}
        totalPortfolioValue={totalPortfolioValue}
        chartData={chartData}
        portfolioGains={portfolioGains}
        summaryData={summaryData}
        summaryLoading={summaryLoading}
        handleRangeChange={handleRangeChange}
        accountId={accountId}
        portfolioId={portfolioId}
        financialGoals={financialGoals}
        goalsLoading={goalsLoading}
        investmentPolicy={investmentPolicy}
      />
    );
  }

  return (
    <SelfDirectedDashboard
      insightsList={insightsList}
      insightsLoading={insightsLoading}
      totalPortfolioValue={totalPortfolioValue}
      chartData={chartData}
      portfolioGains={portfolioGains}
      summaryData={summaryData}
      summaryLoading={summaryLoading}
      handleRangeChange={handleRangeChange}
      accountId={accountId}
      portfolioId={portfolioId}
      financialGoals={financialGoals}
      goalsLoading={goalsLoading}
      investmentPolicy={investmentPolicy}
    />
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
  insightsList: Insight[];
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

  const data: any[] = [
    { name: 'Stocks', value: 60, color: '#2BEE6C' },
    { name: 'ETFs', value: 25, color: '#047857' },
    { name: 'Cash & Bonds', value: 15, color: '#064E3B' },
  ];

  return (
    <div className="space-y-6 my-4 lg:px-8 max-w-5xl mx-auto">
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
            portfolioValue={totalPortfolioValue}
            data={chartData}
            portfolioPerformance={portfolioGains.totalGainPercent}
            summaryData={summaryData}
            summaryLoading={summaryLoading}
            onRangeChange={handleRangeChange}
            accountId={accountId || undefined}
            portfolioId={portfolioId || undefined}
          />
        </div>

        <div className="lg:col-span-1">
          <HoldingsOverview data={data} />
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

      {showDepositModal && accountId && (
        <DepositDialog accountId={accountId} onSuccess={() => setShowDepositModal(false)} onCancel={() => setShowDepositModal(false)} />
      )}

      {showWithdrawModal && accountId && (
        <WithdrawalDialog
          accountId={accountId}
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
  insightsList: Insight[];
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
            portfolioValue={totalPortfolioValue}
            data={chartData}
            portfolioPerformance={portfolioGains.totalGainPercent}
            summaryData={summaryData}
            summaryLoading={summaryLoading}
            onRangeChange={handleRangeChange}
            accountId={accountId || undefined}
            portfolioId={portfolioId || undefined}
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
