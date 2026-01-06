'use client';

import { TrendingUp, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { InvestOnboarding } from './onboarding';
import { AIWealthRecommendation } from './ai-wealth-recommendation';

interface SelfDirectedLandingProps {
  onStartOnboarding: () => void;
  showOnboarding?: boolean;
  onAccountCreated?: (accountId?: string) => void;
}

export function SelfDirectedLanding({
  onStartOnboarding,
  showOnboarding = false,
  onAccountCreated,
}: SelfDirectedLandingProps) {
  if (showOnboarding && onAccountCreated) {
    return <InvestOnboarding onAccept={onAccountCreated} />;
  }

  return (
    <div className="space-y-6">
      {/* Main Landing Card */}
      <div className="flex min-h-[60vh] items-center justify-center">
        <div>
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <TrendingUp className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Start Investing</CardTitle>
                <CardDescription className="text-base mt-2">
                  Invest in U.S. and Nigerian stocks and grow your wealth. <br /> Powered by
                  Bluum Finance
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your investments are protected
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Diversified</h3>
                  <p className="text-sm text-muted-foreground">Access to U.S. stock market</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Easy</h3>
                  <p className="text-sm text-muted-foreground">Start with as little as $20</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={onStartOnboarding}
                  size="lg"
                  className="w-full flex items-center gap-2"
                >
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Investing Invitation Card */}
        </div>
      </div>

      {/* AI Wealth Recommendation Card */}
      <AIWealthRecommendation />
    </div>
  );
}
