'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Plus, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BalanceCard } from '@/components/balance-card';
import { TransactionItem } from '@/components/transaction-item';
import { Separator } from '@/components/ui/separator';
import {
  mockUserAccount,
  getTransactions,
  type Transaction,
} from '@/lib/mock-data';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your account
        </p>
      </div>

      {/* Balance Card */}
      <BalanceCard
        balance={mockUserAccount.balance}
        accountNumber={mockUserAccount.accountNumber}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
          <Link href="/transfers">
            <ArrowLeftRight className="h-5 w-5" />
            <span className="text-sm">Send Money</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
          <Link href="/invest">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Invest</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
          <Link href="/savings">
            <Plus className="h-5 w-5" />
            <span className="text-sm">Save</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
          <Link href="/cards">
            <Receipt className="h-5 w-5" />
            <span className="text-sm">Cards</span>
          </Link>
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/transfers">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading transactions...
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-1">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <TransactionItem transaction={transaction} />
                  {index < recentTransactions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

