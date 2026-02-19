'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { InvestOnboarding } from '@/components/invest/onboarding';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { InvestmentChoice, useUserStore } from '@/store/user.store';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setExternalAccountId, updateUser } = useUserStore();
  const searchParams = useSearchParams();
  const choice = searchParams.get('choice');
  const investmentChoice: InvestmentChoice = choice === 'ai-wealth' ? 'AI-WEALTH' : 'SELF-DIRECTED';

  const handleAccountCreated = (accountId?: string) => {
    if (!accountId) {
      toast.error('Failed to create account. Please try again.');
      return;
    }

    if (!user) {
      toast.error('User session not found. Please sign in again.');
      router.push('/signin');
      return;
    }

    // Set the external account ID and investment choice in auth
    setExternalAccountId(accountId);
    updateUser({
      investmentChoice,
    });

    toast.success('Account created successfully!');
    router.push('/invest');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Custom Header for Onboarding */}
      <header className="py-5 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="w-full h-9 block">
          <Image src="/bluum-logo.svg" alt="Bluum Logo" width={100} height={100} className="h-full w-auto object-contain" />
        </Link>

        <div className="w-full flex justify-end items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#D1D5DB]">Tosin's Account</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>

          <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="23.25" stroke="#2A4D3C" stroke-width="1.5" />
            <path
              d="M22.9875 35.2438C20.1937 34.9812 17.8641 33.8234 15.9984 31.7703C14.1328 29.7172 13.2 27.2937 13.2 24.5C13.2 21.7062 14.1328 19.2828 15.9984 17.2297C17.8641 15.1766 20.1937 14.0188 22.9875 13.7562V16.4563C20.9438 16.7187 19.2516 17.6141 17.9109 19.1422C16.5703 20.6703 15.9 22.4563 15.9 24.5C15.9 26.5437 16.5703 28.3297 17.9109 29.8578C19.2516 31.3859 20.9438 32.2812 22.9875 32.5437V35.2438ZM25.0125 35.2438V32.5437C26.8688 32.3187 28.4484 31.5547 29.7516 30.2516C31.0547 28.9484 31.8187 27.3687 32.0437 25.5125H34.7438C34.5 28.1187 33.4687 30.3312 31.65 32.15C29.8313 33.9687 27.6188 35 25.0125 35.2438ZM32.0437 23.4875C31.8187 21.6312 31.0547 20.0516 29.7516 18.7484C28.4484 17.4453 26.8688 16.6813 25.0125 16.4563V13.7562C27.6188 14 29.8313 15.0313 31.65 16.85C33.4687 18.6687 34.5 20.8812 34.7438 23.4875H32.0437Z"
              fill="#30D158"
            />
          </svg>
        </div>
      </header>

      <div className="container mx-auto py-8">
        <InvestOnboarding onAccept={handleAccountCreated} investmentChoice={investmentChoice} />
      </div>
    </div>
  );
}
