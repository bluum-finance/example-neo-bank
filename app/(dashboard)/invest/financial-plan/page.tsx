'use client';

import { useEffect, useState } from 'react';
import { WidgetService } from '@/services/widget.service';
import { FinancialPlan } from '@/components/invest/financial-plan';
import { getAuth } from '@/lib/auth';

export default function FinancialPlanPage() {
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFinancialGoals = async () => {
      try {
        const user = getAuth();
        const accountId = user?.externalAccountId;
        const goals = await WidgetService.getFinancialGoals(accountId);
        setFinancialGoals(goals);
      } catch (error) {
        console.error('Failed to load financial goals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFinancialGoals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading financial plan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Plan</h1>
        <p className="text-muted-foreground mt-1">
          Track your financial goals and progress
        </p>
      </div>

      <FinancialPlan goals={financialGoals} />
    </div>
  );
}
