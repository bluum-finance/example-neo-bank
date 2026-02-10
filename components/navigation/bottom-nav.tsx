'use client';

import { Home, TrendingUp, PiggyBank, ArrowLeftRight, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/invest', icon: TrendingUp, label: 'Invest' },
  { path: '/savings', icon: PiggyBank, label: 'Savings' },
  { path: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { path: '/cards', icon: CreditCard, label: 'Cards' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card dark:bg-[#0F2A20] lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          const baseLinkClasses =
            'flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors duration-150';
          const activeClasses =
            'text-primary dark:text-primary-foreground bg-primary/10 dark:bg-primary/20';
          const inactiveClasses =
            'text-muted-foreground hover:text-foreground dark:hover:text-[#F2F6F4] hover:bg-muted/5 dark:hover:bg-muted/10';

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(baseLinkClasses, isActive ? activeClasses : inactiveClasses)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
