'use client';

import React, { useState } from 'react';
import { Flag, Loader2, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type LifeEvent, type LifeEventType } from '@/services/life-event.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DraftEventState {
  name: string;
  eventType: LifeEventType;
  estimatedDate: string;
  estimatedCost: string;
  shortNote?: string;
}

const EVENT_TYPES: { label: string; value: LifeEventType }[] = [
  { label: 'College', value: 'college' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'Home Purchase', value: 'home_purchase' },
  { label: 'Retirement', value: 'retirement' },
  { label: 'Major Purchase', value: 'major_purchase' },
  { label: 'Career Change', value: 'career_change' },
  { label: 'Custom', value: 'custom' },
];

// ─── EventCard ────────────────────────────────────────────────────────────────

/** Single life event row card */
export function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: LifeEvent;
  onEdit?: (e: LifeEvent) => void;
  onDelete?: (id: string) => void;
}) {
  const targetYear = event.expected_date ? new Date(event.expected_date).getFullYear() : '';
  const cost = event.estimated_cost ? `$${Number(event.estimated_cost).toLocaleString()}` : '';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#0F2A20] px-5 py-3">
      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="text-base font-light leading-7 text-white">{event.name}</span>
          <span className="rounded h-6 px-2 flex items-center justify-center bg-[#124031] text-[10px] font-light text-white uppercase tracking-wider">
            {event.event_type.replace('_', ' ')}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 opacity-70">
          <span className="text-sm text-[#B0B8BD]">{cost}</span>
          <Dot />
          <span className="text-sm text-[#B0B8BD]">Target: {targetYear}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-50">
        <button
          aria-label={`Edit ${event.name}`}
          onClick={() => onEdit?.(event)}
          className="rounded-lg p-2 text-[#B0B8BD] hover:opacity-100 transition-opacity"
        >
          <Pencil size={14} />
        </button>
        <button
          aria-label={`Delete ${event.name}`}
          onClick={() => onDelete?.(event.event_id)}
          className="rounded-lg p-2 text-[#B0B8BD] hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── DraftEventForm ───────────────────────────────────────────────────────────

export function DraftEventForm({
  initial,
  isSaving = false,
  onSave,
  onCancel,
}: {
  initial?: Partial<DraftEventState>;
  isSaving?: boolean;
  onSave: (draft: DraftEventState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<DraftEventState>({
    name: initial?.name ?? '',
    eventType: initial?.eventType ?? 'home_purchase',
    estimatedDate: initial?.estimatedDate ?? '',
    estimatedCost: initial?.estimatedCost ?? '',
    shortNote: initial?.shortNote ?? '',
  });

  const updateField = <K extends keyof DraftEventState>(key: K, value: DraftEventState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full overflow-hidden rounded-xl bg-[#07120F] shadow-[0_0_20px_rgba(85,190,92,0.05),0_0_0_1px_rgba(85,190,92,0.20)] outline-1 outline-[rgba(85,190,92,0.30)] -outline-offset-1">
      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b border-[#1E3D2F] bg-[#0F2A20] px-5 py-3">
        <div className="flex items-center gap-2">
          <Flag size={12} className="text-[#57B75C]" />
          <span className="text-[12px] font-normal uppercase tracking-[0.6px] text-[#57B75C]">Draft Event</span>
        </div>
        <span className="text-[12px] font-normal text-[#8DA69B]">Editable</span>
      </header>

      {/* ── Content ── */}
      <div className="flex flex-col gap-6.5 p-5">
        {/* Event Name */}
        <Field label="Event Name">
          <PillInput
            value={form.name}
            onChange={(v) => updateField('name', v)}
            placeholder="New Baby"
          />
        </Field>

        {/* Event Type & Estimated Date */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Event Type">
            <div className="relative">
              <select
                value={form.eventType}
                onChange={(e) => updateField('eventType', e.target.value as LifeEventType)}
                className="h-10.5 w-full appearance-none rounded-full bg-[#0E231F] px-4 text-[14px] font-normal text-white outline-none focus:ring-0"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            </div>
          </Field>

          <Field label="Estimated Date">
            <PillInput
              value={form.estimatedDate}
              onChange={(v) => updateField('estimatedDate', v)}
              placeholder="2030"
            />
          </Field>
        </div>

        {/* Estimated Cost & Short Note */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Estimated cost">
            <PillInput
              value={form.estimatedCost}
              onChange={(v) => updateField('estimatedCost', v)}
              placeholder="500,000"
              prefix="$"
              inputClassName="text-right"
            />
          </Field>

          <Field label="Short note (optional)">
            <PillInput
              value={form.shortNote ?? ''}
              onChange={(v) => updateField('shortNote', v)}
              placeholder="Add a note..."
            />
          </Field>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="flex items-center justify-end gap-3 border-t border-[#1E3D2F] bg-[#0F2A20] px-5 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-[14px] font-medium text-[#8DA69B] transition-opacity hover:opacity-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-full bg-[#57B75C] px-6 py-2 text-[14px] font-normal text-white transition-colors hover:bg-[#4ca651] active:scale-95 disabled:opacity-60"
        >
          {isSaving && <Loader2 size={13} className="animate-spin" />}
          Save changes
        </button>
      </footer>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tiny dot separator */
function Dot() {
  return <span className="h-1 w-1 rounded-full bg-white/20 shrink-0" />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-normal leading-4 text-white/60">{label}</label>
      {children}
    </div>
  );
}

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
          'h-10.5 w-full rounded-full bg-[#0E231F] text-[14px] font-normal text-white placeholder:text-white/30 outline-none focus:ring-0',
          prefix ? 'pl-8 pr-4' : 'px-4',
          inputClassName
        )}
      />
    </div>
  );
}
