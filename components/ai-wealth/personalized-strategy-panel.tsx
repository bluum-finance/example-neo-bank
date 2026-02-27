'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronUp, Plus, SendHorizonal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SidePanel } from '@/components/custom/side-panel';
import { WidgetService, type FinancialGoal } from '@/services/widget.service';
import { AssistantService } from '@/services/assistant.service';
import { LifeEventService, type LifeEvent, type LifeEventType } from '@/services/life-event.service';
import { ExternalAccountService, type ExternalAccount } from '@/services/external-account.service';
import { useExternalAccountId } from '@/store/user.store';
import { GoalCard, DraftGoalForm, type DraftGoalState } from './strategy-goal-components';
import { EventCard, DraftEventForm, type DraftEventState } from './strategy-event-components';
import { AccountCard, DraftAccountForm, type DraftAccountState } from './strategy-account-components';
import { StepProgressBar, UserBubble, SystemPill, AssistantBubble } from './strategy-ui-components';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PersonalizedStrategyPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chat history to display */
  messages?: ChatMessage[];
  onContinue?: () => void;
  onSendMessage?: (text: string) => void;
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', role: 'user', content: 'I want to retire at 60 with 2.5m' },
  { id: '2', role: 'system', content: 'Goal added' },
  { id: '3', role: 'assistant', content: "Anything else you're saving for?" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GOAL_TYPE_MAP: Record<string, FinancialGoal['goal_type']> = {
  Retirement: 'retirement',
  'Emergency Fund': 'emergency',
  'Real Estate': 'home_purchase',
  Education: 'education',
  'Wealth Growth': 'wealth_growth',
  Custom: 'custom',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function PersonalizedStrategyPanel({
  open,
  onOpenChange,
  messages: initialMessages = DEFAULT_MESSAGES,
  onSendMessage,
}: PersonalizedStrategyPanelProps) {
  const accountId = useExternalAccountId();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Sync if prop changes
  useEffect(() => {
    setChatMessages(initialMessages);
  }, [initialMessages]);

  // ── Goals state ──
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  // ── Life Events state ──
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ── External Accounts state ──
  const [accounts, setAccounts] = useState<ExternalAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // ── UI state ──
  const [inputValue, setInputValue] = useState('');
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [accountsExpanded, setAccountsExpanded] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const [draftGoal, setDraftGoal] = useState<(Partial<DraftGoalState> & { _goalId?: string }) | null>(null);
  const [draftEvent, setDraftEvent] = useState<(Partial<DraftEventState> & { _eventId?: string }) | null>(null);
  const [draftAccount, setDraftAccount] = useState<(Partial<DraftAccountState> & { _accountId?: string }) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!accountId) return;
    setGoalsLoading(true);
    setEventsLoading(true);
    setAccountsLoading(true);
    try {
      const [goalsResult, eventsResult, accountsResult] = await Promise.allSettled([
        WidgetService.getFinancialGoals(accountId),
        LifeEventService.listLifeEvents(accountId),
        ExternalAccountService.listExternalAccounts(accountId),
      ]);

      if (goalsResult.status === 'fulfilled') {
        setGoals(goalsResult.value);
      } else {
        console.error('Failed to load goals', goalsResult.reason);
        toast.error('Failed to load goals');
      }

      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value.life_events);
      } else {
        console.error('Failed to load life events', eventsResult.reason);
        toast.error('Failed to load life events');
      }

      if (accountsResult.status === 'fulfilled') {
        setAccounts(accountsResult.value.external_accounts);
      } else {
        console.error('Failed to load external accounts', accountsResult.reason);
        toast.error('Failed to load external accounts');
      }
    } finally {
      setGoalsLoading(false);
      setEventsLoading(false);
      setAccountsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    setCurrentStep(1);
    if (open) {
      loadData();
      setGoalsExpanded(false);
      setEventsExpanded(false);
      setAccountsExpanded(false);
      scrollConversationToBottom();
    }
  }, [open]);

  useEffect(() => {
    if (currentStep === 1) {
      setGoalsExpanded(true);
    } else if (currentStep === 2) {
      setEventsExpanded(true);
    } else if (currentStep === 3) {
      setAccountsExpanded(true);
    }
  }, [currentStep]);

  // ── Auto-scroll chat to bottom when messages change ──
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading, draftGoal, draftEvent, draftAccount]);

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || !accountId) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    onSendMessage?.(trimmed);

    setIsChatLoading(true);
    try {
      const response = await AssistantService.chat(accountId, trimmed);
      const assistantText =
        (response && (response.message || response.answer || response.text)) ||
        (typeof response === 'string' ? response : '') ||
        "I'm sorry, I couldn't generate a response.";

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      toast.error(err?.message || 'Failed to contact assistant');
    } finally {
      setIsChatLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function scrollConversationToBottom() {
    requestAnimationFrame(() => {
      conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ── Goal Actions ──
  function openAddGoal() {
    setDraftGoal({});
    setDraftEvent(null);
    setDraftAccount(null);
    scrollConversationToBottom();
  }

  function openEditGoal(goal: FinancialGoal) {
    const displayType = Object.entries(GOAL_TYPE_MAP).find(([, v]) => v === goal.goal_type)?.[0] ?? 'Custom';
    setDraftGoal({
      _goalId: goal.goal_id,
      name: goal.name,
      goalType: displayType,
      targetDate: goal.target_date ? String(new Date(goal.target_date).getFullYear()) : '',
      targetAmount: goal.target_amount?.replace(/[^0-9.]/g, '') ?? '',
      monthlyContribution: goal.monthly_contribution?.replace(/[^0-9.]/g, '') ?? '',
    });
    setDraftEvent(null);
    setDraftAccount(null);
    scrollConversationToBottom();
  }

  async function handleGoalSave(draft: DraftGoalState) {
    if (!accountId) return;
    setIsSaving(true);
    const goalId = (draftGoal as any)?._goalId;
    const payload = {
      name: draft.name,
      goal_type: (GOAL_TYPE_MAP[draft.goalType] ?? 'custom') as FinancialGoal['goal_type'],
      target_amount: draft.targetAmount,
      target_date: draft.targetDate ? `${draft.targetDate}-01-01` : undefined,
      monthly_contribution: draft.monthlyContribution || undefined,
    };

    try {
      if (goalId) {
        const updated = await WidgetService.updateFinancialGoal(accountId, goalId, payload);
        setGoals((prev) => prev.map((g) => (g.goal_id === goalId ? updated : g)));
        toast.success('Goal updated');
      } else {
        const created = await WidgetService.createFinancialGoal(accountId, payload);
        setGoals((prev) => [...prev, created]);
        toast.success('Goal added');
      }
      setDraftGoal(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save goal');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteGoal(goalId: string) {
    if (!accountId) return;
    try {
      await WidgetService.deleteFinancialGoal(accountId, goalId);
      setGoals((prev) => prev.filter((g) => g.goal_id !== goalId));
      toast.success('Goal deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete goal');
    }
  }

  // ── Event Actions ──
  function openAddEvent() {
    setDraftEvent({});
    setDraftGoal(null);
    setDraftAccount(null);
    scrollConversationToBottom();
  }

  function openEditEvent(event: LifeEvent) {
    setDraftEvent({
      _eventId: event.event_id,
      name: event.name,
      eventType: event.event_type,
      estimatedDate: event.expected_date ? String(new Date(event.expected_date).getFullYear()) : '',
      estimatedCost: event.estimated_cost?.replace(/[^0-9.]/g, '') ?? '',
      shortNote: event.notes ?? '',
    });
    setDraftGoal(null);
    setDraftAccount(null);
    scrollConversationToBottom();
  }

  async function handleEventSave(draft: DraftEventState) {
    if (!accountId) return;
    setIsSaving(true);
    const eventId = (draftEvent as any)?._eventId;
    const payload = {
      name: draft.name,
      event_type: draft.eventType,
      expected_date: draft.estimatedDate ? `${draft.estimatedDate}-01-01` : '',
      estimated_cost: draft.estimatedCost,
      notes: draft.shortNote,
    };

    try {
      if (eventId) {
        const updated = await LifeEventService.updateLifeEvent(accountId, eventId, payload);
        setEvents((prev) => prev.map((e) => (e.event_id === eventId ? updated : e)));
        toast.success('Event updated');
      } else {
        const created = await LifeEventService.createLifeEvent(accountId, payload);
        setEvents((prev) => [...prev, created]);
        toast.success('Event added');
      }
      setDraftEvent(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!accountId) return;
    try {
      await LifeEventService.deleteLifeEvent(accountId, eventId);
      setEvents((prev) => prev.filter((e) => e.event_id !== eventId));
      toast.success('Event deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete event');
    }
  }

  // ── Account Actions ──
  function openAddAccount() {
    setDraftAccount({});
    setDraftGoal(null);
    setDraftEvent(null);
    scrollConversationToBottom();
  }

  function openEditAccount(account: ExternalAccount) {
    setDraftAccount({
      _accountId: account.external_account_id,
      name: account.name,
      accountType: account.account_type,
      isAsset: account.is_asset,
      balance: account.balance?.replace(/[^0-9.]/g, '') ?? '',
      institution: account.institution ?? '',
      notes: account.notes ?? '',
    });
    setDraftGoal(null);
    setDraftEvent(null);
    scrollConversationToBottom();
  }

  async function handleAccountSave(draft: DraftAccountState) {
    if (!accountId) return;
    setIsSaving(true);
    const accountIdToUpdate = (draftAccount as any)?._accountId;
    const payload = {
      name: draft.name,
      account_type: draft.accountType,
      is_asset: draft.isAsset,
      balance: draft.balance,
      institution: draft.institution || undefined,
      notes: draft.notes || undefined,
    };

    try {
      if (accountIdToUpdate) {
        const updated = await ExternalAccountService.updateExternalAccount(accountId, accountIdToUpdate, payload);
        setAccounts((prev) => prev.map((a) => (a.external_account_id === accountIdToUpdate ? updated : a)));
        toast.success('Account updated');
      } else {
        const created = await ExternalAccountService.createExternalAccount(accountId, payload);
        setAccounts((prev) => [...prev, created]);
        toast.success('Account added');
      }
      setDraftAccount(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save account');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount(externalAccountId: string) {
    if (!accountId) return;
    try {
      await ExternalAccountService.deleteExternalAccount(accountId, externalAccountId);
      setAccounts((prev) => prev.filter((a) => a.external_account_id !== externalAccountId));
      toast.success('Account deleted');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete account');
    }
  }

  const handleToggleSection = (section: 'goals' | 'events' | 'accounts') => {
    if (section === 'goals') {
      setGoalsExpanded(!goalsExpanded);
    } else if (section === 'events') {
      setEventsExpanded(!eventsExpanded);
    } else {
      setAccountsExpanded(!accountsExpanded);
    }
  };

  return (
    <SidePanel className="max-w-160" open={open} onOpenChange={onOpenChange} showCloseButton={false}>
      <div className="flex h-full flex-col bg-[#0E231F] border-l border-[#1E3D2F]">
        {/* ── Header ── */}
        <header className="flex items-start gap-4 border-b border-[#1E3D2F] bg-[#0E231F] py-6 px-6 backdrop-blur-sm">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-start justify-between">
              <h1 className="text-xl font-medium text-white">Build your personalized profile</h1>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close panel"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:text-white/70 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-normal leading-5 text-[#8DA69B]/80">
                Step {currentStep} of {totalSteps}
              </span>
              <StepProgressBar current={currentStep} total={totalSteps} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden overflow-y-auto flex flex-col h-full">
          {/* ── Section 2: Goals & Events & Accounts (collapsible) ── */}
          <section className="border-b border-[#1E3D2F] bg-[#07120F] px-8 py-4">
            {/* Goals - Show in step 1 or step 4 */}
            <>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => handleToggleSection('goals')}>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-normal uppercase tracking-[0.7px] text-white/90">Your Goals</span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-medium leading-[16.5px] text-[#30D158] outline-1 outline-[#1A3A2C]">
                    {goals.length}
                  </span>
                </div>
                <button className={cn('text-white transition-transform', !goalsExpanded && 'rotate-180')}>
                  <ChevronUp size={16} />
                </button>
              </div>
              {goalsExpanded && (
                <div className="flex flex-col gap-3 mt-4 mb-6">
                  {goalsLoading ? (
                    <Loader2 className="animate-spin text-[#8DA69B]" size={20} />
                  ) : (
                    goals.map((goal) => <GoalCard key={goal.goal_id} goal={goal} onEdit={openEditGoal} onDelete={handleDeleteGoal} />)
                  )}
                  {goals.length === 0 && !goalsLoading && <p className="text-sm text-[#8DA69B]/60">No goals yet.</p>}
                </div>
              )}

              <div className="h-px w-full bg-[#1E3D2F] my-3" />
            </>

            {/* Events - Show in step 2 or step 4 */}
            <>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => handleToggleSection('events')}>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-normal uppercase tracking-[0.7px] text-white/90">Life Events</span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-medium leading-[16.5px] text-[#30D158] outline-1 outline-[#1A3A2C]">
                    {events.length}
                  </span>
                </div>
                <button className={cn('text-white transition-transform', !eventsExpanded && 'rotate-180')}>
                  <ChevronUp size={16} />
                </button>
              </div>
              {eventsExpanded && (
                <div className="flex flex-col gap-3 mt-4 mb-6">
                  {eventsLoading ? (
                    <Loader2 className="animate-spin text-[#8DA69B]" size={20} />
                  ) : (
                    events.map((event) => (
                      <EventCard key={event.event_id} event={event} onEdit={openEditEvent} onDelete={handleDeleteEvent} />
                    ))
                  )}
                  {events.length === 0 && !eventsLoading && <p className="text-sm text-[#8DA69B]/60">No life events yet.</p>}
                </div>
              )}
              <div className="h-px w-full bg-[#1E3D2F] my-3" />
            </>

            {/* External Accounts - Show in step 3 or step 4 */}
            <>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => handleToggleSection('accounts')}>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-normal uppercase tracking-[0.7px] text-white/90">External Accounts</span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-medium leading-[16.5px] text-[#30D158] outline-1 outline-[#1A3A2C]">
                    {accounts.length}
                  </span>
                </div>
                <button className={cn('text-white transition-transform', !accountsExpanded && 'rotate-180')}>
                  <ChevronUp size={16} />
                </button>
              </div>
              {accountsExpanded && (
                <div className="flex flex-col gap-3 mt-4 mb-6">
                  {accountsLoading ? (
                    <Loader2 className="animate-spin text-[#8DA69B]" size={20} />
                  ) : (
                    accounts.map((account) => (
                      <AccountCard
                        key={account.external_account_id}
                        account={account}
                        onEdit={openEditAccount}
                        onDelete={handleDeleteAccount}
                      />
                    ))
                  )}
                  {accounts.length === 0 && !accountsLoading && <p className="text-sm text-[#8DA69B]/60">No external accounts yet.</p>}
                </div>
              )}
            </>
          </section>

          {/* ── Section 3: Conversation ── */}
          <div className="flex flex-1 flex-col">
            <div className="flex-1 px-6 py-6">
              <p className="mb-6 text-[14px] font-normal uppercase tracking-[0.7px] text-white/80">Conversation</p>
              <div className="flex flex-col gap-5">
                {chatMessages.map((msg) => {
                  if (msg.role === 'user') return <UserBubble key={msg.id} text={msg.content} />;
                  if (msg.role === 'system') return <SystemPill key={msg.id} text={msg.content} />;
                  return <AssistantBubble key={msg.id} text={msg.content} />;
                })}
                {isChatLoading && <Loader2 className="animate-spin text-[#8DA69B]" size={20} />}
              </div>

              {draftGoal && (
                <div className="pt-6">
                  <DraftGoalForm initial={draftGoal} isSaving={isSaving} onSave={handleGoalSave} onCancel={() => setDraftGoal(null)} />
                </div>
              )}
              {draftEvent && (
                <div className="pt-6">
                  <DraftEventForm initial={draftEvent} isSaving={isSaving} onSave={handleEventSave} onCancel={() => setDraftEvent(null)} />
                </div>
              )}
              {draftAccount && (
                <div className="pt-6">
                  <DraftAccountForm
                    initial={draftAccount}
                    isSaving={isSaving}
                    onSave={handleAccountSave}
                    onCancel={() => setDraftAccount(null)}
                  />
                </div>
              )}
            </div>
          </div>

          <div ref={conversationEndRef} />
        </div>

        <footer className="border-t border-[#28432F] bg-[#0E231F] px-6 py-4">
          {currentStep < 4 && (
            <div className="relative flex items-center mb-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a goal, life event, or account..."
                disabled={isChatLoading}
                className="h-12 w-full rounded-full bg-[#0E231F] pl-8 pr-16 text-sm text-white outline-1 outline-[#1E3D2F] focus:outline-[#30D158] transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isChatLoading}
                className="absolute right-6 text-[#A1BEAD] hover:text-[#30D158] disabled:opacity-30"
              >
                <SendHorizonal size={22} className="-rotate-12" />
              </button>
            </div>
          )}
        </footer>
      </div>
    </SidePanel>
  );
}
