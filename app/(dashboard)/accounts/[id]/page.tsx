'use client';

import { use } from 'react';
import { Plus, MoreHorizontal, Copy, Eye, Info, ChevronRight, ChevronDown } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionDatatable } from '@/components/dashboard/transaction-datatable';
import { getBankAccountById, formatBankBalance } from '@/lib/demo/bank-accounts';
import { getTransactionsForAccount } from '@/data/transaction';
import { useBankAccounts } from '@/lib/hooks/use-bank-accounts';

function formatBalanceParts(amount: number) {
  const formatted = formatBankBalance(amount);
  const dot = formatted.lastIndexOf('.');
  if (dot === -1) return { whole: formatted, cents: '.00' };
  return { whole: formatted.slice(0, dot), cents: formatted.slice(dot) };
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bankAccounts = useBankAccounts();
  const meta = getBankAccountById(id);
  if (!meta) notFound();

  const live = bankAccounts.find((a) => a.id === id);
  const account = { ...meta, balance: live?.balance ?? meta.defaultBalance };

  const { whole, cents } = formatBalanceParts(account.balance);
  const accountTransactions = getTransactionsForAccount(id);

  return (
    <div className="py-6 space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-medium text-white">
          {account.type} {account.mask}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#0F2A20] border-[#1E3D2F]">
          <CardContent className="flex flex-col justify-between h-full">
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-[#A1BEAD]">Available</p>
                    <Info className="h-3.5 w-3.5 text-[#A1BEAD]" />
                  </div>
                  <div className="flex items-end">
                    <span className="text-4xl text-white font-medium leading-none">{whole}</span>
                    <span className="text-2xl text-[#B0B8BD] leading-none mb-0.5">{cents}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button className="bg-[#57B75C] hover:bg-[#48a64a] text-white px-4 py-2 h-9 rounded-full shadow-sm">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#1A3A2C] border-[#1E3D2F] text-white px-4 py-2 h-9 rounded-full hover:bg-[#244d3b]"
                  >
                    Transfer
                  </Button>
                </div>
              </div>

              <div className="flex gap-12">
                <div>
                  <p className="text-xs text-[#A1BEAD] mb-1">Type</p>
                  <p className="text-sm text-white font-medium">{account.type}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A1BEAD] mb-1">Current</p>
                  <p className="text-sm text-white font-medium">{formatBankBalance(account.balance)}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A4D3C]">
              <button className="text-sm text-[#30D158] font-medium inline-flex items-center gap-1 hover:text-[#28B34B] transition-colors">
                Set up an auto transfer rule
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F2A20] border-[#1E3D2F]">
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[#A1BEAD]">Routing number</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white tracking-wider">{account.routingNumber}</span>
                  <button className="text-[#30D158] hover:text-[#28B34B] transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-[#A1BEAD]">Account number</p>
                  <Eye className="h-4 w-4 text-[#A1BEAD]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white tracking-wider">•••••••••{account.id}</span>
                  <button className="text-[#30D158] hover:text-[#28B34B] transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 pt-1">
                  <p className="text-sm text-[#A1BEAD]">Bank</p>
                  <Info className="h-4 w-4 text-[#A1BEAD]" />
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-white font-medium">{account.bankName}</span>
                    <button className="text-[#30D158] hover:text-[#28B34B] transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {account.bankAddress.map((line) => (
                    <div key={line} className="flex items-center justify-end gap-2">
                      <span className="text-sm text-[#A1BEAD]">{line}</span>
                      <button className="text-[#30D158] hover:text-[#28B34B] transition-colors">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E3D2F] flex justify-end">
              <button className="text-sm text-white font-medium inline-flex items-center gap-1 hover:text-[#30D158] transition-colors">
                Documents
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-2">
        <TransactionDatatable
          title="Transactions"
          showViewAll={false}
          transactions={accountTransactions}
          accountLabel={account.label}
        />
      </div>
    </div>
  );
}
