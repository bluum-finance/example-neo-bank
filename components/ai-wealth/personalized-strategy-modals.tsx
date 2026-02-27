'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

// Goal Modal Component
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
      } else {
        await WidgetService.createFinancialGoal(accountId, payload);
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} showCloseButton={false}>
      <DialogContent className="max-w-[518px] p-0 bg-[#0F2A20] border-[#1E3D2F] rounded-xl overflow-hidden">
        <div className="w-full flex flex-col">
          {/* Header */}
          <div className="w-full px-8 pb-4 flex justify-between items-center bg-[#0F2A20]">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold text-white">Goals</div>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Form */}
          <div className="bg-[#0F2A20]">
            <form onSubmit={handleSubmit} className="px-8 pt-4 pb-4 flex flex-col gap-6">
              <div className="flex flex-col gap-6">
                {/* Goal Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Goal Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Retirement Goal"
                    className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0"
                    required
                  />
                </div>

                {/* Goal Type & Target Date */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Goal Type</label>
                    <div className="relative">
                      <Select
                        value={goalType}
                        onChange={(e) => setGoalType(e.target.value as FinancialGoal['goal_type'])}
                        className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white focus:border-[#1E3D2F] focus:ring-0 appearance-none"
                      >
                        {GOAL_TYPES.map((type) => (
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
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Target Date</label>
                    <Input
                      type="number"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      placeholder="2030"
                      className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0"
                    />
                  </div>
                </div>

                {/* Target Amount & Monthly Contribution */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Target Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
                      <Input
                        type="text"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="500,000"
                        className="h-[42px] pl-8 pr-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 text-right focus:border-[#1E3D2F] focus:ring-0"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Monthly Contrib.</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
                      <Input
                        type="text"
                        value={monthlyContribution}
                        onChange={(e) => setMonthlyContribution(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="800"
                        className="h-[42px] pl-8 pr-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 text-right focus:border-[#1E3D2F] focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pt-4 pb-8 flex flex-col gap-4 bg-[#0F2A20]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 py-3.5 rounded-full border border-[#1E3D2F] text-base font-medium text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3.5 bg-[#57B75C] rounded-full text-base font-semibold text-white hover:bg-[#4ca651] transition-colors disabled:opacity-50"
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

// Life Event Modal Component
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
      } else {
        await LifeEventService.createLifeEvent(accountId, payload);
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save life event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} showCloseButton={false}>
      <DialogContent className="max-w-[518px] p-0 bg-[#0F2A20] border-[#1E3D2F] rounded-xl overflow-hidden">
        <div className="w-full pt-8 pb-8 flex flex-col">
          {/* Header */}
          <div className="w-full px-8 pb-4 flex justify-between items-center bg-[#0F2A20]">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold text-white">Life Events</div>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <X className="h-5 w-5 text-[#A1BEAD]" />
            </button>
          </div>

          {/* Form */}
          <div className="bg-[#0F2A20]">
            <form onSubmit={handleSubmit} className="px-8 pt-4 pb-4 flex flex-col gap-6">
              <div className="flex flex-col gap-6">
                {/* Event Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Event Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Home Purchase"
                    className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0"
                    required
                  />
                </div>

                {/* Event Type & Expected Date */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Event Type</label>
                    <div className="relative">
                      <Select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as LifeEventType)}
                        className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white focus:border-[#1E3D2F] focus:ring-0 appearance-none"
                      >
                        {LIFE_EVENT_TYPES.map((type) => (
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
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Expected Date</label>
                    <Input
                      type="number"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      placeholder="2027"
                      className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0"
                    />
                  </div>
                </div>

                {/* Estimated Cost */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Est. Cost</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
                    <Input
                      type="text"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="500,000"
                      className="h-[42px] pl-8 pr-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 text-right focus:border-[#1E3D2F] focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pt-4 pb-8 flex flex-col gap-4 bg-[#0F2A20]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 py-3.5 rounded-full border border-[#1E3D2F] text-base font-medium text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3.5 bg-[#57B75C] rounded-full text-base font-semibold text-white hover:bg-[#4ca651] transition-colors disabled:opacity-50"
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

// External Account Modal Component
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
      } else {
        await ExternalAccountService.createExternalAccount(accountId, payload);
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save external account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} showCloseButton={false}>
      <DialogContent className="max-w-[518px] p-0 bg-[#0F2A20] border-[#1E3D2F] rounded-xl overflow-hidden">
        <div className="w-full flex flex-col">
          {/* Header */}
          <div className="w-full px-8 pb-4 flex justify-between items-center bg-[#0F2A20]">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold text-white">External Accounts</div>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <X className="h-5 w-5 text-[#A1BEAD]" />
            </button>
          </div>

          {/* Form */}
          <div className="bg-[#0F2A20]">
            <form onSubmit={handleSubmit} className="px-8 pt-4 pb-4 flex flex-col gap-6">
              <div className="flex flex-col gap-6">
                {/* Account Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Account Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Chase Checking"
                    className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0"
                    required
                  />
                </div>

                {/* Account Type & Institution */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Account Type</label>
                    <div className="relative">
                      <Select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white focus:border-[#1E3D2F] focus:ring-0 appearance-none"
                      >
                        {ACCOUNT_TYPES.map((type) => (
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
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Institution</label>
                    <Input
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="JPMorgan Chase"
                      className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 focus:border-[#1E3D2F] focus:ring-0"
                    />
                  </div>
                </div>

                {/* Balance & Asset/Liability */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Balance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
                      <Input
                        type="text"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="45,000"
                        className="h-[42px] pl-8 pr-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white placeholder:text-white/40 text-right focus:border-[#1E3D2F] focus:ring-0"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-white/60 uppercase tracking-wider">Asset/Liability</label>
                    <div className="relative">
                      <Select
                        value={isAsset ? 'asset' : 'liability'}
                        onChange={(e) => setIsAsset(e.target.value === 'asset')}
                        className="h-[42px] px-4 bg-[#0B2219] border-[#1E3D2F] rounded-full text-white focus:border-[#1E3D2F] focus:ring-0 appearance-none"
                      >
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                      </Select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pt-4 pb-8 flex flex-col gap-4 bg-[#0F2A20]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 py-3.5 rounded-full border border-[#1E3D2F] text-base font-medium text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3.5 bg-[#57B75C] rounded-full text-base font-semibold text-white hover:bg-[#4ca651] transition-colors disabled:opacity-50"
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
