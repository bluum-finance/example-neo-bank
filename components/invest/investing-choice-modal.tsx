'use client';

import { useState } from 'react';
import { TrendingUp, Sparkles, Check, ArrowRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AI_WEALTH_MANAGEMENT_PRICE, AI_WEALTH_MANAGEMENT_FEATURES } from '@/lib/constants';
import { setInvestingChoice } from '@/lib/auth';
import Image from 'next/image';

export type InvestingChoice = 'self-directed' | 'ai-wealth';

interface InvestingChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (choice: InvestingChoice) => void;
}

export function InvestingChoiceModal({
  open,
  onOpenChange,
  onSelect,
}: InvestingChoiceModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<InvestingChoice | null>(null);

  const handleSelect = (choice: InvestingChoice) => {
    setSelectedChoice(choice);
    setInvestingChoice(choice);
    onSelect(choice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-4xl">
      <DialogContent className="p-0">
        <div className="p-8">
          <DialogHeader className="text-center space-y-2 mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="rounded-full p-3"
                style={{ backgroundColor: 'rgba(8, 28, 20, 0.1)' }}
              >
                <TrendingUp className="h-8 w-8" style={{ color: '#083423' }} />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold" style={{ color: '#083423' }}>
              Choose Your Investing Style
            </DialogTitle>
            <DialogDescription className="text-base">
              Select the option that best fits your investment goals
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Self-Directed Option */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedChoice === 'self-directed' ? 'border-2 shadow-lg' : 'border-2'
              }`}
              style={{
                borderColor:
                  selectedChoice === 'self-directed' ? '#083423' : 'rgba(8, 52, 35, 0.1)',
              }}
              onClick={() => handleSelect('self-directed')}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full p-2"
                      style={{ backgroundColor: 'rgba(8, 28, 20, 0.1)' }}
                    >
                      <TrendingUp className="h-6 w-6" style={{ color: '#083423' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Self-Directed</h3>
                      <p className="text-sm text-muted-foreground">Full Control</p>
                    </div>
                  </div>
                  {selectedChoice === 'self-directed' && (
                    <div className="rounded-full p-1" style={{ backgroundColor: '#083423' }}>
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" style={{ color: '#083423' }} />
                    <span className="text-sm">Full control over your investments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" style={{ color: '#083423' }} />
                    <span className="text-sm">No subscription fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" style={{ color: '#083423' }} />
                    <span className="text-sm">Access to all trading features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" style={{ color: '#083423' }} />
                    <span className="text-sm">Buy and sell stocks anytime</span>
                  </div>

                  {/* Unavailable features */}
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" style={{ color: '#dc2626' }} />
                    <span className="text-sm">AI-powered investment recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" style={{ color: '#dc2626' }} />
                    <span className="text-sm">Automated portfolio management and more</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-3xl font-bold mb-1" style={{ color: '#083423' }}>
                    Free
                  </div>
                  <div className="text-sm text-muted-foreground">No monthly fees</div>
                </div>

                <Button
                  className="w-full"
                  variant={selectedChoice === 'self-directed' ? 'default' : 'outline'}
                  style={
                    selectedChoice === 'self-directed'
                      ? { backgroundColor: '#083423', color: 'white' }
                      : { borderColor: '#083423', color: '#083423' }
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect('self-directed');
                  }}
                >
                  Choose Self-Directed
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* AI Wealth Management Option */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedChoice === 'ai-wealth' ? 'border-2 shadow-lg' : 'border-2'
              }`}
              style={{
                borderColor:
                  selectedChoice === 'ai-wealth' ? '#083423' : 'rgba(8, 28, 20, 0.2)',
                backgroundColor: '#edf9cd',
              }}
              onClick={() => handleSelect('ai-wealth')}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full p-2"
                      style={{ backgroundColor: 'rgba(8, 28, 20, 0.1)' }}
                    >
                      <Sparkles className="h-6 w-6" style={{ color: '#083423' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#083423' }}>
                        AI Wealth Management
                      </h3>
                      <p className="text-sm text-muted-foreground">Automated & Smart</p>
                    </div>
                  </div>
                  {selectedChoice === 'ai-wealth' && (
                    <div className="rounded-full p-1" style={{ backgroundColor: '#083423' }}>
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {AI_WEALTH_MANAGEMENT_FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4" style={{ color: '#083423' }} />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold" style={{ color: '#083423' }}>
                      ${AI_WEALTH_MANAGEMENT_PRICE}
                    </div>
                    <div className="text-sm text-muted-foreground">/month</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Cancel anytime</div>
                </div>

                <Button
                  className="w-full"
                  variant={selectedChoice === 'ai-wealth' ? 'default' : 'outline'}
                  style={
                    selectedChoice === 'ai-wealth'
                      ? { backgroundColor: '#083423', color: 'white' }
                      : { borderColor: '#083423', color: '#083423' }
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect('ai-wealth');
                  }}
                >
                  Choose AI Wealth
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              You can change your preference later in settings
            </p>

            <div className="flex gap-2 items-center justify-center pt-3">
              <span className='text-sm text-muted-foreground'>Powered by</span>{' '}
              <a
                href="https://bluumfinance.com"
                target="_blank"
              >
               <Image src="/bluum-logo.svg" alt="Bluum Finance" width={75} height={75} />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
