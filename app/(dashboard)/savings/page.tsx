'use client';

import { useEffect, useState } from 'react';
import { Calendar, Lock, Plus, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BalanceCard } from '@/components/balance-card';
import { Separator } from '@/components/ui/separator';
import {
  getSavingsPlans,
  mockTotalSavings,
  type SavingsPlan,
} from '@/lib/mock-data';
import { toast } from 'sonner';

export default function Savings() {
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavingsPlans().then((data) => {
      setSavingsPlans(data);
      setLoading(false);
    });
  }, []);

  const handleCreateFixed = () => {
    toast.info('Create fixed savings feature coming soon');
  };

  const handleCreateFlexible = () => {
    toast.info('Create flexible savings feature coming soon');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysRemaining = (maturityDate: string) => {
    const now = new Date();
    const maturity = new Date(maturityDate);
    const diff = maturity.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Savings</h1>
        <p className="text-muted-foreground mt-1">
          Grow your money with our savings plans
        </p>
      </div>

      {/* Total Savings Card */}
      <BalanceCard balance={mockTotalSavings} label="Total Savings" />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleCreateFixed} className="h-auto flex-col gap-2 py-4">
          <Lock className="h-5 w-5" />
          <span className="text-sm">Fixed Savings</span>
          <span className="text-xs text-primary-foreground/80">
            Up to 12% interest
          </span>
        </Button>
        <Button
          onClick={handleCreateFlexible}
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
        >
          <Wallet className="h-5 w-5" />
          <span className="text-sm">Flexible Savings</span>
          <span className="text-xs text-muted-foreground">
            Save anytime
          </span>
        </Button>
      </div>

      {/* Active Savings Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Active Savings Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading savings plans...
            </div>
          ) : savingsPlans.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="mb-4">No savings plans yet.</p>
              <Button onClick={handleCreateFixed} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Savings Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {savingsPlans.map((plan, index) => (
                <div key={plan.id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{plan.name}</h3>
                          <Badge
                            variant={
                              plan.type === 'fixed' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {plan.type === 'fixed' ? 'Fixed' : 'Flexible'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Amount
                            </p>
                            <p className="text-lg font-semibold">
                              ${plan.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Interest Rate
                            </p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              {plan.interestRate}% p.a.
                            </p>
                          </div>
                        </div>
                        {plan.targetAmount && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round(
                                  (plan.amount / plan.targetAmount) * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${
                                    (plan.amount / plan.targetAmount) * 100
                                  }%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Target: ${plan.targetAmount.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {plan.maturityDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Matures: {formatDate(plan.maturityDate)} (
                              {calculateDaysRemaining(plan.maturityDate)} days)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < savingsPlans.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

