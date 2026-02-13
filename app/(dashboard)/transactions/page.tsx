'use client';

import {
  ArrowDownIcon,
  List,
  ChevronDown,
  Filter,
  Grid,
  SlidersHorizontal,
  Download,
  SortDescIcon,
} from 'lucide-react';
import { useState } from 'react';

export default function TransactionsPage() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any>([]);

  return (
    <div className="min-h-screen">
      <div className="py-6">
        <h1 className="text-2xl font-medium text-white mb-8">Transactions</h1>

        {/* Header */}
        <div className="w-full flex items-center justify-between mb-3 font-light">
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-[#1A3A2C] rounded-md hover:opacity-90 transition">
              <List className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Data views</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-[#1A3A2C] rounded-md hover:opacity-90 transition">
              <Filter className="w-4 h-4 text-[#8DA69B]" />
              <span className="text-sm text-white">Filters</span>
            </button>

            <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-[#1A3A2C] rounded-md hover:opacity-90 transition">
              <span className="text-sm text-white">Date</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-[#1A3A2C] rounded-md hover:opacity-90 transition">
              <span className="text-sm text-white">Keyword</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-[#1A3A2C] rounded-md hover:opacity-90 transition">
              <span className="text-sm text-white">Amount</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md hover:bg-white/5 transition-colors">
              <Grid className="w-5 h-5 text-[#8DA69B]" />
            </button>
            <button className="p-2 rounded-md hover:bg-white/5 transition-colors">
              <SortDescIcon className="w-5 h-5 text-[#8DA69B]" />
            </button>
            <button className="p-2 rounded-md hover:bg-white/5 transition-colors">
              <Download className="w-5 h-5 text-[#8DA69B]" />
            </button>
            <div className="pl-2">
              <span className="text-sm font-medium text-[#8DA69B]">Export all</span>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="flex flex-col gap-2">
          {/* Columns header */}
          <div className="flex items-center gap-4 py-3 px-4 border-b border-[#1E3D2F]">
            <div className="flex-0 flex items-center gap-3 pr-4">
              <div className="w-4 h-4 rounded-full border border-[#1A3A2C]" />
              <span className="text-xs font-medium text-[#B0B8BD] uppercase">Date</span>
              <ArrowDownIcon className="w-3.5 h-3.5 text-[#8DA69B] ml-1" />
            </div>

            <div className="flex-1">
              <span className="text-xs font-medium text-[#B0B8BD] uppercase tracking-wider">
                To/From
              </span>
            </div>

            <div className="flex-none text-right">
              <span className="text-xs font-medium text-[#B0B8BD] uppercase tracking-wider">
                Amount
              </span>
            </div>
            <div className="flex-none">
              <span className="text-xs font-medium text-[#B0B8BD] uppercase tracking-wider">
                Account
              </span>
            </div>
            <div className="flex-none">
              <span className="text-xs font-medium text-[#B0B8BD] uppercase tracking-wider">
                Method
              </span>
            </div>
            <div className="flex-none text-center">
              <span className="text-xs font-medium text-[#B0B8BD] uppercase tracking-wider">
                Attachment
              </span>
            </div>
          </div>

          {/* Loading state */}
          {(loading || transactions.length === 0) && (
            <div className="flex flex-col gap-2 mt-2">
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
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full shadow-sm font-normal">
                  Fund account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
