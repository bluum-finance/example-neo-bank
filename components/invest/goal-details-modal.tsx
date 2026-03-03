'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type FinancialGoal } from '@/services/widget.service';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';

interface GoalDetailsModalProps {
  open: boolean;
  goal: FinancialGoal | null;
  onClose: () => void;
}

export function GoalDetailsModal({ open, goal, onClose }: GoalDetailsModalProps) {
  const { displayAmount } = useCurrency();

  if (!goal) return null;

  const formatCurrency = (value?: string) => {
    if (!value) return '—';
    const amount = parseFloat(value);
    if (Number.isNaN(amount)) return '—';
    return displayAmount(amount, goal.currency as CurrencyCode);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>{goal.name}</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {`${goal.goal_type?.replace(/_/g, ' ') ?? 'Goal'} overview`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Target amount</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(goal.target_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Current amount</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(goal.current_amount || goal.current_value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Target date</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Monthly contribution</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(goal.monthly_contribution)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Priority</span>
            <span className="font-medium text-gray-900 dark:text-white">{goal.priority ?? 'Standard'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">{goal.status || 'active'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
