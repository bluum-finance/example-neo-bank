'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronUp, Plus, SendHorizonal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SidePanel } from '@/components/custom/side-panel';
import { WidgetService, type FinancialGoal } from '@/services/widget.service';
import { AssistantService } from '@/services/assistant.service';
import { useExternalAccountId } from '@/store/user.store';
import { GoalCard, DraftGoalForm, type DraftGoalState } from './strategy-goal-components';
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
  /** Current wizard step (1-based) */
  currentStep?: number;
  /** Total wizard steps */
  totalSteps?: number;
  /** Chat history to display */
  messages?: ChatMessage[];
  onContinue?: () => void;
  onSendMessage?: (text: string) => void;
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', role: 'user', content: 'I want to retire at 60 with 2m' },
  { id: '2', role: 'system', content: 'Goal added' },
  { id: '3', role: 'assistant', content: "Anything else you're saving for?" },
];

// ─── Goal type helpers ────────────────────────────────────────────────────────

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
  currentStep = 2,
  totalSteps = 4,
  messages: initialMessages = DEFAULT_MESSAGES,
  onContinue,
  onSendMessage,
}: PersonalizedStrategyPanelProps) {
  const accountId = useExternalAccountId();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);

  // Sync if prop changes
  useEffect(() => {
    setChatMessages(initialMessages);
  }, [initialMessages]);

  // ── Goals state ──
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  // ── UI state ──
  const [inputValue, setInputValue] = useState('');
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const [draftGoal, setDraftGoal] = useState<(Partial<DraftGoalState> & { _goalId?: string }) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const loadGoals = useCallback(async () => {
    if (!accountId) return;
    setGoalsLoading(true);
    try {
      const data = await WidgetService.getFinancialGoals(accountId);
      setGoals(data);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setGoalsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (open) loadGoals();
  }, [open, loadGoals]);

  // ── Auto-scroll chat to bottom when messages change ──
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

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

  function openAddGoal() {
    setDraftGoal({});
    setGoalsExpanded(false);
    scrollConversationToBottom();
  }

  function openEditGoal(goal: FinancialGoal) {
    // Reverse-map API goal_type → display label for the select
    const displayType = Object.entries(GOAL_TYPE_MAP).find(([, v]) => v === goal.goal_type)?.[0] ?? 'Custom';
    setDraftGoal({
      _goalId: goal.goal_id,
      name: goal.name,
      goalType: displayType,
      targetDate: goal.target_date ? String(new Date(goal.target_date).getFullYear()) : '',
      targetAmount: goal.target_amount?.replace(/[^0-9.]/g, '') ?? '',
      monthlyContribution: goal.monthly_contribution?.replace(/[^0-9.]/g, '') ?? '',
    });
    setGoalsExpanded(false);
    scrollConversationToBottom();
  }

  async function handleDraftSave(draft: DraftGoalState) {
    if (!accountId) {
      toast.error('Account not found');
      return;
    }
    setIsSaving(true);
    const goalId = (draftGoal as any)?._goalId as string | undefined;
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
      setGoalsExpanded(true);
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

  function handleDraftCancel() {
    setDraftGoal(null);
  }

  return (
    <SidePanel className="max-w-160" open={open} onOpenChange={onOpenChange} showCloseButton={false}>
      {/*
       * The panel is a full-height flex column with three sections:
       * 1. Header  — title, breadcrumb, progress
       * 2. Goals   — collapsible goal list
       * 3. Chat    — scrollable conversation + sticky footer input
       */}
      <div className="flex h-full flex-col bg-[#0E231F] border-l border-[#1E3D2F]">
        {/* ── Section 1: Header ── */}
        <header className="flex items-start gap-4 border-b border-[#1E3D2F] bg-[#0E231F] py-6 px-6 backdrop-blur-sm">
          <div className="flex flex-1 flex-col gap-2">
            {/* Title row */}
            <div className="flex items-start justify-between">
              <h1 className="text-xl font-medium text-white">Build your personalized profile</h1>

              {/* Close / X icon area */}
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

            {/* Breadcrumb + step progress */}
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-normal leading-5 text-[#8DA69B]/80">
                Step {currentStep} of {totalSteps}
              </span>
              <StepProgressBar current={currentStep} total={totalSteps} />
            </div>
          </div>
        </header>

        {/* ── Section 2: Goals list (collapsible) ── */}
        <section className="border-b border-[#1E3D2F] bg-[#07120F] px-8 py-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-normal uppercase tracking-[0.7px] text-white/90">Your Goals</span>
              {/* Count badge */}
              <span className="rounded-full px-3 py-1 text-[11px] font-medium leading-[16.5px] text-[#30D158] outline-1 outline-[#1A3A2C]">
                {goals.length}
              </span>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setGoalsExpanded((prev) => !prev)}
              aria-label={goalsExpanded ? 'Collapse goals' : 'Expand goals'}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#124031] text-white transition-transform duration-200"
              style={{ transform: goalsExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              <ChevronUp size={12} />
            </button>
          </div>

          {/* Goal cards */}
          {goalsLoading ? (
            <div className="mt-4 flex items-center gap-2 text-[#8DA69B] text-sm">
              <Loader2 size={14} className="animate-spin" />
              Loading goals…
            </div>
          ) : (
            goalsExpanded && (
              <div className="flex flex-col gap-3 mt-4">
                {goals.map((goal) => (
                  <GoalCard key={goal.goal_id} goal={goal} onEdit={openEditGoal} onDelete={handleDeleteGoal} />
                ))}
                {goals.length === 0 && <p className="text-sm text-[#8DA69B]/60">No goals yet. Add one below.</p>}
              </div>
            )
          )}
        </section>

        {/* ── Section 3: Conversation ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable chat area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Section label */}
            <p className="mb-6 text-[14px] font-normal uppercase tracking-[0.7px] text-white/80">Conversation</p>

            <div className="flex flex-col gap-5">
              {chatMessages.map((msg) => {
                if (msg.role === 'user') return <UserBubble key={msg.id} text={msg.content} />;
                if (msg.role === 'system') return <SystemPill key={msg.id} text={msg.content} />;
                return <AssistantBubble key={msg.id} text={msg.content} />;
              })}

              {isChatLoading && (
                <div className="flex items-start gap-3 animate-pulse">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#07120F] outline-1 outline-[#1E3D2F]">
                    <span className="text-[14px] font-bold leading-5 text-[#8DA69B]">b</span>
                  </div>
                  <div className="max-w-[80%] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl bg-[#07120F] px-4 py-4 outline-1 outline-[#1E3D2F]">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#8DA69B] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-[#8DA69B] animate-bounce" style={{ animationDelay: '200ms' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-[#8DA69B] animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scroll anchor */}
            <div ref={conversationEndRef} />

            {draftGoal !== null && (
              <div className="pt-6">
                <DraftGoalForm
                  key={draftGoal._goalId ?? 'new-goal'}
                  initial={draftGoal}
                  isSaving={isSaving}
                  onSave={handleDraftSave}
                  onCancel={handleDraftCancel}
                />
              </div>
            )}
          </div>

          {/* ── Footer: actions + text input ── */}
          <footer className="border-t border-[#28432F] bg-[#0E231F] px-6 py-4">
            {/* CTA row */}
            <div className="mb-4 flex items-center justify-between">
              {/* Add another goal */}
              <button
                onClick={openAddGoal}
                className="flex items-center gap-1.5 text-[14px] font-normal text-[#8DA69B] transition-opacity hover:opacity-100 opacity-80"
              >
                <Plus size={14} />
                Add another goal
              </button>

              {/* Continue button */}
              <button
                onClick={onContinue}
                className="group relative flex h-11 px-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#57B75C] text-[16px] font-semibold text-white transition-colors hover:bg-[#4ca651] active:scale-95"
              >
                Continue
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Text input */}
            <div className="relative flex items-center mb-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a goal (e.g., 'New Car')..."
                disabled={isChatLoading}
                className={cn(
                  'h-12 w-full rounded-full bg-[#0E231F] pl-8 pr-16',
                  'text-sm font-light text-[#A1BEAD]/50 placeholder:text-[#A1BEAD]/50',
                  'outline-1 outline-[#1E3D2F]',
                  'focus:outline-[#30D158] focus:text-white focus:text-base transition-all',
                  'focus:ring-0 focus:ring-offset-0',
                  isChatLoading && 'opacity-50 cursor-not-allowed'
                )}
              />
              <button
                onClick={handleSend}
                aria-label="Send message"
                disabled={!inputValue.trim() || isChatLoading}
                className="absolute right-6 flex items-center justify-center text-[#A1BEAD] transition-colors hover:text-[#30D158] disabled:opacity-30"
              >
                <SendHorizonal size={22} className="-rotate-12" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </SidePanel>
  );
}
