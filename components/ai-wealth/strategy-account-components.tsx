'use client';

import React, { useState } from 'react';
import { Flag, Loader2, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types & Constants ────────────────────────────────────────────────────────

export interface ExternalAccount {
  external_account_id: string;
  account_id: string;
  name: string;
  account_type: string;
  is_asset: boolean;
  balance: string;
  currency: string;
  institution?: string;
  notes?: string;
  status: 'active' | 'archived';
  created_at: string;
}

export interface DraftAccountState {
  name: string;
  accountType: string;
  isAsset: boolean;
  balance: string;
  institution: string;
  notes: string;
}

export const ASSET_TYPES = [
  { label: 'Checking', value: 'checking' },
  { label: 'Savings', value: 'savings' },
  { label: 'Investment', value: 'investment' },
  { label: 'Retirement', value: 'retirement' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Vehicle', value: 'vehicle' },
  { label: 'Other Asset', value: 'other_asset' },
];

export const LIABILITY_TYPES = [
  { label: 'Mortgage', value: 'mortgage' },
  { label: 'Loan', value: 'loan' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Other Liability', value: 'other_liability' },
];

// ─── AccountCard ──────────────────────────────────────────────────────────────

/** Single external account row card */
export function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: ExternalAccount;
  onEdit?: (a: ExternalAccount) => void;
  onDelete?: (id: string) => void;
}) {
  const balance = `$${Number(account.balance).toLocaleString()}`;
  const typeLabel = [...ASSET_TYPES, ...LIABILITY_TYPES].find(t => t.value === account.account_type)?.label ?? account.account_type;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#0F2A20] px-5 py-3">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="text-base font-light leading-7 text-white">{account.name}</span>
          <span className={cn(
            "rounded h-6 px-2 flex items-center justify-center text-[10px] font-light uppercase tracking-wider",
            account.is_asset ? "bg-[#124031] text-[#30D158]" : "bg-[#401212] text-[#FF453A]"
          )}>
            {typeLabel}
          </span>
        </div>

        <div className="flex items-center gap-3 opacity-70">
          <span className="text-sm text-[#B0B8BD]">{balance}</span>
          {account.institution && (
            <>
              <Dot />
              <span className="text-sm text-[#B0B8BD]">{account.institution}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-50">
        <button
          aria-label={`Edit ${account.name}`}
          onClick={() => onEdit?.(account)}
          className="rounded-lg p-2 text-[#B0B8BD] hover:opacity-100 transition-opacity"
        >
          <Pencil size={14} />
        </button>
        <button
          aria-label={`Delete ${account.name}`}
          onClick={() => onDelete?.(account.external_account_id)}
          className="rounded-lg p-2 text-[#B0B8BD] hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── DraftAccountForm ─────────────────────────────────────────────────────────

export function DraftAccountForm({
  initial,
  isSaving = false,
  onSave,
  onCancel,
}: {
  initial?: Partial<DraftAccountState>;
  isSaving?: boolean;
  onSave: (draft: DraftAccountState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<DraftAccountState>({
    name: initial?.name ?? '',
    accountType: initial?.accountType ?? 'checking',
    isAsset: initial?.isAsset ?? true,
    balance: initial?.balance ?? '',
    institution: initial?.institution ?? '',
    notes: initial?.notes ?? '',
  });

  const updateField = <K extends keyof DraftAccountState>(key: K, value: DraftAccountState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const isAsset = ASSET_TYPES.some(t => t.value === value);
    setForm(prev => ({
      ...prev,
      accountType: value,
      isAsset: isAsset
    }));
  };

  return (
    <div className="w-full overflow-hidden rounded-xl bg-[#07120F] shadow-[0_0_20px_rgba(85,190,92,0.05),0_0_0_1px_rgba(85,190,92,0.20)] outline-1 outline-[rgba(85,190,92,0.30)] -outline-offset-1">
      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b border-[#1E3D2F] bg-[#0F2A20] px-5 py-3">
        <div className="flex items-center gap-2">
          <Flag size={12} className="text-[#57B75C]" />
          <span className="text-[12px] font-normal uppercase tracking-[0.6px] text-[#57B75C]">Draft Account</span>
        </div>
        <span className="text-[12px] font-normal text-[#8DA69B]">Editable</span>
      </header>

      {/* ── Content ── */}
      <div className="flex flex-col gap-6.5 p-5">
        {/* Account Name */}
        <Field label="Account Name">
          <PillInput
            value={form.name}
            onChange={(v) => updateField('name', v)}
            placeholder="e.g. Chase Checking"
          />
        </Field>

        {/* Account Type & Balance */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Account Type">
            <div className="relative">
              <select
                value={form.accountType}
                onChange={handleTypeChange}
                className="h-10.5 w-full appearance-none rounded-full bg-[#0E231F] px-4 text-[14px] font-normal text-white outline-none focus:ring-0"
              >
                <optgroup label="Assets" className="bg-[#07120F] text-[#30D158]">
                  {ASSET_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Liabilities" className="bg-[#07120F] text-[#FF453A]">
                  {LIABILITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            </div>
          </Field>

          <Field label="Current Balance">
            <PillInput
              value={form.balance}
              onChange={(v) => updateField('balance', v)}
              placeholder="0.00"
              prefix="$"
              inputClassName="text-right"
            />
          </Field>
        </div>

        {/* Institution */}
        <div className="grid grid-cols-1 gap-4">
          <Field label="Institution">
            <PillInput
              value={form.institution}
              onChange={(v) => updateField('institution', v)}
              placeholder="e.g. JPMorgan Chase"
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

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-white/20 shrink-0" />;
}
