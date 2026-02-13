'use client';

import { ChevronLeft, ChevronRight, InfoIcon, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function MoneyMovementWidget() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-start gap-2 mb-4">
        <div className="text-base font-semibold text-white" style={{ lineHeight: '24px' }}>
          Money movement
        </div>

        <div className="flex items-center gap-1 text-sm text-[#8DA69B]">
          <button
            aria-label="Previous month"
            className="rounded-full p-1 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-4" />
          </button>
          <div className="inline-flex items-center">
            <span className="text-sm text-[#8DA69B]">Feb 2026</span>
          </div>
          <button
            aria-label="Next month"
            className="rounded-full p-1 hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-3.5 h-4" />
          </button>
        </div>
      </div>

      {/* Money In/Out cards */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1 p-5 bg-[#0F2A20] border border-[#1E3D2F] rounded-lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium text-muted-foreground">Money in</div>
              <div className="text-xl font-medium text-primary">$0.00</div>
            </div>

            <div className="w-full max-w-[426px] pt-4 border-t border-[#1E3D2F] flex items-center justify-between">
              <div className="flex flex-col">
                <div className="text-sm font-normal text-white mb-1">
                  No incoming transfers
                </div>
                <div className="text-xs text-muted-foreground font-light">
                  Add funds to get started
                </div>
              </div>

              <button className="w-8 h-8 p-1 bg-[#1A3A2C] rounded-full flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[#8DA69B]" />
              </button>
            </div>
          </div>
        </Card>

        <Card className="flex-1 p-5 bg-[#0F2A20] border border-[#1E3D2F] rounded-lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">Money out</div>
                <div className="">
                  <InfoIcon className="w-3.5 h-3.5 text-[#8DA69B]" />
                </div>
              </div>
              <div className="text-xl font-medium text-white">$0.00</div>
            </div>

            <div className="w-full max-w-[426px] pt-4 border-t border-[#1E3D2F] flex items-center justify-between">
              <div className="flex flex-col">
                <div className="text-sm font-normal text-white mb-1">
                  No outgoing transfers
                </div>
                <div className="text-xs text-muted-foreground font-light">
                  Fund your account to make payments
                </div>
              </div>

              <button className="w-8 h-8 p-1 bg-[#1A3A2C] rounded-full flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[#8DA69B]" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
