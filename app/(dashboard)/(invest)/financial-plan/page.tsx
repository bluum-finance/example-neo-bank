'use client';

import { useEffect, useState } from 'react';
import { WidgetService, type FinancialGoal } from '@/services/widget.service';
import { FinancialPlan } from '@/components/invest/financial-plan';
import { GoalDetailsModal } from '@/components/invest/goal-details-modal';
import { GoalFormModal } from '@/components/invest/goal-form-modal';
import { useUser } from '@/store/user.store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinancialPlanPage() {
  const user = useUser();
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [viewingGoal, setViewingGoal] = useState<FinancialGoal | null>(null);

  const loadFinancialGoals = async () => {
    try {
      setError(null);
      const accountId = user?.externalAccountId;
      if (!accountId) {
        setError('Account ID not found');
        return;
      }
      const goals = await WidgetService.getFinancialGoals(accountId);
      setFinancialGoals(goals);
    } catch (error: any) {
      console.error('Failed to load financial goals:', error);
      setError(error.message || 'Failed to load financial goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialGoals();
  }, [user?.externalAccountId]);

  const handleCreateGoal = async (goalData: {
    name: string;
    goal_type: 'retirement' | 'education' | 'emergency' | 'wealth_growth' | 'home_purchase' | 'custom';
    target_amount: string;
    target_date?: string;
    priority?: number;
    monthly_contribution?: string;
  }): Promise<void> => {
    try {
      setError(null);
      const accountId = user?.externalAccountId;
      if (!accountId) {
        throw new Error('Account ID not found');
      }
      const newGoal = await WidgetService.createFinancialGoal(accountId, goalData);
      setFinancialGoals((prev) => [...prev, newGoal]);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create goal:', error);
      setError(error.message || 'Failed to create goal');
      throw error;
    }
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleUpdateGoalSubmit = async (goalData: {
    name: string;
    goal_type: 'retirement' | 'education' | 'emergency' | 'wealth_growth' | 'home_purchase' | 'custom';
    target_amount: string;
    target_date?: string;
    priority?: number;
    monthly_contribution?: string;
  }): Promise<void> => {
    if (!editingGoal) return;
    await handleUpdateGoal(editingGoal.goal_id, {
      name: goalData.name,
      goal_type: goalData.goal_type,
      target_amount: goalData.target_amount,
      target_date: goalData.target_date,
      priority: goalData.priority,
      monthly_contribution: goalData.monthly_contribution,
    });
  };

  const handleUpdateGoal = async (
    goalId: string,
    goalData: Partial<{
      name: string;
      goal_type: 'retirement' | 'education' | 'emergency' | 'wealth_growth' | 'home_purchase' | 'custom';
      target_amount: string;
      target_date: string;
      priority: number;
      monthly_contribution: string;
      status: 'active' | 'completed' | 'archived';
    }>
  ) => {
    try {
      setError(null);
      const accountId = user?.externalAccountId;
      if (!accountId) {
        throw new Error('Account ID not found');
      }
      const updatedGoal = await WidgetService.updateFinancialGoal(accountId, goalId, goalData);
      setFinancialGoals((prev) => prev.map((goal) => (goal.goal_id === goalId ? updatedGoal : goal)));
      setIsModalOpen(false);
      setEditingGoal(null);
      return updatedGoal;
    } catch (error: any) {
      console.error('Failed to update goal:', error);
      setError(error.message || 'Failed to update goal');
      throw error;
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setError(null);
      const accountId = user?.externalAccountId;
      if (!accountId) {
        throw new Error('Account ID not found');
      }
      await WidgetService.deleteFinancialGoal(accountId, goalId);
      setFinancialGoals((prev) => prev.filter((goal) => goal.goal_id !== goalId));
      setIsModalOpen(false);
      setEditingGoal(null);
    } catch (error: any) {
      console.error('Failed to delete goal:', error);
      setError(error.message || 'Failed to delete goal');
      throw error;
    }
  };

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleViewGoal = (goal: FinancialGoal) => {
    setViewingGoal(goal);
  };

  const handleCloseGoalDetails = () => {
    setViewingGoal(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading financial plan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Plan</h1>
          <p className="text-muted-foreground mt-1">Track your financial goals and progress</p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4" />
          Create Goal
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <FinancialPlan goals={financialGoals} onGoalClick={handleViewGoal} />

      <GoalFormModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        goal={editingGoal}
        onSubmit={editingGoal ? handleUpdateGoalSubmit : handleCreateGoal}
        onDelete={editingGoal ? handleDeleteGoal : undefined}
      />
      <GoalDetailsModal open={Boolean(viewingGoal)} goal={viewingGoal} onClose={handleCloseGoalDetails} />
    </div>
  );
}
