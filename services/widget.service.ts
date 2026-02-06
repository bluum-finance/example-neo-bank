// Widget Service - Demo data for investment widgets
// This service provides demo data for all investment dashboard widgets
// Makes API calls to /api/widget/* endpoints which return demo data

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(
      typeof error.error === 'string'
        ? error.error
        : error.error?.message || 'An error occurred'
    );
  }
  return response.json();
}

export interface Insight {
  id: string;
  type: 'success' | 'warning';
  text: string;
  value: string;
  description: string;
}

export interface Account {
  id: string;
  name: string;
  initials: string;
  iconColor: string;
  iconBgColor: string;
  subDetails?: string;
  subDetailsColor?: string;
  balance?: number;
  balanceMasked?: boolean;
  performance?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

// API Response Types - match API contract exactly
export interface FinancialGoal {
  goal_id: string;
  name: string;
  goal_type: 'retirement' | 'education' | 'emergency' | 'wealth_growth' | 'home_purchase' | 'custom';
  target_amount: string;
  target_date?: string;
  current_amount?: string;
  current_value?: string;
  progress_percent?: number;
  status: 'active' | 'completed' | 'archived';
  priority?: number;
  monthly_contribution?: string;
  [key: string]: any;
}

export interface AllocationData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

// API Response Type - matches API contract
export interface InvestmentPolicy {
  risk_profile: {
    risk_tolerance: 'conservative' | 'moderate' | 'moderate-high' | 'aggressive';
    risk_score?: number;
    volatility_tolerance?: 'low' | 'medium' | 'high';
  };
  time_horizon: {
    years: number;
    category: 'short_term' | 'medium_term' | 'long_term';
  };
  investment_objectives: {
    primary: string;
    secondary?: string[];
    tertiary?: string[];
    target_annual_return?: string;
  };
  target_allocation: {
    equities?: {
      target_percent: string;
      min_percent?: string;
      max_percent?: string;
    };
    fixed_income?: {
      target_percent: string;
      min_percent?: string;
      max_percent?: string;
    };
    treasury?: {
      target_percent: string;
      min_percent?: string;
      max_percent?: string;
    };
    alternatives?: {
      target_percent: string;
      min_percent?: string;
      max_percent?: string;
    };
  };
  constraints: {
    liquidity_requirements?: {
      minimum_cash_percent: string;
      emergency_fund_months?: number;
    };
    tax_considerations?: {
      tax_loss_harvesting?: boolean;
      tax_bracket?: string;
    };
    restrictions?: {
      excluded_sectors?: string[];
      esg_screening?: boolean;
    };
    rebalancing_policy?: {
      frequency: string;
      threshold_percent: string;
      tax_aware?: boolean;
    };
  };
  [key: string]: any;
}

export interface PerformanceDataPoint {
  date: string;
  portfolio: number;
  sp500: number;
}

export interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'dividend' | 'rebalance' | 'transfer';
  title: string;
  description: string;
  amount: number | null;
  date: string;
  iconEmoji: string;
}

// API Response Types
export interface Insight {
  insight_id: string;
  category: 'all' | 'opportunity' | 'risk' | 'tax' | 'rebalancing';
  title: string;
  summary: string;
  priority?: 'low' | 'medium' | 'high';
  action?: {
    type: string;
    description: string;
  };
  [key: string]: any;
}

export interface Recommendation {
  recommendation_id: string;
  type: 'allocation' | 'security' | 'strategy';
  title: string;
  rationale: string;
  confidence?: 'low' | 'medium' | 'high';
  suggested_actions?: Array<{
    action: string;
    symbol?: string;
    target_allocation?: string;
  }>;
  [key: string]: any;
}

export interface WidgetInsightsResponse {
  insights: Insight[];
  recommendations: Recommendation[];
}

// Widget Service
export class WidgetService {
  /**
   * Get insights data for InsightsWidget
   */
  static async getInsights(accountId?: string): Promise<Insight[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/insights${queryParams}`);
    return handleResponse<Insight[]>(response);
  }

  /**
   * Get accounts data for AccountsWidget
   */
  static async getAccounts(accountId?: string): Promise<Account[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/accounts${queryParams}`);
    return handleResponse<Account[]>(response);
  }

  /**
   * Get financial goals data for FinancialPlan widget
   */
  static async getFinancialGoals(accountId?: string): Promise<FinancialGoal[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/financial-goals${queryParams}`);
    return handleResponse<FinancialGoal[]>(response);
  }

  /**
   * Get investment policy data for InvestmentPolicyWidget
   */
  static async getInvestmentPolicy(accountId?: string): Promise<InvestmentPolicy> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/investment-policy${queryParams}`);
    return handleResponse<InvestmentPolicy>(response);
  }

  /**
   * Get portfolio performance chart data
   */
  static async getPortfolioPerformanceData(
    range: '1W' | '1M' | '3M' | '1Y' | 'All' = '1M',
    accountId?: string,
    portfolioId?: string
  ): Promise<PerformanceDataPoint[]> {
    const queryParams = new URLSearchParams({
      range,
      ...(accountId && { account_id: accountId }),
      ...(portfolioId && { portfolio_id: portfolioId }),
    });
    const response = await fetch(`/api/widget/portfolio-performance?${queryParams}`);
    return handleResponse<PerformanceDataPoint[]>(response);
  }

  /**
   * Get recent activities for OverviewWidgets
   */
  static async getRecentActivities(accountId?: string): Promise<RecentActivity[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/recent-activities${queryParams}`);
    return handleResponse<RecentActivity[]>(response);
  }

  /**
   * Get insights for OverviewWidgets
   */
  static async getWidgetInsights(accountId?: string): Promise<WidgetInsightsResponse> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/widget-insights${queryParams}`);
    return handleResponse<WidgetInsightsResponse>(response);
  }

  /**
   * Calculate portfolio performance percentage from data
   */
  static calculatePerformance(data: PerformanceDataPoint[]): { portfolio: number; sp500: number } {
    if (data.length === 0) return { portfolio: 0, sp500: 0 };

    const startPortfolio = data[0].portfolio;
    const endPortfolio = data[data.length - 1].portfolio;
    const startSp500 = data[0].sp500;
    const endSp500 = data[data.length - 1].sp500;

    return {
      portfolio: ((endPortfolio - startPortfolio) / startPortfolio) * 100,
      sp500: ((endSp500 - startSp500) / startSp500) * 100,
    };
  }
}
