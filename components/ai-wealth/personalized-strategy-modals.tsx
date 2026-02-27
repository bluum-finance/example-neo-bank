'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useUser } from '@/store/user.store';
import { WidgetService, type FinancialGoal } from '@/services/widget.service';
import { LifeEventService, type LifeEvent, type LifeEventType } from '@/services/life-event.service';
import { ExternalAccountService, type ExternalAccount } from '@/services/external-account.service';

const GOAL_TYPES = [
  { value: 'retirement', label: 'Retirement' },
  { value: 'education', label: 'Education' },
  { value: 'emergency', label: 'Emergency Fund' },
  { value: 'wealth_growth', label: 'Wealth Growth' },
  { value: 'home_purchase', label: 'Home Purchase' },
  { value: 'custom', label: 'Custom' },
] as const;

const LIFE_EVENT_TYPES: { value: LifeEventType; label: string }[] = [
  { value: 'college', label: 'College' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'home_purchase', label: 'Home Purchase' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'major_purchase', label: 'Major Purchase' },
  { value: 'career_change', label: 'Career Change' },
  { value: 'custom', label: 'Custom' },
];

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'loan', label: 'Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other_asset', label: 'Other Asset' },
  { value: 'other_liability', label: 'Other Liability' },
] as const;

const INPUT_BG = 'bg-[#0B2219]!';

// --- Shared Components ---

interface ModalBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

