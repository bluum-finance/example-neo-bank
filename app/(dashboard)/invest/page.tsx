'use client';

import { useEffect, useState } from 'react';
import { InvestOnboarding } from '@/components/invest/onboarding';
import { AIWealthLanding } from '@/components/invest/ai-wealth-landing';
import { InvestmentService, type Position } from '@/services/investment.service';
import { AccountService } from '@/services/account.service';
import {
  getAuth,
  setExternalAccountId,
  clearExternalAccountId,
  setInvestingChoice,
} from '@/lib/auth';
import { toast } from 'sonner';
import { PortfolioPerformanceChart } from '@/components/invest/portfolio-performance-chart';
import { FinancialPlan } from '@/components/invest/financial-plan';
import { InsightsWidget } from '@/components/invest/insights-widget';
import { InvestmentPolicyWidget } from '@/components/invest/investment-policy-widget';
import { QuickActionsWidget } from '@/components/invest/quick-actions-widget';
import { WidgetService, type Insight, type Recommendation } from '@/services/widget.service';
import { AIChatWidget } from '@/components/invest/ai-chat-widget';

export default function Invest() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [portfolioGains, setPortfolioGains] = useState({
    totalGain: 0,
    totalGainPercent: 0,
  });
  const [hasAccountId, setHasAccountId] = useState<boolean>(false);
  const [showAIOnboarding, setShowAIOnboarding] = useState<boolean>(false);

  // Widget data from WidgetService
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [investmentPolicy, setInvestmentPolicy] = useState<any>(null);
  const [widgetInsights, setWidgetInsights] = useState<{ insights: Insight[]; recommendations: Recommendation[] } | undefined>(undefined);

  const loadPortfolio = async () => {
    try {
      setLoading(true);

      // Get account ID from user object
      const user = getAuth();
      const userAccountId = user?.externalAccountId;

      if (!userAccountId) {
        setLoading(false);
        return;
      }

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
  const loadWidgetData = async (accountId?: string) => {
    try {
      const [
        financialGoalsData,
        investmentPolicyData,
        widgetInsightsData,
      ] = await Promise.all([
        WidgetService.getFinancialGoals(accountId),
        WidgetService.getInvestmentPolicy(accountId),
        WidgetService.getWidgetInsights(accountId),
      ]);

      setFinancialGoals(financialGoalsData);
      setInvestmentPolicy(investmentPolicyData);
      setWidgetInsights(widgetInsightsData);
    } catch (error) {
      console.error('Failed to load widget data:', error);
    }
  };

  useEffect(() => {
    // Check if user has externalAccountId
    const user = getAuth();
    const userAccountId = user?.externalAccountId;

    // Load widget data (works with or without accountId)
    loadWidgetData(userAccountId || undefined);

    if (userAccountId) {
      setHasAccountId(true);
      setAccountId(userAccountId);
      loadPortfolio();
    } else {
      setHasAccountId(false);
      setLoading(false);

      // Set default to AI Wealth if no choice has been made
      const user = getAuth();
      if (!user?.investingChoice) {
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
    loadPortfolio();
    toast.success('Welcome to investing!');
  };

  // Show AI Wealth Landing if no account
  if (!hasAccountId) {
    // If user clicked "Get Started", show onboarding directly
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

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Welcome, {getUserFirstName()}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left (2/3 width) */}
        <InsightsWidget
          insights={widgetInsights}
          positions={positions}
          portfolioGains={portfolioGains}
          accountBalance={accountBalance}
        />

        {/* Chat with Bluum AI Card - Right (1/3 width) */}
        <AIChatWidget />
      </section>

      <section className="py-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Left (2/3 width) */}
        <div className="col-span-2">
          <PortfolioPerformanceChart
            portfolioValue={
              accountBalance + positions.reduce((sum, pos) => sum + (pos.value || 0), 0)
            }
          />
        </div>

        {/* Right (1/3 width) */}
        <div className="col-span-1">
          <QuickActionsWidget />
        </div>
      </section>

      <section className="py-2">
        <FinancialPlan goals={financialGoals} />
      </section>

      <section className="py-4">
        <InvestmentPolicyWidget policy={investmentPolicy} />
      </section>

    </div>
  );
}
