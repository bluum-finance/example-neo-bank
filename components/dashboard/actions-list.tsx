'use client';

import React from 'react';
import { Send, ArrowLeftRight, Plus, ArrowDownLeft, FileUp, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const actions: ActionItem[] = [
  { label: 'Send', icon: <Send className="w-3.5 h-3.5" /> },
  { label: 'Transfer', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
  { label: 'Deposit', icon: <Plus className="w-3.5 h-3.5" /> },
  { label: 'Request', icon: <ArrowDownLeft className="w-3.5 h-3.5" /> },
  { label: 'Upload bill', icon: <FileUp className="w-3.5 h-3.5" /> },
];

export function ActionsList() {
  return (
    <div className="w-full flex justify-between items-center py-2">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={cn(
              "px-4 py-1.5 bg-[#1A3A2C] hover:bg-[#1A3A2C]/80 transition-colors",
              "rounded-full inline-flex items-center gap-2",
              "text-white text-sm font-normal whitespace-nowrap"
            )}
          >
            <span className="flex items-center justify-center w-3.5 h-5">
              {action.icon}
            </span>
            {action.label}
          </button>
        ))}
      </div>
      
      <button className="flex items-center gap-1 text-[#A1BEAD] hover:text-[#A1BEAD]/80 transition-colors group">
        <MoreVertical className="w-3.5 h-5" />
        <span className="text-sm font-medium">Customize</span>
      </button>
    </div>
  );
}
