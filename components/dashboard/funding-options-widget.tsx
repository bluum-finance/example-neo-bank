'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccountsIcon } from '@/components/icons/nav-icons';
import { WireTransferIcon } from '@/components/icons/wire-transfer.icon';
import { CheckDepositIcon } from '@/components/icons/check-deposit.icon';

interface FundingOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'outline';
  };
}

const fundingOptions: FundingOption[] = [
  {
    id: 'ach',
    title: 'ACH Transfer',
    description: 'Arrives within 1–3 business days.\nLimits may apply.',
    icon: <AccountsIcon className="w-6 h-6" />,
    badge: {
      label: 'Most common',
      variant: 'default',
    },
  },
  {
    id: 'wire',
    title: 'Wire Transfer',
    description: 'Arrives within 1 business day.\nBest for large transfers.',
    icon: <WireTransferIcon className="w-5 h-5" />,
    badge: {
      label: 'Fastest',
      variant: 'default',
    },
  },
  {
    id: 'check',
    title: 'Check Deposit',
    description: 'Arrives within 1–7 business days.\nMust be issued by US bank.',
    icon: <CheckDepositIcon className="w-5 h-5" />,
  },
];

export function FundingOptionsWidget() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex flex-col gap-0">
          <h2 className="text-2xl font-semibold leading-8 text-foreground">
            How do you want to fund your account?
          </h2>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-0">
          <p className="text-sm font-normal leading-5 text-muted-foreground">
            To start using Bluum, you need to deposit funds first.
          </p>
        </div>

        {/* Funding Options */}
        <div className="pt-4 flex flex-wrap gap-6">
          {fundingOptions.map((option) => (
            <div
              key={option.id}
              className="flex-1 min-w-[200px] p-[17px] bg-[#0E231F] dark:bg-[#0E231F] rounded-lg border border-[#1E3D2F] flex flex-col gap-2"
            >
              {/* Icon and Badge Row */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col justify-start items-start">
                  <div className="w-6 h-6 flex justify-center items-center text-muted-foreground">
                    {option.icon}
                  </div>
                </div>
                {option.badge && (
                  <Badge
                    className="px-2 py-0.5 bg-[#124031] text-[#30D158] rounded-full text-xs font-medium leading-4"
                  >
                    {option.badge.label}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col gap-0">
                <h3 className="text-base font-medium leading-6 text-foreground">
                  {option.title}
                </h3>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-0">
                <p className="text-xs font-normal leading-4 text-muted-foreground whitespace-pre-line">
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
