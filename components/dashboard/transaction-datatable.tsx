'use client';

import { ArrowDownIcon, ChevronRight } from 'lucide-react';
import type { Transaction } from '@/data/transaction';

function formatAmount(amount: number, type: Transaction['type']): string {
  const prefix = type === 'credit' ? '+' : '-';
  return `${prefix}$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TransactionDatatable({
  title = 'Transactions',
  showViewAll = true,
  transactions = [],
  loading = false,
  accountLabel,
}: {
  title?: string;
  showViewAll?: boolean;
  transactions?: Transaction[];
  loading?: boolean;
  accountLabel?: string;
}) {
  const hasRows = transactions.length > 0;

  return (
    <div>
      <div className="flex flex-col mb-3">
        <div className="flex items-center justify-start gap-4 mb-3">
          <div className="inline-flex flex-col">
            <div className="text-[18px] font-semibold text-white leading-7">{title}</div>
          </div>
          <div className="inline-flex items-center gap-1 text-sm text-[#30D158] cursor-pointer">
            {showViewAll && (
              <>
                <div className="text-sm text-[#30D158]">View all</div>
                <ChevronRight className="w-4 h-4 text-[#30D158]" />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-[#1A3A2C] rounded-md text-white text-xs font-normal">Recent</button>
          <button className="px-4 py-2 rounded-md text-[#8DA69B] text-xs font-normal border border-transparent outline-1 outline-[#1A3A2C] -outline-offset-1">
            Monthly money in
          </button>
          <button className="px-4 py-2 rounded-md text-[#8DA69B] text-xs font-normal border border-transparent outline-1 outline-[#1A3D2F] -outline-offset-1">
            Monthly money out
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4 py-2 px-4">
          <div className="w-36 flex items-center gap-2">
            <span className="text-xs font-medium text-[#8DA69B]">Date</span>
            <ArrowDownIcon className="w-3.5 h-3.5 text-[#8DA69B]" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-[#8DA69B]">To/From</span>
          </div>
          <div className="w-36 text-right">
            <span className="text-xs font-medium text-[#8DA69B]">Amount</span>
          </div>
          <div className="w-36 text-right">
            <span className="text-xs font-medium text-[#8DA69B]">Account</span>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col gap-2">
            <div className="h-8 rounded-lg bg-[rgba(30,61,47,0.5)]" />
            <div className="h-8 rounded-lg bg-[rgba(30,61,47,0.5)]" />
          </div>
        )}

        {!loading && hasRows && (
          <div className="flex flex-col">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 py-3 px-4 border-b border-[#1E3D2F]/60 last:border-0">
                <div className="w-36 text-sm text-[#A1BEAD]">{formatDate(tx.date)}</div>
                <div className="flex-1 text-sm text-white">{tx.description}</div>
                <div
                  className={`w-36 text-right text-sm font-medium tabular-nums ${
                    tx.type === 'credit' ? 'text-[#30D158]' : 'text-white'
                  }`}
                >
                  {formatAmount(tx.amount, tx.type)}
                </div>
                <div className="w-36 text-right text-sm text-[#8DA69B]">{accountLabel ?? tx.accountId ?? '—'}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && !hasRows && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-sm font-medium text-white">No transactions yet</div>
            <div className="max-w-[384px] text-center text-xs text-muted-foreground mt-2 px-4">
              Recent transactions (like bank-to-bank transfers, debit card transactions, and check deposits) will appear
              here once your account has funds.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
