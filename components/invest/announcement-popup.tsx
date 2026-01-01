'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Sparkles, ArrowRight, DollarSign, BarChart3, PiggyBank, ArrowUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAuth } from '@/lib/auth';

interface InvestingAnnouncementPopupProps {
  onGetStarted: () => void;
}

const DISMISS_KEY = 'investing_announcement_dismissed';
const DEMO_EMAIL = 'demo@neobank.com';

export function InvestingAnnouncementPopup({ onGetStarted }: InvestingAnnouncementPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const user = getAuth();
    const isDemoUser = user?.email === DEMO_EMAIL;
    
    // Always show for demo user, otherwise check sessionStorage
    if (isDemoUser) {
      setOpen(true);
    } else {
      // Check if popup was dismissed in this session
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (!dismissed) {
        setOpen(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    const user = getAuth();
    const isDemoUser = user?.email === DEMO_EMAIL;
    
    // Don't save dismissal for demo user - always show for them
    if (!isDemoUser) {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    }
    setOpen(false);
  };

  const handleGetStarted = () => {
    const user = getAuth();
    const isDemoUser = user?.email === DEMO_EMAIL;
    
    // Don't save dismissal for demo user - always show for them
    if (!isDemoUser) {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    }
    setOpen(false);
    onGetStarted();
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={setOpen} 
      className="max-w-5xl"
      cardClassName="!p-0 bg-[#edf9cd] border-0 shadow-none"
    >
      <DialogContent className="p-0 max-h-[90vh] overflow-y-auto">
        <div className="relative overflow-hidden w-full h-full" style={{ backgroundColor: '#edf9cd' }}>
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#edf9cd]/90 via-[#edf9cd] to-[#edf9cd]/90" />
          
          <div className="relative p-8">
            <DialogHeader className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="rounded-full p-4 animate-pulse" style={{ backgroundColor: 'rgba(8, 28, 20, 0.1)' }}>
                    <TrendingUp className="h-12 w-12" style={{ color: '#081c14' }} />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-6 w-6 fill-[#081c14]" style={{ color: '#081c14' }} />
                  </div>
                </div>
              </div>
              
              <DialogTitle className="text-3xl font-bold" style={{ color: '#081c14' }}>
                Start Investing Today!
              </DialogTitle>
              
              <DialogDescription className="text-base">
                We're excited to launch our new investing feature. Grow your wealth with 
                access to U.S. and Nigerian stocks, all in one place.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: '#081c14' }}>$20</div>
                  <div className="text-xs text-muted-foreground">Minimum Start</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: '#081c14' }}>0%</div>
                  <div className="text-xs text-muted-foreground">Commission</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold" style={{ color: '#081c14' }}>24/7</div>
                  <div className="text-xs text-muted-foreground">Trading</div>
                </div>
              </div>

              {/* Marketing Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* US Stocks */}
                <Card style={{ backgroundColor: 'white', borderColor: '#081c14' }}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" style={{ color: '#081c14' }} />
                      <h3 className="font-semibold text-sm">US Stocks</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">AAPL</span>
                        <span className="text-xs text-green-600">+2.1%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">NVDA</span>
                        <span className="text-xs text-green-600">+3.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">MSFT</span>
                        <span className="text-xs text-green-600">+1.8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* NG Stocks */}
                <Card style={{ backgroundColor: 'white', borderColor: '#081c14' }}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" style={{ color: '#081c14' }} />
                      <h3 className="font-semibold text-sm">Nigerian Stocks</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">DANGOTE</span>
                        <span className="text-xs text-green-600">+1.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">MTN</span>
                        <span className="text-xs text-green-600">+2.3%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">GTB</span>
                        <span className="text-xs text-green-600">+0.9%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fixed Income */}
                <Card style={{ backgroundColor: 'white', borderColor: '#081c14' }}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" style={{ color: '#081c14' }} />
                      <h3 className="font-semibold text-sm">Fixed Income</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Bonds</span>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: '#081c14', color: '#081c14' }}>
                          Stable
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Treasury Bills</span>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: '#081c14', color: '#081c14' }}>
                          Low Risk
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personalized Insights */}
                <Card style={{ backgroundColor: 'white', borderColor: '#081c14' }}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" style={{ color: '#081c14' }} />
                      <h3 className="font-semibold text-sm">AI Insights</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get personalized recommendations based on your goals and risk profile
                    </p>
                    <Badge variant="outline" className="text-xs w-full justify-center" style={{ borderColor: '#081c14', color: '#081c14' }}>
                      AI-Powered
                    </Badge>
                  </CardContent>
                </Card>

                {/* Funds Deposit/Withdrawal */}
                <Card style={{ backgroundColor: 'white', borderColor: '#081c14' }}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-5 w-5" style={{ color: '#081c14' }} />
                      <h3 className="font-semibold text-sm">Easy Funding</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Deposit</span>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: '#081c14', color: '#081c14' }}>
                          Instant
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Withdrawal</span>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: '#081c14', color: '#081c14' }}>
                          1-2 Days
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Portfolio Growth */}
                <Card style={{ backgroundColor: 'white', borderColor: '#081c14' }}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5" style={{ color: '#081c14' }} />
                      <h3 className="font-semibold text-sm">Portfolio Growth</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold" style={{ color: '#081c14' }}>+18.5%</div>
                      <p className="text-xs text-muted-foreground">Average annual return</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleGetStarted}
                  className="flex-1 flex items-center justify-center gap-2"
                  size="lg"
                  style={{ backgroundColor: '#081c14', color: 'white' }}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: '#081c14', color: '#081c14' }}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

