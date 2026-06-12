'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { type FinancialGoal } from '@/services/widget.service';

interface GoalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: FinancialGoal | null;
  onSubmit: (goalData: {
    name: string;
    goal_type: 'retirement' | 'education' | 'emergency' | 'wealth_growth' | 'home_purchase' | 'custom';
    target_amount: string;
    target_date?: string;
    priority?: number;
    monthly_contribution?: string;
  }) => Promise<void>;
  onDelete?: (goalId: string) => Promise<void>;
}

const GOAL_TYPES = [
  { value: 'retirement', label: 'Retirement' },
  { value: 'education', label: 'Education' },
  { value: 'emergency', label: 'Emergency Fund' },
  { value: 'wealth_growth', label: 'Wealth Growth' },
  { value: 'home_purchase', label: 'Home Purchase' },
  { value: 'custom', label: 'Custom' },
] as const;

export function GoalFormModal({
  open,
  onOpenChange,
  goal,
  onSubmit,
  onDelete,
}: GoalFormModalProps) {
  type GoalFormState = {
    name: string;
    goal_type: FinancialGoal['goal_type'];
    target_amount: string;
    target_date: string;
    priority: number;
    monthly_contribution: string;
  };

  const isEditMode = !!goal;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GoalFormState>({
    name: '',
    goal_type: 'retirement',
    target_amount: '',
    target_date: '',
    priority: 1,
    monthly_contribution: '',
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        goal_type: goal.goal_type || 'retirement',
        target_amount: goal.target_amount || '',
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
        priority: goal.priority || 1,
        monthly_contribution: goal.monthly_contribution || '',
      });
    } else {
      setFormData({
        name: '',
        goal_type: 'retirement',
        target_amount: '',
        target_date: '',
        priority: 1,
        monthly_contribution: '',
      });
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name: formData.name,
        goal_type: formData.goal_type,
        target_amount: formData.target_amount,
        target_date: formData.target_date || undefined,
        priority: formData.priority,
        monthly_contribution: formData.monthly_contribution || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Failed to submit goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!goal?.id || !onDelete) return;
    
    if (!confirm(`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(goal.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="mb-4">
          <DialogTitle>{isEditMode ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your financial goal details below.'
              : 'Set up a new financial goal to track your progress.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Goal Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Retirement Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="goal_type" className="text-sm font-medium">
              Goal Type <span className="text-red-500">*</span>
            </label>
            <Select
              id="goal_type"
              value={formData.goal_type}
              onChange={(e) =>
                setFormData({ ...formData, goal_type: e.target.value as typeof formData.goal_type })
              }
              disabled={loading}
              required
              className="h-11"
            >
              {GOAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="target_amount" className="text-sm font-medium">
              Target Amount <span className="text-red-500">*</span>
            </label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="500000.00"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="target_date" className="text-sm font-medium">
              Target Date
            </label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="monthly_contribution" className="text-sm font-medium">
              Monthly Contribution
            </label>
            <Input
              id="monthly_contribution"
              type="number"
              step="0.01"
              min="0"
              placeholder="500.00"
              value={formData.monthly_contribution}
              onChange={(e) => setFormData({ ...formData, monthly_contribution: e.target.value })}
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority (1-10)
            </label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-4">
            {isEditMode && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1"
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className={isEditMode && onDelete ? 'flex-1' : 'flex-1'}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : isEditMode ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
