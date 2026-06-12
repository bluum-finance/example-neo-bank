'use client';

import React from 'react';
import { Copy, Check, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/hooks/use-currency';
import { cn } from '@/lib/utils';
import type { DepositMethodDetails, ExternalDepositResponse, ManualBankTransferDetails } from '@/lib/bluum-api.types';

interface ManualTransferInstructionsProps {
  deposit: ExternalDepositResponse;
  onDone?: () => void;
}

function isIvoryPayProvider(md: DepositMethodDetails): boolean {
  const provider = String(
    (md as Record<string, unknown>).provider_name ??
      (md as Record<string, unknown>).providerName ??
      (md as Record<string, unknown>).provider ??
      ''
  ).toLowerCase();
  return provider === 'ivorypay';
}

function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return 'Expired';
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function useExpiryCountdown(expiresAt: string | null | undefined): number | null {
  const [remainingMs, setRemainingMs] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(null);
      return;
    }
    const expiry = new Date(expiresAt).getTime();
    if (Number.isNaN(expiry)) {
      setRemainingMs(null);
      return;
    }
    const tick = () => setRemainingMs(Math.max(0, expiry - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return remainingMs;
}

type BankRow = NonNullable<ManualBankTransferDetails['bank_details']> & {
  bank?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
};

export function ManualTransferInstructions({ deposit, onDone }: ManualTransferInstructionsProps) {
  const { displayAmount } = useCurrency();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const md = (deposit.method_details ?? {}) as ManualBankTransferDetails & Record<string, unknown>;
  const isIvoryPay = isIvoryPayProvider(md);
  const bankDetails = (md.bank_details ?? md.bankDetails) as BankRow | undefined;
  const referenceCode =
    md.reference_code ?? (md.referenceCode as string | undefined) ?? (md.reference as string | undefined);
  const expiresAt = deposit.expires_at ?? md.expires_at ?? (md.expiresAt as string | undefined);
  const remainingMs = useExpiryCountdown(expiresAt);
  const isExpired = remainingMs !== null && remainingMs <= 0;
  const isUrgent = remainingMs !== null && remainingMs > 0 && remainingMs < 5 * 60 * 1000;

  const amountPayable = md.amount_payable ?? (md.amountPayable as string | number | undefined);
  const transferAmount =
    isIvoryPay && amountPayable != null
      ? parseFloat(String(amountPayable))
      : parseFloat(deposit.amount ?? '0');

  const copyToClipboard = (text: string | undefined, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!bankDetails || (!isIvoryPay && !referenceCode)) {
    return (
      <div className="py-8 text-center text-sm text-[#9DB9AB]">
        Invalid deposit details. Please contact support.
      </div>
    );
  }

  const bankName = bankDetails.bank_name ?? bankDetails.bankName ?? bankDetails.bank;

  return (
    <div className="flex flex-col gap-0 max-h-[65vh] overflow-y-auto">
      <div className="px-1 py-4 text-center border-b border-[#1E3D2F]">
        <p className="text-[11px] uppercase tracking-widest text-[#9DB9AB] font-medium mb-1">Transfer Exactly</p>
        <p className="text-3xl font-bold tracking-tight tabular-nums text-white">
          {displayAmount(transferAmount, deposit.currency)}
        </p>
        <p className="text-[11px] text-[#9DB9AB] mt-1">Transfers with a different amount will be rejected</p>
      </div>

      {referenceCode && (
        <div className="px-1 py-4 border-b border-[#1E3D2F]">
          <p className="text-[10px] uppercase tracking-widest text-[#9DB9AB] font-medium mb-2">Reference Code</p>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-[#07120F] border border-[#1F4536] px-3 py-2.5">
            <span className="font-mono text-sm font-semibold tracking-wider text-white">{referenceCode}</span>
            <CopyButton field="Reference code" value={referenceCode} copiedField={copiedField} onCopy={copyToClipboard} />
          </div>
          <p className="text-[11px] text-amber-400 mt-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            Include this code in your transfer memo/narration
          </p>
        </div>
      )}

      <div className="px-1 py-4 border-b border-[#1E3D2F]">
        <p className="text-[10px] uppercase tracking-widest text-[#9DB9AB] font-medium mb-3">Bank Details</p>
        <div className="divide-y divide-[#1E3D2F] rounded-lg border border-[#1F4536] overflow-hidden">
          <BankDetailRow label="Account Name" value={bankDetails.account_name ?? bankDetails.accountName} field="Account name" copiedField={copiedField} onCopy={copyToClipboard} />
          <BankDetailRow label="Bank" value={bankName} field="Bank name" copiedField={copiedField} onCopy={copyToClipboard} />
          <BankDetailRow label="Account Number" value={bankDetails.account_number ?? bankDetails.accountNumber} field="Account number" copiedField={copiedField} onCopy={copyToClipboard} mono />
          <BankDetailRow label="Routing Number" value={bankDetails.routing_number ?? bankDetails.routingNumber} field="Routing number" copiedField={copiedField} onCopy={copyToClipboard} mono />
          <BankDetailRow label="SWIFT / BIC" value={bankDetails.swift_code ?? bankDetails.swiftCode} field="SWIFT code" copiedField={copiedField} onCopy={copyToClipboard} mono />
          {bankDetails.instructions && (
            <div className="px-3 py-2.5 bg-[#07120F]">
              <p className="text-[10px] uppercase tracking-wider text-[#9DB9AB] font-medium mb-1">Instructions</p>
              <p className="text-sm text-white">{bankDetails.instructions}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-1 py-4 flex items-center justify-center">
        <div
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium',
            isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-[#9DB9AB]'
          )}
        >
          <Clock className={cn('h-3.5 w-3.5 shrink-0', isUrgent && !isExpired && 'animate-pulse')} />
          {remainingMs !== null ? (
            isExpired ? (
              <span>Expired — initiate a new deposit</span>
            ) : (
              <span>
                Expires in <span className="font-mono tabular-nums">{formatCountdown(remainingMs)}</span>
              </span>
            )
          ) : (
            <span>No expiry set</span>
          )}
        </div>
      </div>

      {onDone && (
        <div className="px-1 pb-2">
          <Button className="w-full gap-2 bg-[#57B75C] hover:bg-[#57B75C]/90" onClick={onDone} disabled={isExpired}>
            I&apos;ve sent the transfer
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function CopyButton({
  field,
  value,
  copiedField,
  onCopy,
}: {
  field: string;
  value: string | undefined;
  copiedField: string | null;
  onCopy: (text: string | undefined, field: string) => void;
}) {
  const copied = copiedField === field;
  return (
    <button
      type="button"
      onClick={() => onCopy(value, field)}
      className={cn(
        'flex items-center justify-center h-7 w-7 rounded-md transition-colors shrink-0',
        copied ? 'text-[#30D158]' : 'text-[#9DB9AB] hover:text-white hover:bg-[#1F4536]'
      )}
      aria-label={`Copy ${field}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function BankDetailRow({
  label,
  value,
  field,
  copiedField,
  onCopy,
  mono = false,
}: {
  label: string;
  value: string | undefined;
  field: string;
  copiedField: string | null;
  onCopy: (text: string | undefined, field: string) => void;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#07120F] hover:bg-[#0E231F] transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-[#9DB9AB] font-medium leading-none mb-1">{label}</p>
        <p className={cn('text-sm font-medium truncate text-white', mono && 'font-mono tracking-wide')}>{value}</p>
      </div>
      <CopyButton field={field} value={value} copiedField={copiedField} onCopy={onCopy} />
    </div>
  );
}
