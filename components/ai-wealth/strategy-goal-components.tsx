'use client';

import React, { useState } from 'react';
import { CheckCheck, Pencil, Trash2, Flag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type FinancialGoal } from '@/services/widget.service';

// ─── Types & Constants ────────────────────────────────────────────────────────

export const GOAL_TYPES = ['Retirement', 'Emergency Fund', 'Real Estate', 'Education', 'Wealth Growth', 'Custom'] as const;

export interface DraftGoalState {
  name: string;
  goalType: string;
  targetDate: string;
  targetAmount: string;
  monthlyContribution: string;
}

// ─── GoalCard ─────────────────────────────────────────────────────────────────

/** Single goal row card */
export function GoalCard({
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
    <div className="flex items-center gap-3 rounded-xl bg-[#0F2A20] px-5 py-3 border border-white/5 hover:bg-white/5 transition-colors group">
      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        {/* Name + priority badge */}
        <div className="flex items-center gap-3">
          <span className="text-base font-medium leading-7 text-white">{goal.name}</span>
          {goal.priority != null && (
            <span
              className={cn(
                'rounded h-5 px-2 flex items-center justify-center text-[10px] font-semibold text-white uppercase',
                goal.priority === 1
                  ? 'bg-red-500/20 text-red-400'
                  : goal.priority === 2
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-[#124031] text-[#57B75C]'
              )}
            >
              P{goal.priority}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#8DA69B] font-medium">{amount}</span>
          <Dot />
          {goal.status == 'completed' ? (
            <span className="text-sm text-[#30D158]">Completed</span>
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
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          aria-label={`Edit ${goal.name}`}
          onClick={() => onEdit?.(goal)}
          className="rounded-lg p-2 text-[#B0B8BD] hover:text-white hover:bg-white/5 transition-all"
        >
          <Pencil size={14} />
        </button>
        <button
          aria-label={`Delete ${goal.name}`}
          onClick={() => onDelete?.(goal.goal_id)}
          className="rounded-lg p-2 text-[#B0B8BD] hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── DraftGoalForm ────────────────────────────────────────────────────────────

export function DraftGoalForm({
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tiny dot separator */
function Dot() {
  return <span className="h-1 w-1 rounded-full bg-white/20 shrink-0" />;
}

/** Labelled field wrapper */
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
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
      {prefix && <span className="pointer-events-none absolute left-4 text-[14px] font-normal text-white/40">{prefix}</span>}
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
          inputClassName
        )}
      />
    </div>
  );
}
