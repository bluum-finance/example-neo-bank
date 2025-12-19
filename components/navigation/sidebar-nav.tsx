'use client';

import { Home, TrendingUp, PiggyBank, ArrowLeftRight, CreditCard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/invest', icon: TrendingUp, label: 'Invest' },
  { path: '/savings', icon: PiggyBank, label: 'Savings' },
  { path: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { path: '/cards', icon: CreditCard, label: 'Cards' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getAuth();

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

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 md:border-r md:bg-card">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 px-6 py-6 border-b">
          <div className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <rect width="40" height="40" rx="8" fill="currentColor" opacity="0.1" />
              <path
                d="M20 10L12 14V16H28V14L20 10ZM12 18V28H28V18H12ZM14 20H26V26H14V20Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xl font-bold">Neo Bank</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
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
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            <Avatar>
              <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>
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
