'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronRight, Plus, ArrowLeftRight, Clock3, ShieldX, RefreshCw, Loader2, Mail, ExternalLink } from 'lucide-react';

import { PortfolioPerformanceChart } from '@/components/invest/portfolio-performance-chart';
import { FinancialPlan } from '@/components/invest/financial-plan';
import { InvestmentPolicyWidget } from '@/components/invest/investment-policy-widget';
import { QuickActionsWidget } from '@/components/invest/quick-actions-widget';
import { WelcomeInsightsCard } from '@/components/invest/welcome-insights-card';
import { MarketMoversOverview } from '@/components/widget/market-movers-overview';

import { InvestmentService } from '@/services/investment.service';
import { WidgetService, type Insight, type Recommendation, type PerformanceDataPoint, FinancialGoal } from '@/services/widget.service';
import { useUser, useUserStore } from '@/store/user.store';
import {
  useAccountBalance,
  useAccountStore,
  useChartData,
  useChartLoading,
  usePortfolioId,
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
import { AccountService } from '@/services/account.service';
import type { ComplianceInitiationResponse } from '@/types/bluum';

type OnboardingGateStatus = 'PENDING' | 'REJECTED' | 'ACTIVE';

export default function Invest() {
  const router = useRouter();
  const user = useUser();
  const clearExternalAccountId = useUserStore((state) => state.clearExternalAccountId);

  // Account Store
  const accountBalance = useAccountBalance();
  const portfolioId = usePortfolioId();
  const positions = usePositions();
  const summaryData = useSummaryData();
  const chartData = useChartData();
  const summaryLoading = useSummaryLoading();
  const { isLoading, fetchAccount, fetchPositions, fetchSummary, fetchChartData } = useAccountStore();

  // Account & Portfolio State
  const [accountId, setAccountId] = useState<string | null>(null);
  const [onboardingGateStatus, setOnboardingGateStatus] = useState<OnboardingGateStatus | null>(null);

  // Loading & Error States
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);

  // Data States
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [investmentPolicy, setInvestmentPolicy] = useState<any>(null);
  const [widgetInsights, setWidgetInsights] = useState<{ insights: Insight[]; recommendations: Recommendation[] } | undefined>(undefined);

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
    async (userAccountId: string) => {
      try {
        const account = await fetchAccount(userAccountId);
        // REJECTED | PENDING | ACTIVE
        if (account?.status === 'REJECTED' || account?.status === 'PENDING') {
          setOnboardingGateStatus(account.status);
          return;
        }
        setOnboardingGateStatus(null);

        const currentPortfolioId = useAccountStore.getState().portfolioId;
        await fetchPositions(userAccountId);
        await Promise.all([
          fetchSummary(userAccountId, currentPortfolioId).catch((err) => {}),
          fetchChartData(userAccountId, currentPortfolioId).catch((err) => {}),
          loadWidgetData(userAccountId).catch((err) => {}),
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
    [clearExternalAccountId, fetchAccount, fetchChartData, fetchPositions, fetchSummary, loadWidgetData, router]
  );

  useEffect(() => {
    const userAccountId = user?.externalAccountId;
    if (!userAccountId) return;

    setAccountId(userAccountId);
    loadAccountData(userAccountId);
  }, [loadAccountData, router, user?.externalAccountId]);

  const handleRangeChange = (range: '1W' | '1M' | '3M' | '1Y' | 'All') => {
    if (accountId && portfolioId) {
      fetchChartData(accountId, portfolioId, range).catch((error) => {
        console.error('Failed to update performance range', error);
      });
    }
  };

  const insightsList = widgetInsights?.insights || [];
  const portfolioGains = useMemo(() => InvestmentService.calculatePortfolioTotals(positions), [positions]);

  if (!accountId) {
    return (
      <div className="max-w-5xl mx-auto">
        <OnboardingLandingPage />
      </div>
    );
  }

  const dashboardProps = {
    insightsList,
    insightsLoading,
    totalPortfolioValue: accountBalance,
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
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-md lg:inset-y-0 lg:left-64 lg:right-0 lg:top-0 lg:bottom-0">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {onboardingGateStatus && accountId ? (
        <OnboardingStatusGate status={onboardingGateStatus} accountId={accountId} onAccountRefresh={() => loadAccountData(accountId)} />
      ) : null}
      {/* Dashboard */}
      {user?.investmentChoice === 'AI-WEALTH' ? <AiWealthDashboard {...dashboardProps} /> : <SelfDirectedDashboard {...dashboardProps} />}
    </>
  );
}

function pickVerificationUrl(data: ComplianceInitiationResponse): string | undefined {
  for (const check of data.complianceChecks ?? []) {
    const raw = (check.verificationUrl ?? (check as { verification_url?: string }).verification_url)?.trim();
    if (raw) return raw;
  }
  return undefined;
}

function OnboardingStatusGate({
  status,
  accountId,
  onAccountRefresh,
}: {
  status: OnboardingGateStatus;
  accountId: string;
  onAccountRefresh: () => Promise<void>;
}) {
  const isRejected = status === 'REJECTED';
  const [restarting, setRestarting] = useState(false);

  const handleRestartCompliance = async () => {
    setRestarting(true);
    try {
      const data = await AccountService.restartComplianceWorkflow(accountId);
      const url = pickVerificationUrl(data);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.success('Retry verification to complete onboarding.');
      } else {
        toast.message('Verification workflow updated', {
          description: 'Use Refresh to check your account status.',
        });
      }
      await onAccountRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not start verification';
      toast.error(message);
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-md lg:inset-y-0 lg:left-64 lg:right-0 lg:top-0 lg:bottom-0"
      style={{ backgroundColor: 'rgba(5, 18, 12, 0.70)' }}
    >
      <div className="mx-auto w-full max-w-md shrink-0 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E3D2F] bg-[#0A1F16] shadow-2xl">
          {/* Ambient glow strip at the top */}
          <div
            className={`absolute inset-x-0 top-0 h-px ${isRejected ? 'bg-linear-to-r from-transparent via-[#FF8EA1]/60 to-transparent' : 'bg-linear-to-r from-transparent via-[#57B75C]/60 to-transparent'}`}
          />

          <div className="p-7">
            {/* Icon badge */}
            <div className="mb-5 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  isRejected ? 'bg-[#7A1E2A]/30 ring-1 ring-[#FF8EA1]/20' : 'bg-[#1A3A2C] ring-1 ring-[#57B75C]/20'
                }`}
              >
                {isRejected ? <ShieldX className="h-5 w-5 text-[#FF8EA1]" /> : <Clock3 className="h-5 w-5 text-[#57B75C]" />}
              </div>

              <span className={`px-2 py-0.5 text-sm font-medium tracking-wide`}>{isRejected ? 'Not Approved' : 'Under Review'}</span>
            </div>

            {/* Heading */}
            <h2 className="text-xl font-semibold tracking-tight text-white">
              {isRejected ? 'Onboarding was not approved' : 'Your account is under review'}
            </h2>

            {/* Body */}
            <p className="mt-2 text-sm leading-relaxed text-[#8BA59A]">
              {isRejected
                ? "We couldn't approve your application at this time. Please reach out to our support team for next steps."
                : "We're verifying your information. You account will be active once your information is verified."}
            </p>

            {/* Divider */}
            <div className="my-5 h-px bg-[#1E3D2F]" />

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {isRejected && (
                <button
                  type="button"
                  disabled={restarting}
                  onClick={() => void handleRestartCompliance()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#57B75C] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4ca651] active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                >
                  {restarting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                  Retry verification
                </button>
              )}

              <button
                type="button"
                onClick={() => window.location.reload()}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors active:scale-95 ${
                  isRejected
                    ? 'border border-[#2A4D3C] bg-transparent text-white hover:bg-[#1A3A2C]'
                    : 'bg-[#57B75C] text-white hover:bg-[#4ca651]'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
            data={chartData}
            summaryData={summaryData}
            summaryLoading={summaryLoading}
            onRangeChange={handleRangeChange}
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
