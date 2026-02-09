'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type InvestmentPolicy, type CreateOrUpdateIPSRequest, InvestmentPolicyService } from '@/services/investment-policy.service';
import { X, Plus } from 'lucide-react';

interface InvestmentPolicyFormProps {
  policy?: InvestmentPolicy | null;
  onSubmit: (policyData: CreateOrUpdateIPSRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const RISK_TOLERANCE_OPTIONS = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate_conservative', label: 'Moderate-Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'moderate_aggressive', label: 'Moderate-Aggressive' },
  { value: 'aggressive', label: 'Aggressive' },
] as const;

const VOLATILITY_TOLERANCE_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

const TIME_HORIZON_CATEGORIES = [
  { value: 'short_term', label: 'Short Term (< 5 years)' },
  { value: 'medium_term', label: 'Medium Term (5-10 years)' },
  { value: 'long_term', label: 'Long Term (> 10 years)' },
] as const;

const OBJECTIVE_OPTIONS = [
  { value: 'capital_appreciation', label: 'Capital Appreciation' },
  { value: 'income_generation', label: 'Income Generation' },
  { value: 'capital_preservation', label: 'Capital Preservation' },
  { value: 'tax_efficiency', label: 'Tax Efficiency' },
  { value: 'inflation_hedge', label: 'Inflation Hedge' },
] as const;

const REBALANCING_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annually', label: 'Semi-Annually' },
  { value: 'annually', label: 'Annually' },
  { value: 'as_needed', label: 'As Needed' },
] as const;

const EXCLUDED_SECTORS = [
  'tobacco',
  'gambling',
  'alcohol',
  'weapons',
  'fossil_fuels',
  'nuclear',
] as const;

