'use client';

import { Search, Bell } from 'lucide-react';
import { getAuth } from '@/lib/auth';

export function PageHeader() {
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
    <div className="container mx-auto px-4 lg:px-8 max-w-8xl">
      <div className="py-4 border-b border-transparent flex flex-col md:flex-row justify-between items-center gap-4 md:gap-[466.64px]">
        {/* Search Bar */}
        <div className="w-full md:w-[448px] max-w-[448px]">
          <div className="p-3 bg-white dark:bg-[#0E231F] rounded-lg border border-gray-200 dark:border-[#1E3D2F] flex items-center gap-2">
            <div className="flex items-center justify-center">
              <Search className="w-[18px] h-[18px] text-gray-500 dark:text-[#A1BEAD]" />
            </div>
            <div className="flex-1 overflow-hidden">
              <input
                type="text"
                placeholder="Search for anything"
                className="w-full bg-transparent text-sm font-normal text-gray-700 dark:text-[#A1BEAD] placeholder:text-gray-400 dark:placeholder:text-[#A1BEAD] outline-none"
              />
            </div>
            <div className="flex items-center gap-1">
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
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="w-8 h-8 bg-gray-100 dark:bg-[#1A3A2C] rounded-full border border-gray-200 dark:border-[#1E3D2F] flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-gray-600 dark:text-[#A1BEAD]" />
          </div>
          {/* User Avatar */}
          <div className="w-8 h-8 bg-[#66D07A] rounded-full flex items-center justify-center">
            <span className="text-xs font-medium leading-4 text-white text-center">
              {getUserInitials()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
