'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Download,
  Filter,
  Grid,
  List,
  Receipt,
  RefreshCw,
  SortDesc,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/bluum-api.types';
import {
  formatCounterpartyLabel,
  formatMethodLabel,
  formatTransactionDateTime,
  transactionAmountDisplay,
  transactionStatusTone,
} from '@/lib/transaction-format';
import { cn } from '@/lib/utils';
import { ACCOUNT_TRANSACTIONS_PAGE_LIMIT, TransactionService } from '@/services/transaction.service';
import { useExternalAccountId } from '@/store/user.store';

type KindFilter = 'all' | 'deposit' | 'withdrawal';

function StatusBadge({ status }: { status: string | undefined }) {
  const tone = transactionStatusTone(status);
  const label = (status || 'Unknown').replace(/_/g, ' ');
  if (tone === 'success') {
    return <Badge variant="outline" className="border-[#30D158]/40 bg-[#30D158]/10 text-[#30D158] font-medium capitalize">{label}</Badge>;
  }
  if (tone === 'fail') {
    return <Badge variant="destructive" className="font-medium capitalize">{label}</Badge>;
  }
  if (tone === 'pending') {
    return (
      <Badge variant="outline" className="border-amber-500/35 bg-amber-500/10 text-amber-200/90 font-medium capitalize">
        {label}
      </Badge>
    );
  }
  return <Badge variant="outline" className="text-muted-foreground border-border font-medium capitalize">{label}</Badge>;
}

