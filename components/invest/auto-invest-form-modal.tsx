'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { type AutoInvestSchedule } from '@/services/auto-invest.service';

interface AutoInvestFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: AutoInvestSchedule | null;
  portfolioId?: string;
  fundingSources?: any[];
  onSubmit: (scheduleData: {
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
  }) => Promise<void>;
}

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
] as const;

const ALLOCATION_RULES = [
  { value: 'ips_target', label: 'IPS Target Allocation' },
  { value: 'custom', label: 'Custom Allocation' },
] as const;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

export function AutoInvestFormModal({
  open,
  onOpenChange,
  schedule,
  portfolioId,
  fundingSources = [],
  onSubmit,
}: AutoInvestFormModalProps) {
  const isEditMode = !!schedule;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    portfolio_id: portfolioId || '',
    funding_source_id: '',
    amount: '',
    currency: 'USD',
    frequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
    day_of_month: 15,
    day_of_week: 1,
    time: '09:30',
    allocation_rule: 'ips_target' as 'ips_target' | 'custom',
    start_date: '',
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name || '',
        portfolio_id: schedule.portfolio_id || portfolioId || '',
        funding_source_id: schedule.funding_source_id || '',
        amount: schedule.amount || '',
        currency: schedule.currency || 'USD',
        frequency: schedule.frequency || 'monthly',
        day_of_month: schedule.schedule?.day_of_month || 15,
        day_of_week: schedule.schedule?.day_of_week ?? 1,
        time: schedule.schedule?.time || '09:30',
        allocation_rule: schedule.allocation_rule || 'ips_target',
        start_date: schedule.start_date ? schedule.start_date.split('T')[0] : '',
      });
    } else {
      // Set default start date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        name: '',
        portfolio_id: portfolioId || '',
        funding_source_id: '',
        amount: '',
        currency: 'USD',
        frequency: 'monthly',
        day_of_month: 15,
        day_of_week: 1,
        time: '09:30',
        allocation_rule: 'ips_target',
        start_date: tomorrow.toISOString().split('T')[0],
      });
    }
  }, [schedule, portfolioId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scheduleObj: any = {
        time: formData.time,
      };

      if (formData.frequency === 'monthly' || formData.frequency === 'quarterly') {
        scheduleObj.day_of_month = formData.day_of_month;
      } else {
        scheduleObj.day_of_week = formData.day_of_week;
      }

      await onSubmit({
        name: formData.name,
        portfolio_id: formData.portfolio_id,
        funding_source_id: formData.funding_source_id,
        amount: formData.amount,
        currency: formData.currency,
        frequency: formData.frequency,
        schedule: scheduleObj,
        allocation_rule: formData.allocation_rule,
        start_date: formData.start_date,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Failed to submit schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fieldClassName =
    'h-11 rounded-md border border-border bg-background px-3 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 dark:bg-card dark:border-border dark:text-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-foreground">
            {isEditMode ? 'Edit Auto-Invest Schedule' : 'Create Auto-Invest Schedule'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your automated investment schedule below.'
              : 'Set up a new automated investment schedule to invest regularly.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Schedule Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Monthly Investment"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
                className={fieldClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Investment Amount ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                disabled={loading}
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">
                Frequency <span className="text-destructive">*</span>
              </Label>
              <Select
                id="frequency"
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'quarterly',
                  })
                }
                required
                disabled={loading}
                className={fieldClassName}
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allocation_rule">
                Allocation Rule <span className="text-destructive">*</span>
              </Label>
              <Select
                id="allocation_rule"
                value={formData.allocation_rule}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allocation_rule: e.target.value as 'ips_target' | 'custom',
                  })
                }
                required
                disabled={loading}
                className={fieldClassName}
              >
                {ALLOCATION_RULES.map((rule) => (
                  <option key={rule.value} value={rule.value}>
                    {rule.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="funding_source_id">
                Funding Source <span className="text-destructive">*</span>
              </Label>
              <Select
                id="funding_source_id"
                value={formData.funding_source_id}
                onChange={(e) =>
                  setFormData({ ...formData, funding_source_id: e.target.value })
                }
                required
                disabled={loading || fundingSources.length === 0}
                className={fieldClassName}
              >
                <option value="">Select funding source</option>
                {fundingSources.map((source) =>
                  source.accounts?.map((account: any) => (
                    <option key={account.id} value={account.id}>
                      {source.institutionName} - {account.accountName} ({account.mask || '****'})
                    </option>
                  ))
                )}
              </Select>
              {fundingSources.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No funding sources available. Please connect a bank account first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
                className={fieldClassName}
              />
            </div>
          </div>

          {/* Schedule Details */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground">Schedule Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.frequency === 'monthly' || formData.frequency === 'quarterly') ? (
                <div className="space-y-2">
                  <Label htmlFor="day_of_month">
                    Day of Month <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="day_of_month"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.day_of_month}
                    onChange={(e) =>
                      setFormData({ ...formData, day_of_month: parseInt(e.target.value) || 1 })
                    }
                    required
                    disabled={loading}
                    className={fieldClassName}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">
                    Day of Week <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="day_of_week"
                    value={formData.day_of_week.toString()}
                    onChange={(e) =>
                      setFormData({ ...formData, day_of_week: parseInt(e.target.value) })
                    }
                    required
                    disabled={loading}
                    className={fieldClassName}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="time">
                  Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  disabled={loading}
                  className={fieldClassName}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.portfolio_id || !formData.funding_source_id}>
              {loading ? 'Saving...' : isEditMode ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
