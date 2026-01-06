'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { setInvestingChoice } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { AI_WEALTH_MANAGEMENT_PRICE } from '@/lib/constants';

export function AIWealthRecommendation() {
  const router = useRouter();

  const handleSwitchToAIWealth = () => {
    setInvestingChoice('ai-wealth');
    router.refresh();
  };

  return (
    <div className="max-w-2xl mt-6 mx-auto">
      <Card
        className="relative overflow-hidden border-2"
        style={{ borderColor: '#edf9cd', backgroundColor: '#edf9cd' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#edf9cd]/90 via-[#edf9cd] to-[#edf9cd]/90" />
        <CardContent className="relative p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-full p-2"
                  style={{ backgroundColor: 'rgba(8, 28, 20, 0.1)' }}
                >
                  <Sparkles className="h-6 w-6" style={{ color: '#083423' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold" style={{ color: '#083423' }}>
                      AI-Powered Investing
                    </h2>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: '#083423',
                        color: '#083423',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Let AI optimize your portfolio for maximum growth with automated management and
                    personalized strategies.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: '#083423' }}
                  />
                  <span className="text-muted-foreground">
                    Automated portfolio management
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: '#083423' }}
                  />
                  <span className="text-muted-foreground">AI-powered recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: '#083423' }}
                  />
                  <span className="text-muted-foreground">
                    ${AI_WEALTH_MANAGEMENT_PRICE}/month
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                onClick={handleSwitchToAIWealth}
                size="lg"
                className="flex items-center gap-2 w-full md:w-auto"
                style={{ backgroundColor: '#083423', color: 'white' }}
              >
                Try AI Wealth
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