export default function TransactionsPage() {
  const accountId = useExternalAccountId();
  const [loading, setLoading] = useState(false);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadTransactions = useCallback(
    async (id: string, kind: KindFilter) => {
      setLoading(true);
      try {
        const rows = await TransactionService.getAccountTransactions(id, {
          limit: ACCOUNT_TRANSACTIONS_PAGE_LIMIT,
          ...(kind !== 'all' ? { type: kind } : {}),
        });
        setTransactions(rows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load transactions';
        toast.error(message);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!accountId) {
      setTransactions([]);
      return;
    }
    loadTransactions(accountId, kindFilter);
  }, [accountId, kindFilter, loadTransactions]);

  const accountSuffix = accountId && accountId.length > 10 ? `…${accountId.slice(-8)}` : accountId || '';

  return (
    <div className="min-h-screen pb-12">
      <div className="py-6 max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Transactions</h1>
            <CardDescription className="text-muted-foreground mt-1.5 text-sm">
              Funding activity and transfers for your investor account
            </CardDescription>
          </div>
          {!loading && accountId && (
            <p className="text-xs text-muted-foreground tabular-nums shrink-0">
              {transactions.length} shown
              {kindFilter !== 'all' ? ` · ${kindFilter === 'deposit' ? 'Deposits' : 'Withdrawals'} only` : ''}
            </p>
          )}
        </div>

        <Card className="border-border bg-card/50 shadow-none">
          <CardHeader className="pb-4 border-b border-border/80 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                role="tablist"
                aria-label="Filter by transaction type"
                className="inline-flex flex-wrap gap-2 p-1 rounded-xl bg-[#0F2A20]/90 border border-border"
              >
                {(
                  [
                    ['all', 'All activity'],
                    ['deposit', 'Deposits'],
                    ['withdrawal', 'Withdrawals'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={kindFilter === key}
                    disabled={!accountId || loading}
                    onClick={() => setKindFilter(key)}
                    className={cn(
                      'px-3.5 py-2 rounded-lg text-xs font-medium transition-colors',
                      kindFilter === key
                        ? 'bg-[#1A3A2C] text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border bg-[#0F2A20]/80 text-foreground hover:bg-[#1A3A2C]"
                  disabled={!accountId || loading}
                  onClick={() => accountId && loadTransactions(accountId, kindFilter)}
                  aria-label="Refresh transactions"
                >
                  <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
                  Refresh
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hidden sm:inline-flex"
                  disabled
                  title="Coming soon"
                >
                  <Grid className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hidden sm:inline-flex" disabled title="Coming soon">
                  <SortDesc className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hidden sm:inline-flex" disabled title="Coming soon">
                  <Download className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground pl-1 hidden md:inline">Export</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 opacity-70 pointer-events-none select-none">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A3A2C]/50 text-xs text-muted-foreground">
                <List className="size-3.5" /> Views
                <ChevronDown className="size-3.5" />
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A3A2C]/50 text-xs text-muted-foreground">
                <Filter className="size-3.5" /> Filters
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 hidden sm:inline">
                Advanced filters soon
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-0 px-0">
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[minmax(140px,1fr)_minmax(180px,2fr)_minmax(100px,1fr)_minmax(88px,0.8fr)_minmax(100px,1fr)_minmax(100px,0.9fr)] gap-3 items-center py-3 px-4 sm:px-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-[#0E231F]/50">
                  <div className="flex items-center gap-2">
                    <span>Date</span>
                  </div>
                  <div>Description</div>
                  <div className="text-right">Amount</div>
                  <div className="hidden sm:block">Account</div>
                  <div>Method</div>
                  <div className="text-center">Status</div>
                </div>

                {loading && (
                  <div className="px-4 sm:px-6 py-4 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-14 rounded-lg bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                    ))}
                  </div>
                )}

                {!loading && !accountId && (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="rounded-full bg-[#1A3A2C]/80 p-4 mb-4">
                      <Receipt className="size-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-medium text-foreground">Link an account first</CardTitle>
                    <CardDescription className="max-w-md mt-2 text-sm leading-relaxed">
                      After you sign in and finish onboarding, your cash movements and transfers will show up here.
                    </CardDescription>
                    <Button asChild className="mt-8 rounded-full">
                      <Link href="/invest">Go to Invest</Link>
                    </Button>
                  </div>
                )}

                {!loading && accountId && transactions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="rounded-full bg-[#1A3A2C]/80 p-4 mb-4">
                      <Receipt className="size-8 text-[#8DA69B]" />
                    </div>
                    <CardTitle className="text-lg font-medium text-foreground">
                      {kindFilter === 'all' ? 'No transactions yet' : `No ${kindFilter === 'deposit' ? 'deposits' : 'withdrawals'} yet`}
                    </CardTitle>
                    <CardDescription className="max-w-md mt-2 text-sm leading-relaxed">
                      Bank transfers, ACH, and wires appear here once funding settles. Try another filter or add funds from Invest.
                    </CardDescription>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Button asChild className="rounded-full">
                        <Link href="/invest">Fund account</Link>
                      </Button>
                      {kindFilter !== 'all' && (
                        <Button type="button" variant="outline" className="rounded-full border-border" onClick={() => setKindFilter('all')}>
                          Show all activity
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {!loading &&
                  accountId &&
                  transactions.length > 0 &&
                  transactions.map((tx) => {
                    const typeKey = String(tx.type).toLowerCase();
                    const isWithdrawal = typeKey === 'withdrawal';
                    const { text: amountText, flow } = transactionAmountDisplay(tx);

                    return (
                      <div
                        key={tx.id}
                        className={cn(
                          'grid grid-cols-[minmax(140px,1fr)_minmax(180px,2fr)_minmax(100px,1fr)_minmax(88px,0.8fr)_minmax(100px,1fr)_minmax(100px,0.9fr)] gap-3 items-center py-3.5 px-4 sm:px-6',
                          'border-b border-border/60 last:border-b-0 text-sm',
                          'hover:bg-[#0F2A20]/80 transition-colors'
                        )}
                      >
                        <div className="flex items-start gap-2 min-w-0">
                         
                          <div className="min-w-0">
                            <div className="text-xs text-muted-foreground tabular-nums leading-snug">{formatTransactionDateTime(tx)}</div>
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground/80 mt-0.5">{typeKey || '—'}</div>
                          </div>
                        </div>

                        <div className="min-w-0 font-normal text-sm text-foreground leading-snug line-clamp-2" title={formatCounterpartyLabel(tx)}>
                          {formatCounterpartyLabel(tx)}
                        </div>

                        <div
                          className={cn(
                            'text-right tabular-nums font-medium text-sm tracking-tight',
                            flow === 'in' && 'text-[#30D158]',
                            flow === 'out' && 'text-orange-200/95',
                            flow === 'neutral' && 'text-foreground'
                          )}
                        >
                          {amountText}
                        </div>

                        <div className="hidden sm:block text-xs text-muted-foreground font-mono truncate" title={accountId || undefined}>
                          {accountSuffix}
                        </div>

                        <div className="text-xs text-muted-foreground">{formatMethodLabel(tx)}</div>

                        <div className="flex justify-center">
                          <StatusBadge status={tx.status} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