export function InvestmentPolicyForm({ policy, onSubmit, onCancel, loading = false }: InvestmentPolicyFormProps) {
  const [formData, setFormData] = useState<CreateOrUpdateIPSRequest>({
    risk_profile: {
      risk_tolerance: 'moderate',
      risk_score: 5,
      volatility_tolerance: 'medium',
    },
    time_horizon: {
      years: 15,
      category: 'long_term',
    },
    investment_objectives: {
      primary: 'capital_appreciation',
      secondary: [],
      target_annual_return: '7.00',
    },
    target_allocation: {
      equities: {
        target_percent: '60.00',
        min_percent: '50.00',
        max_percent: '70.00',
      },
      fixed_income: {
        target_percent: '30.00',
        min_percent: '20.00',
        max_percent: '40.00',
      },
      treasury: {
        target_percent: '5.00',
        min_percent: '0.00',
        max_percent: '10.00',
      },
      alternatives: {
        target_percent: '5.00',
        min_percent: '0.00',
        max_percent: '10.00',
      },
    },
    constraints: {
      liquidity_requirements: {
        minimum_cash_percent: '5.00',
        emergency_fund_months: 6,
      },
      tax_considerations: {
        tax_loss_harvesting: true,
        tax_bracket: '24',
      },
      restrictions: {
        excluded_sectors: [],
        esg_screening: false,
      },
      rebalancing_policy: {
        frequency: 'quarterly',
        threshold_percent: '5.00',
        tax_aware: true,
      },
    },
  });

  const [allocationError, setAllocationError] = useState<string | null>(null);
  const [newSecondaryObjective, setNewSecondaryObjective] = useState('');

  useEffect(() => {
    if (policy) {
      setFormData({
        risk_profile: {
          risk_tolerance: policy.risk_profile?.risk_tolerance || 'moderate',
          risk_score: policy.risk_profile?.risk_score || 5,
          volatility_tolerance: policy.risk_profile?.volatility_tolerance || 'medium',
        },
        time_horizon: {
          years: policy.time_horizon?.years || 15,
          category: policy.time_horizon?.category || 'long_term',
        },
        investment_objectives: {
          primary: policy.investment_objectives?.primary || 'capital_appreciation',
          secondary: policy.investment_objectives?.secondary || [],
          target_annual_return: policy.investment_objectives?.target_annual_return || '7.00',
        },
        target_allocation: {
          equities: policy.target_allocation?.equities || {
            target_percent: '60.00',
            min_percent: '50.00',
            max_percent: '70.00',
          },
          fixed_income: policy.target_allocation?.fixed_income || {
            target_percent: '30.00',
            min_percent: '20.00',
            max_percent: '40.00',
          },
          treasury: policy.target_allocation?.treasury || {
            target_percent: '5.00',
            min_percent: '0.00',
            max_percent: '10.00',
          },
          alternatives: policy.target_allocation?.alternatives || {
            target_percent: '5.00',
            min_percent: '0.00',
            max_percent: '10.00',
          },
        },
        constraints: {
          liquidity_requirements: policy.constraints?.liquidity_requirements || {
            minimum_cash_percent: '5.00',
            emergency_fund_months: 6,
          },
          tax_considerations: policy.constraints?.tax_considerations || {
            tax_loss_harvesting: true,
            tax_bracket: '24',
          },
          restrictions: policy.constraints?.restrictions || {
            excluded_sectors: [],
            esg_screening: false,
          },
          rebalancing_policy: policy.constraints?.rebalancing_policy || {
            frequency: 'quarterly',
            threshold_percent: '5.00',
            tax_aware: true,
          },
        },
      });
    }
  }, [policy]);

  const updateAllocation = (assetClass: keyof CreateOrUpdateIPSRequest['target_allocation'], field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev };
      if (!newData.target_allocation[assetClass]) {
        newData.target_allocation[assetClass] = {
          target_percent: '0.00',
          min_percent: '0.00',
          max_percent: '0.00',
        };
      }
      (newData.target_allocation[assetClass] as any)[field] = value;
      
      // Validate allocation sum
      const total = InvestmentPolicyService.calculateTotalAllocation(newData.target_allocation);
      if (Math.abs(total - 100) > 0.01) {
        setAllocationError(`Total allocation: ${total.toFixed(2)}% (must equal 100%)`);
      } else {
        setAllocationError(null);
      }
      
      return newData;
    });
  };

  const addSecondaryObjective = () => {
    if (newSecondaryObjective && !formData.investment_objectives.secondary?.includes(newSecondaryObjective)) {
      setFormData((prev) => ({
        ...prev,
        investment_objectives: {
          ...prev.investment_objectives,
          secondary: [...(prev.investment_objectives.secondary || []), newSecondaryObjective],
        },
      }));
      setNewSecondaryObjective('');
    }
  };

  const removeSecondaryObjective = (objective: string) => {
    setFormData((prev) => ({
      ...prev,
      investment_objectives: {
        ...prev.investment_objectives,
        secondary: prev.investment_objectives.secondary?.filter((o) => o !== objective) || [],
      },
    }));
  };

  const toggleExcludedSector = (sector: string) => {
    setFormData((prev) => {
      const currentSectors = prev.constraints.restrictions?.excluded_sectors || [];
      const newSectors = currentSectors.includes(sector)
        ? currentSectors.filter((s) => s !== sector)
        : [...currentSectors, sector];
      
      return {
        ...prev,
        constraints: {
          ...prev.constraints,
          restrictions: {
            ...prev.constraints.restrictions,
            excluded_sectors: newSectors,
          },
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!InvestmentPolicyService.validateAllocationSum(formData.target_allocation)) {
      const total = InvestmentPolicyService.calculateTotalAllocation(formData.target_allocation);
      setAllocationError(`Target allocation must sum to 100%. Current total: ${total.toFixed(2)}%`);
      return;
    }

    await onSubmit(formData);
  };

  const totalAllocation = InvestmentPolicyService.calculateTotalAllocation(formData.target_allocation);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Risk Profile Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Risk Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="risk_tolerance">
              Risk Tolerance <span className="text-destructive">*</span>
            </Label>
            <Select
              id="risk_tolerance"
              value={formData.risk_profile.risk_tolerance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  risk_profile: {
                    ...formData.risk_profile,
                    risk_tolerance: e.target.value as typeof formData.risk_profile.risk_tolerance,
                  },
                })
              }
              disabled={loading}
              required
            >
              {RISK_TOLERANCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_score">
              Risk Score (0-10)
            </Label>
            <Input
              id="risk_score"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.risk_profile.risk_score || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  risk_profile: {
                    ...formData.risk_profile,
                    risk_score: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Scale from 0 (most conservative) to 10 (most aggressive)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volatility_tolerance">
              Volatility Tolerance
            </Label>
            <Select
              id="volatility_tolerance"
              value={formData.risk_profile.volatility_tolerance || 'medium'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  risk_profile: {
                    ...formData.risk_profile,
                    volatility_tolerance: e.target.value as typeof formData.risk_profile.volatility_tolerance,
                  },
                })
              }
              disabled={loading}
            >
              {VOLATILITY_TOLERANCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Time Horizon Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Time Horizon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time_horizon_years">
              Years <span className="text-destructive">*</span>
            </Label>
            <Input
              id="time_horizon_years"
              type="number"
              min="1"
              max="50"
              value={formData.time_horizon.years}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_horizon: {
                    ...formData.time_horizon,
                    years: parseInt(e.target.value) || 15,
                  },
                })
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_horizon_category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              id="time_horizon_category"
              value={formData.time_horizon.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_horizon: {
                    ...formData.time_horizon,
                    category: e.target.value as typeof formData.time_horizon.category,
                  },
                })
              }
              disabled={loading}
              required
            >
              {TIME_HORIZON_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Investment Objectives Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Investment Objectives</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary_objective">
              Primary Objective <span className="text-destructive">*</span>
            </Label>
            <Select
              id="primary_objective"
              value={formData.investment_objectives.primary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  investment_objectives: {
                    ...formData.investment_objectives,
                    primary: e.target.value,
                  },
                })
              }
              disabled={loading}
              required
            >
              {OBJECTIVE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Secondary Objectives</Label>
            <div className="flex gap-2">
              <Select
                value={newSecondaryObjective}
                onChange={(e) => setNewSecondaryObjective(e.target.value)}
                disabled={loading}
                placeholder="Select objective"
              >
                <option value="">Select objective</option>
                {OBJECTIVE_OPTIONS.filter(
                  (opt) => opt.value !== formData.investment_objectives.primary
                ).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={addSecondaryObjective}
                disabled={loading || !newSecondaryObjective}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.investment_objectives.secondary && formData.investment_objectives.secondary.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.investment_objectives.secondary.map((obj) => (
                  <div
                    key={obj}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    {OBJECTIVE_OPTIONS.find((o) => o.value === obj)?.label || obj}
                    <button
                      type="button"
                      onClick={() => removeSecondaryObjective(obj)}
                      className="ml-1 hover:text-destructive"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_annual_return">
              Target Annual Return (%)
            </Label>
            <Input
              id="target_annual_return"
              type="number"
              step="0.01"
              min="0"
              max="50"
              value={formData.investment_objectives.target_annual_return || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  investment_objectives: {
                    ...formData.investment_objectives,
                    target_annual_return: e.target.value,
                  },
                })
              }
              disabled={loading}
              placeholder="7.00"
            />
          </div>
        </div>
      </Card>

      {/* Target Allocation Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Target Allocation</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Define target percentages for each asset class. Total must equal 100%.
        </p>
        
        {allocationError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">{allocationError}</p>
          </div>
        )}

        <div className="space-y-4">
          {(['equities', 'fixed_income', 'treasury', 'alternatives'] as const).map((assetClass) => {
            const allocation = formData.target_allocation[assetClass];
            if (!allocation) return null;

            return (
              <div key={assetClass} className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium capitalize">{assetClass.replace('_', ' ')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${assetClass}_target`}>
                      Target % <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`${assetClass}_target`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={allocation.target_percent}
                      onChange={(e) => updateAllocation(assetClass, 'target_percent', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${assetClass}_min`}>Min %</Label>
                    <Input
                      id={`${assetClass}_min`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={allocation.min_percent || ''}
                      onChange={(e) => updateAllocation(assetClass, 'min_percent', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${assetClass}_max`}>Max %</Label>
                    <Input
                      id={`${assetClass}_max`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={allocation.max_percent || ''}
                      onChange={(e) => updateAllocation(assetClass, 'max_percent', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">
            Total Allocation: <span className={totalAllocation === 100 ? 'text-green-600' : 'text-red-600'}>
              {totalAllocation.toFixed(2)}%
            </span>
          </p>
        </div>
      </Card>

      {/* Constraints Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Constraints & Guidelines</h2>
        
        <div className="space-y-6">
          {/* Liquidity Requirements */}
          <div className="space-y-4">
            <h3 className="font-medium">Liquidity Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimum_cash_percent">
                  Minimum Cash % <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="minimum_cash_percent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.constraints.liquidity_requirements?.minimum_cash_percent || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        liquidity_requirements: {
                          ...formData.constraints.liquidity_requirements,
                          minimum_cash_percent: e.target.value,
                          emergency_fund_months: formData.constraints.liquidity_requirements?.emergency_fund_months || 6,
                        },
                      },
                    })
                  }
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_fund_months">
                  Emergency Fund (months)
                </Label>
                <Input
                  id="emergency_fund_months"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.constraints.liquidity_requirements?.emergency_fund_months || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        liquidity_requirements: {
                          ...formData.constraints.liquidity_requirements,
                          minimum_cash_percent: formData.constraints.liquidity_requirements?.minimum_cash_percent || '5.00',
                          emergency_fund_months: parseInt(e.target.value) || undefined,
                        },
                      },
                    })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tax Considerations */}
          <div className="space-y-4">
            <h3 className="font-medium">Tax Considerations</h3>
            <div className="space-y-4">
              <Checkbox
                id="tax_loss_harvesting"
                checked={formData.constraints.tax_considerations?.tax_loss_harvesting || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      tax_considerations: {
                        ...formData.constraints.tax_considerations,
                        tax_loss_harvesting: e.target.checked,
                        tax_bracket: formData.constraints.tax_considerations?.tax_bracket || '24',
                      },
                    },
                  })
                }
                disabled={loading}
                label="Enable Tax Loss Harvesting"
              />
              <div className="space-y-2">
                <Label htmlFor="tax_bracket">Tax Bracket (%)</Label>
                <Input
                  id="tax_bracket"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.constraints.tax_considerations?.tax_bracket || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        tax_considerations: {
                          ...formData.constraints.tax_considerations,
                          tax_loss_harvesting: formData.constraints.tax_considerations?.tax_loss_harvesting || false,
                          tax_bracket: e.target.value,
                        },
                      },
                    })
                  }
                  disabled={loading}
                  placeholder="24"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Restrictions */}
          <div className="space-y-4">
            <h3 className="font-medium">Restrictions</h3>
            <div className="space-y-4">
              <Checkbox
                id="esg_screening"
                checked={formData.constraints.restrictions?.esg_screening || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      restrictions: {
                        ...formData.constraints.restrictions,
                        excluded_sectors: formData.constraints.restrictions?.excluded_sectors || [],
                        esg_screening: e.target.checked,
                      },
                    },
                  })
                }
                disabled={loading}
                label="Enable ESG Screening"
              />
              <div className="space-y-2">
                <Label>Excluded Sectors</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {EXCLUDED_SECTORS.map((sector) => (
                    <Checkbox
                      key={sector}
                      id={`sector_${sector}`}
                      checked={formData.constraints.restrictions?.excluded_sectors?.includes(sector) || false}
                      onChange={() => toggleExcludedSector(sector)}
                      disabled={loading}
                      label={sector.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Rebalancing Policy */}
          <div className="space-y-4">
            <h3 className="font-medium">Rebalancing Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rebalancing_frequency">
                  Frequency <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="rebalancing_frequency"
                  value={formData.constraints.rebalancing_policy?.frequency || 'quarterly'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        rebalancing_policy: {
                          ...formData.constraints.rebalancing_policy,
                          frequency: e.target.value,
                          threshold_percent: formData.constraints.rebalancing_policy?.threshold_percent || '5.00',
                          tax_aware: formData.constraints.rebalancing_policy?.tax_aware || true,
                        },
                      },
                    })
                  }
                  disabled={loading}
                  required
                >
                  {REBALANCING_FREQUENCIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rebalancing_threshold">
                  Threshold % <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rebalancing_threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.constraints.rebalancing_policy?.threshold_percent || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        rebalancing_policy: {
                          ...formData.constraints.rebalancing_policy,
                          frequency: formData.constraints.rebalancing_policy?.frequency || 'quarterly',
                          threshold_percent: e.target.value,
                          tax_aware: formData.constraints.rebalancing_policy?.tax_aware || true,
                        },
                      },
                    })
                  }
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <Checkbox
              id="tax_aware_rebalancing"
              checked={formData.constraints.rebalancing_policy?.tax_aware || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  constraints: {
                    ...formData.constraints,
                    rebalancing_policy: {
                      ...formData.constraints.rebalancing_policy,
                      frequency: formData.constraints.rebalancing_policy?.frequency || 'quarterly',
                      threshold_percent: formData.constraints.rebalancing_policy?.threshold_percent || '5.00',
                      tax_aware: e.target.checked,
                    },
                  },
                })
              }
              disabled={loading}
              label="Tax-Aware Rebalancing"
            />
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !!allocationError}>
          {loading ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
        </Button>
      </div>
    </form>
  );
}
