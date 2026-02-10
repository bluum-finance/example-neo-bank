'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  DashboardIcon,
  AccountsIcon,
  TransactionsIcon,
  PortfolioIcon,
  FinancialIcon,
  TreasuryIcon,
  AutoInvestIcon,
  AnalyticsIcon,
  TaxIcon,
  SettingsIcon,
} from '@/components/icons/nav-icons';

interface NavItem {
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  badgeColor?: 'green' | 'purple';
  section?: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: DashboardIcon, label: 'Home' },
  { path: '/accounts', icon: AccountsIcon, label: 'Accounts' },
  { path: '/transactions', icon: TransactionsIcon, label: 'Transactions' },
  { path: '/portfolio', icon: PortfolioIcon, label: 'Portfolio', badge: '+8.7%', badgeColor: 'green', section: 'Invest' },
  { path: '/financial-plan', icon: FinancialIcon, label: 'Financial Plan', badge: 'Active', badgeColor: 'purple' },
  { path: '/treasury', icon: TreasuryIcon, label: 'Treasury' },
  { path: '/auto-invest', icon: AutoInvestIcon, label: 'Auto-Invest' },
  { path: '/analytics', icon: AnalyticsIcon, label: 'Analytics', section: 'Tools' },
  { path: '/tax-documents', icon: TaxIcon, label: 'Tax Documents' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' },
];

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

  const isItemActive = (item: NavItem) => {
    if (item.path === '/portfolio') {
      return pathname === '/portfolio' ||
        pathname === '/trade' ||
        pathname === '/chat' ||
        pathname.startsWith('/assets/');
    }
    return pathname === item.path || pathname.startsWith(item.path + '/');
  };

  let currentSection: string | undefined;

  return (
    <aside
      className="hidden lg:flex lg:w-[248px] lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:border-r lg:bg-[#07120F]"
      style={{ borderRightColor: '#1E3D2F' }}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand Header */}
        <div className="h-[81.5px] border-b flex items-center px-5" style={{ borderBottomColor: '#1E3D2F' }}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#1A3A2C] flex items-center justify-center shadow-[0px_0px_20px_rgba(129,140,248,0.20)]">
              <Image src="/logo.svg" alt="Bluum" width={20} height={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white leading-6">Bluum</span>
              <span className="text-[11px] font-semibold text-[#57B75C] uppercase leading-4 tracking-[0.5px]">
                Invest
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);
            const showSectionHeader = item.section && item.section !== currentSection;

            if (showSectionHeader) {
              currentSection = item.section;
            }

            return (
              <div key={item.path}>
                {showSectionHeader && (
                  <div className="px-3 py-2 mt-4 mb-1">
                    <h3 className="text-[11px] font-semibold text-[#B0B8BD] uppercase tracking-[0.8px] leading-4">
                      {item.section}
                    </h3>
                  </div>
                )}
                <Link
                  href={item.path}
                  className={cn(
                    'group flex items-center gap-3 rounded-[10px] px-3 h-[43px] text-sm font-normal transition-colors relative',
                    isActive
                      ? 'bg-[#0B2219] text-[#66D07A]'
                      : 'text-[#9CA3AF] hover:bg-[#0B2219] hover:text-white'
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors shrink-0',
                        isActive ? 'text-[#66D07A]' : 'text-[#9CA3AF] group-hover:text-white'
                      )}
                    />
                  )}

                  <span className="flex-1">{item.label}</span>

                  {item.badge && (
                    <div
                      className={cn(
                        'px-2 py-1 rounded-[10px] text-[11px] font-semibold leading-4',
                        item.badgeColor === 'green'
                          ? 'bg-[rgba(74,222,128,0.15)] text-[#4ADE80]'
                          : 'bg-[rgba(129,140,248,0.15)] text-[#818CF8]'
                      )}
                    >
                      {item.badge}
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="h-[92px] border-t px-4 py-4" style={{ borderTopColor: '#1E3D2F' }}>
          <div className="flex items-center gap-3 h-[59px] rounded-[10px] px-2.5 py-2.5">
            <div className="w-[38px] h-[38px] rounded-[19px] bg-[#66D07A] flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-white leading-5">
                {user ? getInitials(user.name) : 'JD'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white leading-5 truncate">
                {user?.name || 'Jane Doe'}
              </p>
              <p className="text-xs text-[#9CA3AF] leading-[18px] truncate">
                {user?.email || 'jane@acme.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
