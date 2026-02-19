'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export function OnboardingLandingPage() {
  const router = useRouter();
  return (
    <div className="space-y-12 py-8">
      {/* Self-Directed Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 order-2 md:order-1">
          <div className="flex gap-1">
            <svg
              width="64"
              height="24"
              viewBox="0 0 64 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="40.5"
                y="0.5"
                width="23"
                height="23"
                rx="11.5"
                fill="#57B75C"
                fill-opacity="0.2"
                stroke="#0E231F"
              />
              <rect
                x="20.5"
                y="0.5"
                width="23"
                height="23"
                rx="11.5"
                fill="#57B75C"
                fill-opacity="0.55"
                stroke="#0E231F"
              />
              <rect
                x="0.5"
                y="0.5"
                width="23"
                height="23"
                rx="11.5"
                fill="#42A247"
                stroke="#0E231F"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-medium tracking-tight text-white leading-tight">
            Self-directed
            <br />
            investing
          </h1>
          <p className="text-lg text-[#8DA69B] max-w-md">
            Buy US stocks, Nigerian stocks, and ETFs — all from one place. No broker account
            needed.
          </p>
          <button
            onClick={() => router.push('/onboarding?choice=self-directed')}
            className="bg-primary px-8 h-11 flex justify-center items-center text-primary-foreground hover:bg-primary/90 rounded-full text-base font-medium"
          >
            Begin application <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
        <div className="relative aspect-square w-full order-1 md:order-2">
          <Image
            src="/images/onboarding-1.png"
            alt="Self-directed investing"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* AI Wealth Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-12">
        <div className="relative aspect-square w-full">
          <Image
            src="/images/onboarding-2.png"
            alt="AI wealth management"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-5xl font-medium tracking-tight text-white leading-tight">
            AI-advisory/AI-wealth
            <br />
            management
          </h1>
          <p className="text-lg text-[#8DA69B] max-w-md">
            Feel confident knowing that your capital is working for you with a personalized
            investment portfolio on Mercury Personal.
          </p>
          <button
            onClick={() => router.push('/onboarding?choice=ai-wealth')}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-full px-8 h-11 flex justify-center items-center text-base font-medium"
          >
            Begin application <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
