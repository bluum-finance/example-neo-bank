'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronUp, Pencil, Trash2, Plus, SendHorizonal, CheckCheck, Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SidePanel } from '@/components/custom/side-panel';
import { WidgetService, type FinancialGoal } from '@/services/widget.service';
import { AssistantService } from '@/services/assistant.service';
import { useExternalAccountId } from '@/store/user.store';

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

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Thin progress bar showing wizard progress */
function StepProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#30D158] shadow-[0_0_10px_rgba(48,209,88,0.5)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Single goal row card */
function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: FinancialGoal;
  onEdit?: (g: FinancialGoal) => void;
  onDelete?: (id: string) => void;
}) {
  const targetYear = goal.target_date ? new Date(goal.target_date).getFullYear() : '';
  const amount = goal.target_amount ? `$${Number(goal.target_amount).toLocaleString()}` : '';
  const monthly = goal.monthly_contribution ? `$${Number(goal.monthly_contribution).toLocaleString()}` : '';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#0F2A20] px-5 py-3">
      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        {/* Name + priority badge */}
        <div className="flex items-center gap-3">
          <span className="text-base font-light leading-7 text-white">{goal.name}</span>
          {goal.priority != null && (
            <span className="rounded h-6 w-7 flex items-center justify-center bg-[#124031] text-[10px] font-light text-white">
              P{goal.priority}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 opacity-70">
          <span className="text-sm text-[#B0B8BD]">{amount}</span>
          <Dot />
          {goal.status == 'completed' ? (
            <span className="text-sm text-[#B0B8BD]">Completed</span>
          ) : (
            <>
              <span className="text-sm text-[#B0B8BD]">Target: {targetYear}</span>
              <Dot />

              {goal.monthly_contribution && <span className="text-sm text-[#B0B8BD]">{monthly}/mo</span>}
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-50">
        <button
          aria-label={`Edit ${goal.name}`}
          onClick={() => onEdit?.(goal)}
          className="rounded-lg p-2 text-[#B0B8BD] hover:opacity-100 transition-opacity"
        >
          <Pencil size={14} />
        </button>
        <button
          aria-label={`Delete ${goal.name}`}
          onClick={() => onDelete?.(goal.goal_id)}
          className="rounded-lg p-2 text-[#B0B8BD] hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/** User chat bubble (right-aligned) */
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-tl-2xl rounded-br-2xl rounded-bl-2xl bg-[#124031] px-4 py-3">
        <p className="text-[14px] font-normal leading-[22.75px] text-white">{text}</p>
      </div>
    </div>
  );
}

/** System / confirmation pill */
function SystemPill({ text }: { text: string }) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2 rounded-full bg-[#124031] px-3 py-1.5 outline-1 outline-[#124031]">
        <span className="text-[12px] font-normal leading-4 text-white">{text}</span>
        <CheckCheck size={12} className="text-white" />
      </div>
    </div>
  );
}

/** Assistant chat bubble (left-aligned with avatar) */
function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      {/* Bluum avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#07120F] outline-1 outline-[#1E3D2F]">
        <span className="text-[14px] font-bold leading-5 text-[#8DA69B]">b</span>
      </div>

      {/* Bubble */}
      <div className="max-w-[80%] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl bg-[#07120F] px-4 py-4 outline-1 outline-[#1E3D2F] shadow-sm">
        <p className="text-[14px] font-normal leading-[22.75px] text-[#E5E7EB]">{text}</p>
      </div>
    </div>
  );
}

/** Tiny dot separator */
function Dot() {
  return <span className="h-1 w-1 rounded-full bg-white/20 shrink-0" />;
}

// ─── DraftGoalForm ────────────────────────────────────────────────────────────

const GOAL_TYPES = [
  'Retirement',
  'Emergency Fund',
  'Real Estate',
  'Education',
  'Wealth Growth',
  'Custom',
] as const;

interface DraftGoalState {
  name: string;
  goalType: string;
  targetDate: string;
  targetAmount: string;
  monthlyContribution: string;
}

function DraftGoalForm({
  initial,
  isSaving = false,
  onSave,
  onCancel,
}: {
  initial?: Partial<DraftGoalState>;
  isSaving?: boolean;
  onSave: (draft: DraftGoalState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<DraftGoalState>({
    name: initial?.name ?? '',
    goalType: initial?.goalType ?? 'Real Estate',
    targetDate: initial?.targetDate ?? '',
    targetAmount: initial?.targetAmount ?? '',
    monthlyContribution: initial?.monthlyContribution ?? '',
  });

  function set<K extends keyof DraftGoalState>(key: K, value: DraftGoalState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl',
        'shadow-[0_0_20px_rgba(85,190,92,0.05),0_0_0_1px_rgba(85,190,92,0.20)]',
        'outline-1 outline-[rgba(85,190,92,0.30)]'
      )}
    >
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between border-b border-[#1E3D2F] bg-[#0F2A20] px-5 py-3">
        <div className="flex items-center gap-2">
          <Flag size={12} className="text-[#57B75C]" />
          <span className="text-[12px] font-normal uppercase tracking-[0.6px] text-[#57B75C]">Draft Goal</span>
        </div>
        <span className="text-[12px] font-normal leading-4 text-[#8DA69B]">Editable</span>
      </div>

      {/* ── Fields ── */}
      <div className="flex flex-col gap-6.5 bg-[#07120F] px-5 py-5">
        {/* Goal Name */}
        <Field label="Goal Name">
          <PillInput value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Retirement Goal" />
        </Field>

        {/* Goal Type + Target Date */}
        <div className="flex gap-4">
          <Field label="Goal Type" className="flex-1">
            <div className="relative">
              <select
                value={form.goalType}
                onChange={(e) => set('goalType', e.target.value)}
                className={cn(
                  'h-10.5 w-full appearance-none rounded-full bg-[#0E231F] pl-4 pr-10',
                  'text-[14px] font-normal text-white',
                  'outline-none border-none focus:ring-0'
                )}
              >
                {GOAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {/* Chevron */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
              >
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.57" strokeLinecap="round" />
              </svg>
            </div>
          </Field>

          <Field label="Target Date" className="flex-1">
            <PillInput value={form.targetDate} onChange={(v) => set('targetDate', v)} placeholder="2030" />
          </Field>
        </div>

        {/* Target Amount + Monthly Contrib */}
        <div className="flex gap-4">
          <Field label="Target Amount" className="flex-1">
            <PillInput
              value={form.targetAmount}
              onChange={(v) => set('targetAmount', v)}
              placeholder="500,000"
              prefix="$"
              inputClassName="text-right"
            />
          </Field>

          <Field label="Monthly Contrib." className="flex-1">
            <PillInput
              value={form.monthlyContribution}
              onChange={(v) => set('monthlyContribution', v)}
              placeholder="800"
              prefix="$"
              inputClassName="text-right"
            />
          </Field>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center justify-end gap-3 border-t border-[#1E3D2F] bg-[#0F2A20] px-5 py-4">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-[14px] font-medium text-[#8DA69B] transition-opacity hover:opacity-100 opacity-80"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-full bg-[#57B75C] px-6 py-2 text-[14px] font-normal text-white transition-colors hover:bg-[#4ca651] active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSaving && <Loader2 size={13} className="animate-spin" />}
          Save changes
        </button>
      </div>
    </div>
  );
}

/** Labelled field wrapper */
function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[12px] font-normal leading-4 text-white/60">{label}</span>
      {children}
    </div>
  );
}

/** Rounded pill text input, optionally with a $ prefix */
function PillInput({
  value,
  onChange,
  placeholder,
  prefix,
  inputClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  inputClassName?: string;
}) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="pointer-events-none absolute left-4 text-[14px] font-normal text-white/40">
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-10.5 w-full rounded-full bg-[#0E231F]',
          prefix ? 'pl-8 pr-4' : 'px-4',
          'text-[14px] font-normal text-white placeholder:text-white/30',
          'outline-none border-none focus:ring-0',
          inputClassName,
        )}
      />
    </div>
  );
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
  const [goalsExpanded, setGoalsExpanded] = useState(true);
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
        <header className="flex items-start gap-4 border-b border-[#1E3D2F] bg-[#0E231F] py-5 px-6 backdrop-blur-sm">
          <div className="flex flex-1 flex-col gap-2">
            {/* Title row */}
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-medium text-white">Define Your Goals</h1>

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
            <div className="flex gap-1">
              <span className="text-[14px] font-normal leading-5 text-[#30D158]">Goals /</span>
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-normal leading-5 text-[#8DA69B]/80">
                  Step {currentStep} of {totalSteps}
                </span>
                {/* <StepProgressBar current={currentStep} total={totalSteps} /> */}
              </div>
            </div>
          </div>
        </header>

        {/* ── Section 2: Goals list (collapsible) ── */}
        <section className="border-b border-[#1E3D2F] bg-[#07120F] px-8 py-5">
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
