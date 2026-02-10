'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { InvestOnboarding } from '@/components/invest/onboarding';
import { AIWealthLanding } from '@/components/invest/ai-wealth-landing';
import { PortfolioPerformanceChart } from '@/components/invest/portfolio-performance-chart';
import { FinancialPlan } from '@/components/invest/financial-plan';
import { InvestmentPolicyWidget } from '@/components/invest/investment-policy-widget';
import { QuickActionsWidget } from '@/components/invest/quick-actions-widget';
import { WelcomeInsightsCard } from '@/components/invest/welcome-insights-card';

import { InvestmentService, type Position } from '@/services/investment.service';
import { AccountService } from '@/services/account.service';
import { WidgetService, type Insight, type Recommendation, type PerformanceDataPoint, FinancialGoal } from '@/services/widget.service';
import { getAuth, setExternalAccountId, clearExternalAccountId, setInvestingChoice } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function Invest() {
  const router = useRouter();
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
  const [aiInputValue, setAiInputValue] = useState('');

  // Widget data
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [investmentPolicy, setInvestmentPolicy] = useState<any>(null);
  const [widgetInsights, setWidgetInsights] = useState<{ insights: Insight[]; recommendations: Recommendation[] } | undefined>(undefined);

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
    setChartLoading(true);
    setChartError(null);
    try {
      const data = await WidgetService.getPortfolioPerformanceData(range, userAccountId, detectedPortfolioId);
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
        const is404 = err instanceof Error && 'status' in err && (err as any).status === 404;
        if (is404) {
          // Clear externalAccountId since the account doesn't exist
          clearExternalAccountId();
          setHasAccountId(false);
          setAccountId(null);
          setLoading(false);
          return;
        }

        toast.error('Error fetching account. Please try again later.');
        setLoading(false);
        return;
      }

      const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
      setAccountBalance(balanceValue);
      const accountData = account as any;
      const detectedPortfolioId =
        accountData?.portfolios?.find((p: any) => p.status === 'active')?.id ||
        accountData?.portfolios?.[0]?.id ||
        null;
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

  // Load widget data
  const loadWidgetData = async (accountId: string) => {
    try {
      const results = await Promise.allSettled([
        WidgetService.getFinancialGoals(accountId),
        WidgetService.getInvestmentPolicy(accountId),
        WidgetService.getWidgetInsights(accountId),
      ]);

      // Handle financial goals
      if (results[0].status === 'fulfilled') {
        setFinancialGoals(results[0].value);
      } else {
        console.error('Failed to load financial goals:', results[0].reason);
        setFinancialGoals([]);
      }

      // Handle investment policy
      if (results[1].status === 'fulfilled') {
        setInvestmentPolicy(results[1].value);
      } else {
        console.error('Failed to load investment policy:', results[1].reason);
      }

      // Handle widget insights
      if (results[2].status === 'fulfilled') {
        setWidgetInsights(results[2].value);
      } else {
        console.error('Failed to load widget insights:', results[2].reason);
      }
    } catch (error) {
      console.error('Failed to load widget data:', error);
    }
  };

  useEffect(() => {
    const user = getAuth();
    const userAccountId = user?.externalAccountId;

    if (userAccountId) {
      setHasAccountId(true);
      setAccountId(userAccountId);
      loadPortfolio(userAccountId);
      loadWidgetData(userAccountId);
    } else {
      setHasAccountId(false);
      setLoading(false);
      const userWithChoice = getAuth();
      if (!userWithChoice?.investingChoice) {
        setInvestingChoice('ai-wealth');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccountCreated = (newAccountId?: string) => {
    if (!newAccountId) return;

    setExternalAccountId(newAccountId);
    setAccountId(newAccountId);
    setHasAccountId(true);
    loadPortfolio(newAccountId);
    loadWidgetData(newAccountId);
    toast.success('Welcome to investing!');
  };

  // Show AI Wealth Landing if no account
  if (!hasAccountId) {
    if (showAIOnboarding) {
      return <InvestOnboarding onAccept={handleAccountCreated} />;
    }
    // Otherwise show the landing page
    return (
      <AIWealthLanding
        onStartOnboarding={() => setShowAIOnboarding(true)}
        showOnboarding={false}
        onAccountCreated={handleAccountCreated}
      />
    );
  }

  // Get user's first name
  const getUserFirstName = () => {
    const user = getAuth();
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name.split(' ')[0];
    return 'Jessie'; // Default fallback
  };

  const insightsList: Insight[] = widgetInsights?.insights || [];
  const insightVisibleCount = Math.min(insightsList.length, 3);

  const handleAISend = () => {
    if (aiInputValue.trim()) {
      router.push(`/chat?message=${encodeURIComponent(aiInputValue.trim())}`);
      setAiInputValue('');
    }
  };

  const SUGGESTED_PROMPTS = [
    'What is the next billion-dollar company?',
    'How can I invest in private AI companies with  minimal funds?',
  ];

  const handlePromptClick = (prompt: string) => {
    router.push(`/chat?message=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Combined Welcome Card with Insights and AI Chat */}
      <WelcomeInsightsCard
        insights={insightsList}
        userName={getUserFirstName()}
        aiInputValue={aiInputValue}
        onAiInputChange={setAiInputValue}
        onAiSend={handleAISend}
        onPromptClick={handlePromptClick}
        suggestedPrompts={SUGGESTED_PROMPTS}
      />

      <section className="py-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Left (2/3 width) */}
        <div className="col-span-2">
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
        <div className="col-span-1">
          <QuickActionsWidget />
        </div>
      </section>

      <section className="py-2 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              Financial Plan
            </div>
            <p className="text-sm text-muted-foreground">
              Track your financial goals and progress
            </p>
          </div>
          {financialGoals.length > 0 && (
            <Link
              href="/financial-plan"
              className="flex items-center gap-0.5 text-sm text-blue-500 hover:opacity-80 transition-opacity"
            >
              View all goals
              <ChevronRight className="w-3 h-3 text-blue-500" />
            </Link>
          )}
        </div>
        <FinancialPlan goals={financialGoals.slice(0, 4)} />
      </section>

      <section className="py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 flex flex-col justify-start items-start">
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              Investment Policy Statement
            </div>
            <div className="text-xs font-normal pt-2 text-gray-500 dark:text-muted-foreground">
              Your personalized investment guidelines
            </div>
          </div>


          {investmentPolicy ? (
            <Button variant="outline" onClick={() => router.push('/investment-policy')}>
              Edit IPS
            </Button>
          ) : (
            <Button variant="outline" onClick={() => router.push('/investment-policy')}>
              Create IPS
            </Button>
          )}
        </div>
        <InvestmentPolicyWidget policy={investmentPolicy} />
      </section>
    </div>
  );
}
