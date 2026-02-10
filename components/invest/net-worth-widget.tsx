'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { InvestmentService, type Position } from '@/services/investment.service';

interface NetWorthWidgetProps {
  accountBalance?: number;
  positions?: Position[];
  onViewDetails?: () => void;
}

export function NetWorthWidget({
  accountBalance = 0,
  positions = [],
  onViewDetails,
}: NetWorthWidgetProps) {
  const router = useRouter();

  const netWorth = useMemo(() => {
    // Calculate portfolio value from positions
    const portfolioValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    // Net worth = account balance + portfolio value
    return accountBalance + portfolioValue;
  }, [accountBalance, positions]);

  const formatNetWorth = (value: number): string => {
    if (value >= 1_000_000) {
      // Format as millions (e.g., $15.24M)
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      // Format as thousands (e.g., $15.24K)
      return `$${(value / 1_000).toFixed(2)}K`;
    } else {
      // Format as regular currency
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      // Default: navigate to accounts tab or overview
      router.push('/invest?tab=accounts');
    }
  };

  return (
    <div
      className="w-full h-full p-4 rounded-xl overflow-hidden bg-card border border-gray-200 dark:border-border"
      style={{
        borderRadius: 12,
      }}
    >
      <div className="flex flex-1 items-center gap-6">
        <div className="flex-1 flex flex-col justify-center items-start gap-1">
          <div
            className="text-xs font-normal text-gray-500 dark:text-muted-foreground"
            style={{ fontSize: 12, fontFamily: 'Inter' }}
          >
            Total Net Worth
          </div>
          <div
            className="text-2xl font-semibold text-gray-900 dark:text-foreground"
            style={{ fontSize: 24, fontFamily: 'Inter', fontWeight: 600 }}
          >
            {formatNetWorth(netWorth)}
          </div>
        </div>
        <button
          onClick={handleViewDetails}
          className="px-2 py-1 rounded-full flex items-center gap-1 transition-opacity hover:opacity-80 bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-accent"
          style={{
            borderRadius: 100,
          }}
        >
          <span
            className="text-xs font-normal leading-[18px] text-gray-700 dark:text-muted-foreground"
            style={{
              fontSize: 12,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}
          >
            View details
          </span>
          <ChevronDown className="w-[18px] h-[18px] text-gray-600 dark:text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
