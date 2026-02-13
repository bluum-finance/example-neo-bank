'use client';

import React, { useState } from 'react';
import { ArrowDownIcon, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function TransactionDatatable() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any>([]);

  return (
    <div>
      {/* Top header */}
      <div className="flex flex-col mb-3">
        <div className="flex items-center justify-start gap-4 mb-3">
          <div className="inline-flex flex-col">
            <div className="text-[18px] font-semibold text-white leading-7">Transactions</div>
          </div>
          <div className="inline-flex items-center gap-1 text-sm text-[#30D158] cursor-pointer">
            <div className="text-sm text-[#30D158]">View all</div>
            <ChevronRight className="w-4 h-4 text-[#30D158]" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-[#1A3A2C] rounded-md text-white text-xs font-normal">
            Recent
          </button>
          <button className="px-4 py-2 rounded-md text-[#8DA69B] text-xs font-normal border border-transparent outline-1 outline-[#1A3A2C] outline-offset-[-1px]">
            Monthly money in
          </button>
          <button className="px-4 py-2 rounded-md text-[#8DA69B] text-xs font-normal border border-transparent outline-1 outline-[#1A3A2C] outline-offset-[-1px]">
            Monthly money out
          </button>
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="flex flex-col gap-2">
        {/* Columns header */}
        <div className="flex items-center gap-4 py-2 px-4">
          <div className="w-36 flex items-center gap-2">
            <span className="text-xs font-medium text-[#8DA69B]">Date</span>
            <span className="text-xs text-[#8DA69B]">
              <ArrowDownIcon className="w-3.5 h-3.5 text-[#8DA69B]" />
            </span>
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

        {/* Loading state */}
        {(loading || transactions.length === 0) && (
          <div className="flex flex-col gap-2">
            <div className="h-8 rounded-lg bg-[rgba(30,61,47,0.5)]" />
            <div className="h-8 rounded-lg bg-[rgba(30,61,47,0.5)]" />
          </div>
        )}

        {/* Empty state */}
        {!loading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-sm font-medium text-white">No transactions yet</div>
            <div className="max-w-[384px] text-center text-xs text-muted-foreground mt-2 px-4">
              Recent transactions (like bank-to-bank transfers, debit card transactions, and
              check deposits) will appear here once your account has funds.
            </div>
            <div className="mt-6">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full shadow-sm font-semibold">
                Fund account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
