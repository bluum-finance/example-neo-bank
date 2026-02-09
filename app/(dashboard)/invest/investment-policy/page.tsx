'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InvestmentPolicyService, type InvestmentPolicy, type CreateOrUpdateIPSRequest } from '@/services/investment-policy.service';
import { getAuth } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvestmentPolicyForm } from '@/components/invest/investment-policy-form';

export default function InvestmentPolicyPage() {
  const router = useRouter();
  const [policy, setPolicy] = useState<InvestmentPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvestmentPolicy = async () => {
    try {
      setError(null);
      setLoading(true);
      const user = getAuth();
      const accountId = user?.externalAccountId;

      if (!accountId) {
        setError('Account ID not found. Please ensure you are logged in.');
        return;
      }

      const policyData = await InvestmentPolicyService.getInvestmentPolicy(accountId);
      setPolicy(policyData);
    } catch (error: any) {
      // 404 is expected if policy doesn't exist yet
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        setPolicy(null);
      } else {
        console.error('Failed to load investment policy:', error);
        setError(error.message || 'Failed to load investment policy');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestmentPolicy();
  }, []);

  const handleSubmit = async (policyData: CreateOrUpdateIPSRequest) => {
    try {
      setError(null);
      setSaving(true);
      const user = getAuth();
      const accountId = user?.externalAccountId;

      if (!accountId) {
        throw new Error('Account ID not found');
      }

      // Validate allocation sum
      if (!InvestmentPolicyService.validateAllocationSum(policyData.target_allocation)) {
        const total = InvestmentPolicyService.calculateTotalAllocation(policyData.target_allocation);
        throw new Error(`Target allocation must sum to 100%. Current total: ${total.toFixed(2)}%`);
      }

      const updatedPolicy = await InvestmentPolicyService.createOrUpdateInvestmentPolicy(
        accountId,
        policyData
      );

      setPolicy(updatedPolicy);
      toast.success(policy ? 'Investment Policy updated successfully' : 'Investment Policy created successfully');
      router.push('/invest');
    } catch (error: any) {
      console.error('Failed to save investment policy:', error);
      const errorMessage = error.message || 'Failed to save investment policy';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading investment policy...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {policy ? 'Edit Investment Policy Statement' : 'Create Investment Policy Statement'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Define your investment strategy, risk tolerance, and portfolio allocation guidelines
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <InvestmentPolicyForm
        policy={policy}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/invest')}
        loading={saving}
      />
    </div>
  );
}
