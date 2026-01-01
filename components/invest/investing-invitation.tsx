'use client';

import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InvestingInvitationProps {
  onClick: () => void;
}

export function InvestingInvitation({ onClick }: InvestingInvitationProps) {
  return (
    <Card className="relative overflow-hidden border-2" style={{ borderColor: '#edf9cd', backgroundColor: '#edf9cd' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#edf9cd]/90 via-[#edf9cd] to-[#edf9cd]/90" />
      <CardContent className="relative p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2" style={{ backgroundColor: 'rgba(8, 28, 20, 0.1)' }}>
                <TrendingUp className="h-6 w-6" style={{ color: '#081c14' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#081c14' }}>Start Investing</h2>
                <p className="text-muted-foreground">
                  Grow your wealth with stocks. Choose self-directed or AI-powered investing.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#081c14' }} />
                <span className="text-muted-foreground">No commission fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#081c14' }} />
                <span className="text-muted-foreground">Start with $20</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#081c14' }} />
                <span className="text-muted-foreground">U.S. & Nigerian stocks</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={onClick}
              size="lg"
              className="flex items-center gap-2 w-full md:w-auto"
              style={{ backgroundColor: '#081c14', color: 'white' }}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

