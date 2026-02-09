'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, Pause, Play, Trash2, Edit, Calendar, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutoInvestService, type AutoInvestSchedule } from '@/services/auto-invest.service';
import { getAuth } from '@/lib/auth';
import { AccountService } from '@/services/account.service';
import { PlaidService } from '@/services/plaid.service';
import { AutoInvestFormModal } from '@/components/invest/auto-invest-form-modal';

type CreateScheduleData = {
  name: string;
  portfolio_id: string;
  funding_source_id: string;
  amount: string;
  currency?: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  schedule: {
    day_of_month?: number;
    day_of_week?: number;
    time: string;
  };
  allocation_rule: 'ips_target' | 'custom';
  start_date: string;
};

type UpdateScheduleData = Partial<{
  name: string;
  amount: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  schedule: {
    day_of_month?: number;
    day_of_week?: number;
    time: string;
  };
  allocation_rule: 'ips_target' | 'custom';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}>;

export default function AutoInvestPage() {
  const [schedules, setSchedules] = useState<AutoInvestSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AutoInvestSchedule | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [fundingSources, setFundingSources] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<{ id: string; type: 'pause' | 'resume' } | null>(null);
  const editingScheduleIdRef = useRef<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const user = getAuth();
        const accId = user?.externalAccountId;

        if (!accId) {
          setError('No investment account found. Please create an account first.');
          setLoading(false);
          return;
        }

        setAccountId(accId);

        // Load account to get portfolio ID
        try {
          const account = await AccountService.getAccount(accId);
          const accountData = account as any;
          const detectedPortfolioId =
            accountData?.portfolios?.find((p: any) => p.status === 'active')?.id ||
            accountData?.portfolios?.[0]?.id ||
            null;
          setPortfolioId(detectedPortfolioId);
        } catch (err) {
          console.error('Failed to load account:', err);
        }

        // Load funding sources
        try {
          const sources = await PlaidService.getConnectedAccounts(accId);
          setFundingSources(sources);
        } catch (err) {
          console.error('Failed to load funding sources:', err);
        }

        // Load schedules
        const schedulesData = await AutoInvestService.getSchedules(accId);
        setSchedules(schedulesData);
      } catch (error: any) {
        console.error('Failed to load auto-invest schedules:', error);
        setError(error.message || 'Failed to load auto-invest schedules');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateSchedule = async (scheduleData: CreateScheduleData): Promise<void> => {
    if (!accountId) {
      throw new Error('Account ID not found');
    }

    try {
      setError(null);
      const newSchedule = await AutoInvestService.createSchedule(accountId, scheduleData);
      setSchedules((prev) => [...prev, newSchedule]);
      setIsModalOpen(false);
      toast.success('Auto-invest schedule created successfully');
    } catch (error: any) {
      console.error('Failed to create schedule:', error);
      toast.error(error.message || 'Failed to create schedule');
      throw error;
    }
  };

  const handleUpdateSchedule = async (
    autoInvestId: string,
    scheduleData: CreateScheduleData | UpdateScheduleData
  ): Promise<void> => {
    if (!accountId) {
      const errorMsg = 'Account ID not found. Please refresh the page.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!autoInvestId) {
      const errorMsg = 'Schedule ID not found.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setError(null);
      // Convert CreateScheduleData to UpdateScheduleData format
      const updateData: UpdateScheduleData = {
        name: scheduleData.name,
        amount: scheduleData.amount,
        frequency: scheduleData.frequency,
        schedule: scheduleData.schedule,
        allocation_rule: scheduleData.allocation_rule,
      };

      const updatedSchedule = await AutoInvestService.updateSchedule(
        accountId,
        autoInvestId,
        updateData
      );
      setSchedules((prev) =>
        prev.map((s) => (s.auto_invest_id === autoInvestId ? updatedSchedule : s))
      );
      setIsModalOpen(false);
      setEditingSchedule(null);
      toast.success('Schedule updated successfully');
    } catch (error: any) {
      console.error('Failed to update schedule:', error);
      const errorMsg = error.message || 'Failed to update schedule';
      toast.error(errorMsg);
      setError(errorMsg);
      throw error;
    }
  };

  const handleDeleteSchedule = async (autoInvestId: string): Promise<void> => {
    if (!accountId) {
      throw new Error('Account ID not found');
    }

    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await AutoInvestService.deleteSchedule(accountId, autoInvestId);
      setSchedules((prev) => prev.filter((s) => s.auto_invest_id !== autoInvestId));
      toast.success('Schedule deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete schedule:', error);
      toast.error(error.message || 'Failed to delete schedule');
      throw error;
    }
  };

  const handlePauseSchedule = async (autoInvestId: string): Promise<void> => {
    if (!accountId) {
      const errorMsg = 'Account ID not found. Please refresh the page.';
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!autoInvestId) {
      const errorMsg = 'Schedule ID not found.';
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setLoadingAction({ id: autoInvestId, type: 'pause' });
      setError(null);
      const updatedSchedule = await AutoInvestService.pauseSchedule(accountId, autoInvestId);
      setSchedules((prev) =>
        prev.map((s) => (s.auto_invest_id === autoInvestId ? updatedSchedule : s))
      );
      toast.success('Schedule paused successfully');
    } catch (error: any) {
      console.error('Failed to pause schedule:', error);
      const errorMsg = error.message || 'Failed to pause schedule';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResumeSchedule = async (autoInvestId: string): Promise<void> => {
    if (!accountId) {
      const errorMsg = 'Account ID not found. Please refresh the page.';
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!autoInvestId) {
      const errorMsg = 'Schedule ID not found.';
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setLoadingAction({ id: autoInvestId, type: 'resume' });
      setError(null);
      const updatedSchedule = await AutoInvestService.resumeSchedule(accountId, autoInvestId);
      setSchedules((prev) =>
        prev.map((s) => (s.auto_invest_id === autoInvestId ? updatedSchedule : s))
      );
      toast.success('Schedule resumed successfully');
    } catch (error: any) {
      console.error('Failed to resume schedule:', error);
      const errorMsg = error.message || 'Failed to resume schedule';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEditSchedule = (schedule: AutoInvestSchedule) => {
    setEditingSchedule(schedule);
    editingScheduleIdRef.current = schedule.auto_invest_id;
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      paused: { variant: 'secondary', label: 'Paused' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };

    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatFrequency = (frequency: string) => {
    const labels: Record<string, string> = {
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
    };
    return labels[frequency] || frequency;
  };

  const formatSchedule = (schedule: AutoInvestSchedule) => {
    if (schedule.frequency === 'monthly' && schedule.schedule.day_of_month) {
      return `Day ${schedule.schedule.day_of_month} of each month at ${schedule.schedule.time}`;
    }
    if (schedule.frequency === 'weekly' && schedule.schedule.day_of_week !== undefined) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[schedule.schedule.day_of_week]} at ${schedule.schedule.time}`;
    }
    return `${formatFrequency(schedule.frequency)} at ${schedule.schedule.time}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auto-Invest</h1>
          <p className="text-muted-foreground mt-1">Automate your investments</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">Loading schedules...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auto-Invest</h1>
          <p className="text-muted-foreground mt-1">
            Set up automated investments to grow your wealth consistently
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSchedule(null);
            editingScheduleIdRef.current = null;
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
          disabled={!accountId}
        >
          <Plus className="h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">No Auto-Invest Schedules</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first automated investment schedule to start building wealth
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingSchedule(null);
                  editingScheduleIdRef.current = null;
                  setIsModalOpen(true);
                }}
                className="mt-4"
                disabled={!accountId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {schedules.map((schedule) => (
            <Card key={schedule.auto_invest_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground">{schedule.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {formatFrequency(schedule.frequency)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(schedule.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-foreground">
                      ${parseFloat(schedule.amount).toFixed(2)} {schedule.currency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Schedule:</span>
                    <span className="text-foreground">{formatSchedule(schedule)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Allocation:</span>
                    <span className="text-foreground capitalize">
                      {schedule.allocation_rule.replace('_', ' ')}
                    </span>
                  </div>
                  {schedule.next_execution_date && (
                    <div className="text-xs text-muted-foreground">
                      Next execution: {new Date(schedule.next_execution_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {schedule.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePauseSchedule(schedule.auto_invest_id)}
                      className="flex-1"
                      disabled={!accountId || loadingAction?.id === schedule.auto_invest_id}
                    >
                      {loadingAction?.id === schedule.auto_invest_id &&
                      loadingAction.type === 'pause' ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Pause className="h-3 w-3 mr-1" />
                      )}
                      Pause
                    </Button>
                  )}
                  {schedule.status === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResumeSchedule(schedule.auto_invest_id)}
                      className="flex-1"
                      disabled={!accountId || loadingAction?.id === schedule.auto_invest_id}
                    >
                      {loadingAction?.id === schedule.auto_invest_id &&
                      loadingAction.type === 'resume' ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      Resume
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSchedule(schedule)}
                    className="flex-1"
                    disabled={!accountId}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.auto_invest_id)}
                    className="text-destructive hover:text-destructive"
                    disabled={!accountId}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AutoInvestFormModal
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingSchedule(null);
            editingScheduleIdRef.current = null;
          }
        }}
        schedule={editingSchedule}
        portfolioId={portfolioId || undefined}
        fundingSources={fundingSources}
        onSubmit={editingSchedule ? 
          async (data: CreateScheduleData) => {
            const scheduleIdToUpdate = editingScheduleIdRef.current || editingSchedule?.auto_invest_id;
            if (!scheduleIdToUpdate) {
              toast.error('Schedule ID not found');
              return;
            }
            await handleUpdateSchedule(scheduleIdToUpdate, data);
          } :
          handleCreateSchedule
        }
      />
    </div>
  );
}
