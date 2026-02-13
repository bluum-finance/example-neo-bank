'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  AccountsIcon,
  CardIcon,
  DashboardIcon,
  TransactionsIcon,
} from '@/components/icons/nav-icons';

export function SidebarNav() {
  const pathname = usePathname();
  const user = getAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const mainNavItems = [
    {
      label: 'Home',
      href: '/dashboard',
      Icon: DashboardIcon,
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Transactions',
      href: '/transactions',
      Icon: TransactionsIcon,
      isActive: pathname === '/transactions',
    },
    {
      label: 'Cards',
      href: '/cards',
      Icon: CardIcon,
      isActive: pathname === '/cards',
    },
  ];

  const accounts = [
    {
      id: '3168',
      label: 'Checking ••3168',
      balance: '$0.00',
    },
    {
      id: '2651',
      label: 'Savings ••2651',
      balance: '$0.00',
    },
  ];

  const isInvestActive = pathname === '/invest';

  return (
    <aside className="hidden lg:flex lg:w-[248px] lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:border-r lg:bg-[#07120F] lg:border-[#1E3D2F]">
      <div className="flex flex-col h-full w-full">
        {/* User Header */}
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1A3A2C] flex items-center justify-center pt-[5.5px] pb-[6.5px]">
              <span className="text-sm font-normal text-white leading-5">
                {user ? getInitials(user.name) : 'T'}
              </span>
            </div>
            <span className="text-sm font-normal text-white leading-5">
              {user?.name ? `${user.name.split(' ')[0]}'s Account` : 'Your Account'}
            </span>
          </div>

          <div className="flex flex-col items-start justify-center min-w-[18px]">
            <ChevronUp className="w-3 h-3  text-[#A1BEAD] mb-[-2px]" />
            <ChevronDown className="w-3 h-3 text-[#A1BEAD] mt-[-2px]" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-hidden px-3 pt-4 pb-[400px]">
          <div className="w-[224px] flex flex-col gap-2">
            {/* Main Navigation Items */}
            <div className="flex flex-col gap-0.5">
              {mainNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-[10px] p-3 text-sm font-medium leading-[21px] transition-colors',
                    item.isActive
                      ? 'bg-[#0B2219] text-[#30D158]'
                      : 'text-[#8DA69B] hover:bg-[#0B2219] hover:text-white',
                  )}
                >
                  <item.Icon
                    className={cn(
                      'w-5 h-5 shrink-0',
                      item.label === 'Home' && 'opacity-70',
                      item.isActive ? 'text-[#30D158]' : 'text-[#8DA69B]',
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Accounts Section */}
            <div className="flex flex-col gap-2 pt-8 pb-8">
              <div className="flex items-center gap-2 px-3.5">
                <AccountsIcon className="w-5 h-5 shrink-0" />
                <span className="text-[11px] font-normal text-[#D1D5DB] uppercase leading-4 tracking-[0.8px]">
                  Accounts
                </span>
              </div>

              <div className="px-3.5 py-1.5 rounded-md">
                <Link
                  href="/invest"
                  className={cn(
                    'text-sm font-normal text-[#8DA69B] leading-5 hover:text-white transition-colors',
                    isInvestActive ? 'text-[#30D158]' : 'text-[#8DA69B]',
                  )}
                >
                  Invest
                </Link>
              </div>

              {accounts.map((account) => {
                const isActive = pathname === `/accounts/${account.id}`;
                return (
                  <Link
                    key={account.id}
                    href={`/accounts/${account.id}`}
                    className={cn(
                      'px-3.5 py-1.5 rounded-md transition-colors hover:bg-[#0B2219]',
                      isActive ? 'bg-[#0B2219]' : '',
                    )}
                  >
                    <div
                      className={cn(
                        'text-sm font-normal leading-5',
                        isActive ? 'text-[#30D158]' : 'text-[#8DA69B]',
                      )}
                    >
                      {account.label}
                    </div>
                    <div
                      className={cn(
                        'text-xs font-light leading-4 mt-0.5',
                        isActive ? 'text-[#30D158]' : 'text-[#8DA69B]',
                      )}
                    >
                      {account.balance}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-[#1E3D2F] p-4">
          <div className="relative w-[216px] h-[59px] rounded-[10px]">
            <div className="absolute left-2.5 top-2.5 w-[38px] h-[38px] rounded-[19px] bg-[#66D07A] flex items-center justify-center">
              <span className="text-sm font-semibold text-white leading-5">
                {user ? getInitials(user.name) : 'JD'}
              </span>
            </div>
            <div className="absolute left-[60px] top-2.5">
              <p className="text-sm font-medium text-white leading-5">
                {user?.name || 'Jane Doe'}
              </p>
            </div>
            <div className="absolute left-[60px] top-[31px]">
              <p className="text-xs font-normal text-[#8DA69B] leading-[18px]">
                {user?.email || 'jane@acme.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
