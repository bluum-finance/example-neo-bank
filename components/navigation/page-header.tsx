'use client';

import { Search, ChevronDown, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore, useUser } from '@/store/user.store';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EyeOffIcon } from '../icons/eyeoff.icon';

export function PageHeader() {
  const router = useRouter();
  const user = useUser();
  const logout = useUserStore((state) => state.logout);

  const investLinks = [
    { label: 'Portfolio', path: '/invest' },
    { label: 'Auto-Invest', path: '/auto-invest' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/signin');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
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
      {/* Search Bar (Left) */}
      <div className="min-w-0 w-full max-w-[440px]">
        <div className="px-4 h-11 bg-white dark:bg-[#0E231F] rounded-full border border-gray-200 dark:border-[#1E3D2F] flex items-center gap-2">
          <div className="flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-[#A1BEAD]" />
          </div>

          <div className="flex-1 overflow-hidden">
            <input
              type="text"
              placeholder="Search for anything"
              className="w-full bg-transparent text-[14px] font-light text-[#A1BEAD] placeholder:text-[#A1BEAD] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="px-1 bg-[#1A3A2C] rounded-lg border border-[#2A4D3C] flex items-center justify-center">
              <span className="text-[10px] leading-[15px] font-normal text-[#A1BEAD]">⌘</span>
            </div>
            <div className="px-1 bg-[#1A3A2C] rounded-lg border border-[#2A4D3C] flex items-center justify-center">
              <span className="text-[10px] leading-[15px] font-normal text-[#A1BEAD]">K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Move Money Dropdown */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-1.5 bg-[#1A3A2C] border border-[#2A4D3C] rounded-full flex items-center  gap-2 hover:opacity-90 transition-opacity">
                <span className="text-sm leading-5 text-white">Move money</span>
                <ChevronDown className="w-3.5 h-5 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <span>Transfer</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>Pay Bills</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>Send Money</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Visibility Toggle */}
        <button className="p-2 rounded-full hover:bg-muted transition-colors">
          <EyeOffIcon className="w-6 h-6 text-[#A1BEAD]" />
        </button>

        {/* Notification Bell */}
        <button className="w-9 h-9 bg-[#1A3A2C] border border-[#2A4D3C] rounded-full flex items-center justify-center hover:bg-accent transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
              <span className="text-xs font-semibold text-primary-foreground">{getUserInitials()}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Invest</div>
            {investLinks.map((link) => (
              <DropdownMenuItem key={link.label} onClick={() => router.push(link.path)} className="cursor-pointer py-2">
                <span>{link.label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2">
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 text-destructive focus:text-destructive">
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
