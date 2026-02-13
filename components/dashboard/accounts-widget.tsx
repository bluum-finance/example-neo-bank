'use client';

import { Plus, MoreVertical, CreditCard, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/card';

const accounts = [
  {
    id: 'checking',
    label: 'Checking',
    mask: '••3168',
    balance: '$0.00',
    icon: CreditCard,
  },
  {
    id: 'savings',
    label: 'Savings',
    mask: '••2651',
    balance: '$0.00',
    icon: PiggyBank,
  },
];

export function AccountsWidget() {
  return (
    <Card className="p-6 bg-[#0F2A20] rounded-lg border border-[#1E3D2F]">
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-base font-medium text-white">Accounts</h3>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center px-2 py-1 bg-[#1A3A2C] rounded-full">
              <Plus className="w-3.5 h-3.5 text-[#8DA69B]" />
            </button>
            <button className="inline-flex items-center justify-center p-1 rounded-md">
              <MoreVertical className="w-4 h-4 text-[#8DA69B]" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {accounts.map((account) => {
            const Icon = account.icon;
            return (
              <div key={account.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#124031] rounded-full border border-[#1A3A2C] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#30D158]" />
                  </div>
                  <div className="text-white text-sm font-light">
                    {account.label} {account.mask}
                  </div>
                </div>
                <div className="text-white text-sm font-normal">{account.balance}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <div className="text-sm font-semibold text-white">Accounts for all your needs</div>
          <p className="text-xs text-[#8DA69B]">
            Create dedicated accounts for bills, long-term savings, personal budgets, and more.
          </p>
          <div className="mt-2">
            <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-[#1E3D2F]">
              <Plus className="w-3.5 h-3.5 text-white" />
              <span className="text-sm font-medium text-white">Create account</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