function ModalBase({ open, onOpenChange, title, loading, onSubmit, children }: ModalBaseProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} showCloseButton={false} className="max-w-[520px]">
      <DialogContent className="p-0 bg-[#0F2A20] border-[#1E3D2F] rounded-xl overflow-hidden">
        <div className="w-full flex flex-col">
          {/* Header */}
          <div className="w-full px-8 pb-4 flex justify-between items-center bg-[#0F2A20]">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-semibold text-white">{title}</div>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <X className="h-5.5 w-5.5 text-[#A1BEAD]" />
            </button>
          </div>

          {/* Form */}
          <div className="bg-[#0F2A20]">
            <form id="modal-form" onSubmit={onSubmit} className="px-8 pt-4 pb-4 flex flex-col gap-6">
              {children}
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pt-4 pb-4 flex flex-col gap-4 bg-[#0F2A20]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-11 rounded-full border border-[#1E3D2F] text-base font-medium text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                form="modal-form"
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-[#57B75C] rounded-full text-base font-semibold text-white hover:bg-[#4ca651] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, children, className = '' }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-normal text-white/60 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

interface CurrencyInputProps extends React.ComponentProps<typeof Input> {
  label: string;
}

function CurrencyInput({ label, value, onChange, ...props }: CurrencyInputProps) {
  return (
    <FormField label={label}>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
        <Input
          {...props}
          type="text"
          value={value}
          onChange={(e) => onChange?.({ ...e, target: { ...e.target, value: e.target.value.replace(/[^0-9.]/g, '') } } as any)}
          className={`h-[42px] pl-8 pr-4 ${INPUT_BG} border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 text-right focus:border-[#1E3D2F] focus:ring-0 ${props.className || ''}`}
        />
      </div>
    </FormField>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
  className = '',
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <FormField label={label} className={className}>
      <div className="relative">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-[42px] px-4 ${INPUT_BG} border-[#1E3D2F] rounded-full text-white focus:border-[#1E3D2F] focus:ring-0 appearance-none w-full`}
        >
          {options.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </FormField>
  );
}

// --- Modals ---

export function GoalModal({
  open,
  onOpenChange,
  goal,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: FinancialGoal | null;
  onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<FinancialGoal['goal_type']>('custom');
  const [targetDate, setTargetDate] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useUser();

  useEffect(() => {
    if (goal) {
      setName(goal.name || '');
      setGoalType(goal.goal_type || 'custom');
      setTargetDate(goal.target_date ? String(new Date(goal.target_date).getFullYear()) : '');
      setTargetAmount(goal.target_amount?.replace(/[^0-9.]/g, '') || '');
      setMonthlyContribution(goal.monthly_contribution?.replace(/[^0-9.]/g, '') || '');
    } else {
      setName('');
      setGoalType('custom');
      setTargetDate('');
      setTargetAmount('');
      setMonthlyContribution('');
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountId = user?.externalAccountId;
    if (!accountId) return;

    setLoading(true);
    try {
      const payload = {
        name,
        goal_type: goalType,
        target_amount: targetAmount,
        target_date: targetDate ? `${targetDate}-01-01` : undefined,
        monthly_contribution: monthlyContribution || undefined,
      };

      if (goal?.goal_id) {
        await WidgetService.updateFinancialGoal(accountId, goal.goal_id, payload);
        toast.success('Goal updated successfully');
      } else {
        await WidgetService.createFinancialGoal(accountId, payload);
        toast.success('Goal created successfully');
      }
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save goal:', error);
      toast.error(error.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase open={open} onOpenChange={onOpenChange} title="Goals" loading={loading} onSubmit={handleSubmit}>
      <FormField label="Goal Name">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Retirement Goal"
          className={`h-[42px] px-4 ${INPUT_BG} border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0`}
          required
        />
      </FormField>

      <div className="flex gap-4">
        <SelectField
          label="Goal Type"
          options={GOAL_TYPES}
          value={goalType}
          onChange={(val) => setGoalType(val as any)}
          className="flex-1"
        />
        <FormField label="Target Date" className="flex-1">
          <Input
            type="number"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            placeholder="2030"
            className={`h-[42px] px-4 ${INPUT_BG} border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0`}
          />
        </FormField>
      </div>

      <div className="flex gap-4">
        <CurrencyInput
          label="Target Amount"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="500,000"
          className="flex-1"
        />
        <CurrencyInput
          label="Monthly Contrib."
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(e.target.value)}
          placeholder="800"
          className="flex-1"
        />
      </div>
    </ModalBase>
  );
}

export function LifeEventModal({
  open,
  onOpenChange,
  event,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: LifeEvent | null;
  onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<LifeEventType>('custom');
  const [expectedDate, setExpectedDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useUser();

  useEffect(() => {
    if (event) {
      setName(event.name || '');
      setEventType(event.event_type || 'custom');
      setExpectedDate(event.expected_date ? String(new Date(event.expected_date).getFullYear()) : '');
      setEstimatedCost(event.estimated_cost?.replace(/[^0-9.]/g, '') || '');
    } else {
      setName('');
      setEventType('custom');
      setExpectedDate('');
      setEstimatedCost('');
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountId = user?.externalAccountId;
    if (!accountId) return;

    setLoading(true);
    try {
      const payload = {
        name,
        event_type: eventType,
        expected_date: expectedDate ? `${expectedDate}-01-01` : new Date().toISOString(),
        estimated_cost: estimatedCost,
      };

      if (event?.event_id) {
        await LifeEventService.updateLifeEvent(accountId, event.event_id, payload);
        toast.success('Life event updated successfully');
      } else {
        await LifeEventService.createLifeEvent(accountId, payload);
        toast.success('Life event created successfully');
      }
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save life event:', error);
      toast.error(error.message || 'Failed to save life event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase open={open} onOpenChange={onOpenChange} title="Life Events" loading={loading} onSubmit={handleSubmit}>
      <FormField label="Event Name">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Home Purchase"
          className={`h-[42px] px-4 ${INPUT_BG} border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0`}
          required
        />
      </FormField>

      <div className="flex gap-4">
        <SelectField
          label="Event Type"
          options={LIFE_EVENT_TYPES}
          value={eventType}
          onChange={(val) => setEventType(val as any)}
          className="flex-1"
        />
        <FormField label="Expected Date" className="flex-1">
          <Input
            type="number"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            placeholder="2027"
            className={`h-[42px] px-4 ${INPUT_BG} border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0`}
          />
        </FormField>
      </div>

      <CurrencyInput label="Est. Cost" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="500,000" />
    </ModalBase>
  );
}

export function ExternalAccountModal({
  open,
  onOpenChange,
  account,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: ExternalAccount | null;
  onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [isAsset, setIsAsset] = useState(true);
  const [loading, setLoading] = useState(false);
  const user = useUser();

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setAccountType(account.account_type || 'checking');
      setBalance(account.balance?.replace(/[^0-9.]/g, '') || '');
      setInstitution(account.institution || '');
      setIsAsset(account.is_asset ?? true);
    } else {
      setName('');
      setAccountType('checking');
      setBalance('');
      setInstitution('');
      setIsAsset(true);
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountId = user?.externalAccountId;
    if (!accountId) return;

    setLoading(true);
    try {
      const payload = {
        name,
        account_type: accountType,
        balance,
        institution: institution || undefined,
        is_asset: isAsset,
      };

      if (account?.external_account_id) {
        await ExternalAccountService.updateExternalAccount(accountId, account.external_account_id, payload);
        toast.success('External account updated successfully');
      } else {
        await ExternalAccountService.createExternalAccount(accountId, payload);
        toast.success('External account added successfully');
      }
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save external account:', error);
      toast.error(error.message || 'Failed to save external account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase open={open} onOpenChange={onOpenChange} title="External Accounts" loading={loading} onSubmit={handleSubmit}>
      <FormField label="Account Name">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Chase Checking"
          className={`h-[42px] px-4 ${INPUT_BG} border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0`}
          required
        />
      </FormField>

      <div className="flex gap-4">
        <SelectField
          label="Account Type"
          options={ACCOUNT_TYPES}
          value={accountType}
          onChange={(val) => setAccountType(val)}
          className="flex-1"
        />
        <FormField label="Institution" className="flex-1">
          <Input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="JPMorgan Chase"
            className={`h-[42px] px-4 ${INPUT_BG} border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0`}
          />
        </FormField>
      </div>

      <div className="flex gap-4">
        <CurrencyInput
          label="Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="45,000"
          className="flex-1"
        />
        <SelectField
          label="Asset/Liability"
          options={[
            { value: 'asset', label: 'Asset' },
            { value: 'liability', label: 'Liability' },
          ]}
          value={isAsset ? 'asset' : 'liability'}
          onChange={(val) => setIsAsset(val === 'asset')}
          className="flex-1"
        />
      </div>
    </ModalBase>
  );
}
