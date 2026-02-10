// Investment Policy Service
// Handles all Investment Policy Statement (IPS) operations

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

// API Response Type - matches API contract
export interface InvestmentPolicy {
  risk_profile: {
    risk_tolerance: 'conservative' | 'moderate_conservative' | 'moderate' | 'moderate_high' | 'moderate_aggressive' | 'aggressive';
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
    stocks?: {
      target_percent: string;
      min_percent?: string;
      max_percent?: string;
    };
    bonds?: {
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
      prefer_tax_advantaged?: boolean;
    };
    restrictions?: {
      excluded_sectors?: string[];
      excluded_securities?: string[];
      no_individual_stocks?: boolean;
      esg_screening?: boolean;
      esg_criteria?: string[];
    };
    rebalancing_policy?: {
      frequency: string;
      threshold_percent: string;
      tax_aware?: boolean;
    };
  };
  [key: string]: any;
}

export interface IPSValidationResult {
  is_compliant: boolean;
  validation_results: {
    allocation_compliance: {
      compliant: boolean;
      deviations: Array<{
        asset_class: string;
        target_percent: string;
        current_percent: string;
        deviation: string;
        within_bands: boolean;
      }>;
    };
    restriction_compliance: {
      compliant: boolean;
      violations: any[];
    };
    liquidity_compliance: {
      compliant: boolean;
      current_cash_percent: string;
      required_cash_percent: string;
    };
  };
  recommended_actions: Array<{
    action_type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  validated_at: string;
}

export interface CreateOrUpdateIPSRequest {
  risk_profile: {
    risk_tolerance: 'conservative' | 'moderate_conservative' | 'moderate' | 'moderate_high' | 'moderate_aggressive' | 'aggressive';
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
    stocks?: {
      target_percent: string;
      min_percent?: string;
      max_percent?: string;
    };
    bonds?: {
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
      prefer_tax_advantaged?: boolean;
    };
    restrictions?: {
      excluded_sectors?: string[];
      excluded_securities?: string[];
      no_individual_stocks?: boolean;
      esg_screening?: boolean;
      esg_criteria?: string[];
    };
    rebalancing_policy?: {
      frequency: string;
      threshold_percent: string;
      tax_aware?: boolean;
    };
  };
}

// Investment Policy Service
export class InvestmentPolicyService {
  /**
   * Get investment policy statement for an account
   * @param accountId - Account ID
   * @param params - Optional parameters for version and history
   * @returns Investment Policy Statement
   */
  static async getInvestmentPolicy(
    accountId: string,
    params?: {
      version?: string;
      include_history?: boolean;
    }
  ): Promise<InvestmentPolicy> {
    const queryParams = new URLSearchParams({
      account_id: accountId,
    });

    if (params?.version) {
      queryParams.append('version', params.version);
    }

    if (params?.include_history === true) {
      queryParams.append('include_history', 'true');
    }

    const response = await fetch(`/api/wealth/investment-policy?${queryParams}`);
    return handleResponse<InvestmentPolicy>(response);
  }

  /**
   * Create or update investment policy statement
   * Uses PUT method - creates if not exists, updates if exists (creates new version)
   * @param accountId - Account ID
   * @param policyData - Investment policy data
   * @param idempotencyKey - Optional idempotency key for safe retries
   * @returns Updated Investment Policy Statement
   */
  static async createOrUpdateInvestmentPolicy(
    accountId: string,
    policyData: CreateOrUpdateIPSRequest,
    idempotencyKey?: string
  ): Promise<InvestmentPolicy> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch('/api/wealth/investment-policy', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        account_id: accountId,
        ...policyData,
      }),
    });

    return handleResponse<InvestmentPolicy>(response);
  }

  /**
   * Validate portfolio against Investment Policy Statement
   * Checks allocation compliance, restriction compliance, and liquidity compliance
   * @param accountId - Account ID
   * @param portfolioId - Portfolio ID to validate
   * @returns Validation results with compliance status and recommended actions
   */
  static async validatePortfolioAgainstIPS(
    accountId: string,
    portfolioId: string
  ): Promise<IPSValidationResult> {
    const response = await fetch('/api/wealth/investment-policy/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: accountId,
        portfolio_id: portfolioId,
      }),
    });

    return handleResponse<IPSValidationResult>(response);
  }

  /**
   * Calculate total allocation percentage from target allocation
   * Helper method to validate allocation sums to 100%
   * @param targetAllocation - Target allocation object
   * @returns Total percentage
   */
  static calculateTotalAllocation(targetAllocation: CreateOrUpdateIPSRequest['target_allocation']): number {
    let total = 0;
    if (targetAllocation.equities?.target_percent) {
      total += parseFloat(targetAllocation.equities.target_percent);
    }
    if (targetAllocation.fixed_income?.target_percent) {
      total += parseFloat(targetAllocation.fixed_income.target_percent);
    }
    if (targetAllocation.treasury?.target_percent) {
      total += parseFloat(targetAllocation.treasury.target_percent);
    }
    if (targetAllocation.alternatives?.target_percent) {
      total += parseFloat(targetAllocation.alternatives.target_percent);
    }
    return total;
  }

  /**
   * Validate that target allocation sums to 100%
   * @param targetAllocation - Target allocation object
   * @returns true if valid (sums to 100%), false otherwise
   */
  static validateAllocationSum(targetAllocation: CreateOrUpdateIPSRequest['target_allocation']): boolean {
    const total = this.calculateTotalAllocation(targetAllocation);
    return Math.abs(total - 100) < 0.01; // Allow small floating point differences
  }
}
