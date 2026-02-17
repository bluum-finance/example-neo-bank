'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InvestOnboarding } from '@/components/invest/onboarding';
import { setExternalAccountId } from '@/lib/auth';

export default function OnboardingPage() {
  const router = useRouter();

  const handleAccountCreated = (accountId?: string) => {
    if (!accountId) {
      toast.error('Failed to create account. Please try again.');
      return;
    }

    // Set the external account ID in auth
    setExternalAccountId(accountId);
    toast.success('Account created successfully!');
    router.push('/invest');
  };

  return (
    <div className="container mx-auto py-8">
      <InvestOnboarding onAccept={handleAccountCreated} />
    </div>
  );
}
