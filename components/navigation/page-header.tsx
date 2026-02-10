'use client';

import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, clearAuth } from '@/lib/auth';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export function PageHeader() {
  const router = useRouter();
  const { isDark, toggleDarkMode, mounted } = useDarkMode();

  const investLinks = [
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Financial Plan', path: '/financial-plan' },
    { label: 'Auto-Invest', path: '/auto-invest' },
  ];

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/signin');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const user = getAuth();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'OS'; // Default fallback
  };

  return (
    <div className="py-3 sm:py-4 border-b border-transparent flex flex-row justify-between items-center gap-3 sm:gap-4 overflow-hidden">
      {/* Search Bar */}
      <div className="flex-1 min-w-0 max-w-[448px]">
        <div className="p-2.5 sm:p-3 bg-white dark:bg-[#0E231F] rounded-lg border border-gray-200 dark:border-[#1E3D2F] flex items-center gap-2">
          <div className="flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-500 dark:text-[#A1BEAD]" />
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <input
              type="text"
              placeholder="Search for anything"
              className="w-full bg-transparent text-xs sm:text-sm font-normal text-gray-700 dark:text-[#A1BEAD] placeholder:text-gray-400 dark:placeholder:text-[#A1BEAD] outline-none"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <div className="px-1 bg-gray-100 dark:bg-[#1A3A2C] rounded-lg border border-gray-200 dark:border-[#2A4D3C] flex items-center justify-center">
              <span className="text-[10px] leading-[15px] font-normal text-gray-600 dark:text-[#A1BEAD]">⌘</span>
            </div>
            <div className="px-1 bg-gray-100 dark:bg-[#1A3A2C] rounded-lg border border-gray-200 dark:border-[#2A4D3C] flex items-center justify-center">
              <span className="text-[10px] leading-[15px] font-normal text-gray-600 dark:text-[#A1BEAD]">K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="w-8 h-8 bg-gray-100 dark:bg-[#1A3A2C] rounded-full border border-gray-200 dark:border-[#1E3D2F] flex items-center justify-center">
          <Bell className="w-3.5 h-3.5 text-gray-600 dark:text-[#A1BEAD]" />
        </div>

        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 bg-[#66D07A] rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
              <span className="text-xs font-medium leading-4 text-white text-center">
                {getUserInitials()}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            {investLinks.map((link) => (
              <DropdownMenuItem
                key={link.label}
                onClick={() => router.push(link.path)}
                className="cursor-pointer"
              >
                <span>{link.label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {/* Dark Mode Toggle - Mobile Only */}
            {mounted && (
              <>
                <div className="">
                  <DropdownMenuItem
                    onClick={toggleDarkMode}
                    className="cursor-pointer"
                  >
                    {isDark ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="" />
              </>
            )}
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive"
            >
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
