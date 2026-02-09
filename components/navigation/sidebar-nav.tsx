'use client';

import { useState, useEffect } from 'react';
import { Home, TrendingUp, PiggyBank, ArrowLeftRight, CreditCard, LogOut, Target, Moon, Sun, Repeat } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Image from 'next/image';

interface NavItem {
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/invest', icon: TrendingUp, label: 'Portfolio' },
  { path: '/invest/financial-plan', icon: Target, label: 'Financial Plan' },
  { path: '/invest/auto-invest', icon: Repeat, label: 'Auto-Invest' },
  { path: '/savings', icon: PiggyBank, label: 'Savings' },
  { path: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { path: '/cards', icon: CreditCard, label: 'Cards' },
];

const navHeaders: { label: string; startIndex: number; endIndex: number }[] = [
  { label: 'Invest', startIndex: 1, endIndex: 3 },
];

// Indices where spacing should be added after (end of a section)
const sectionBreaks: number[] = [3]; // After Auto-Invest (index 3)

// Dark mode hook
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage and system preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDark, toggleDarkMode, mounted };
}

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getAuth();
  const { isDark, toggleDarkMode, mounted } = useDarkMode();

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/signin');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isItemActive = (item: NavItem) => {
    return pathname === item.path;
  };

  return (
    <aside
      className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:border-r lg:bg-card"
      style={{ backgroundColor: isDark ? '#07120F' : undefined }}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 px-6 py-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="Neo Bank" width={32} height={32} />
            <span className="text-xl font-bold">Neo Bank</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            // Check if this item should have a header before it
            const headerBefore = navHeaders.find(
              header => header.startIndex === index
            );

            const isSectionBreak = sectionBreaks.includes(index);

            return (
              <div key={item.path}>
                {headerBefore && (
                  <div className="px-3 py-2 mt-4 mb-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {headerBefore.label}
                    </h3>
                  </div>
                )}
                {Icon && (
                  <Link
                    href={item.path}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )}
                {isSectionBreak && <div className="h-4" />}
              </div>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t p-4 space-y-2">
          <div className="flex items-center gap-3 mb-3 px-2">
            <Avatar>
              <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          {mounted && (
            <button
              onClick={toggleDarkMode}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <>
                  <Sun className="h-5 w-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  Dark Mode
                </>
              )}
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
