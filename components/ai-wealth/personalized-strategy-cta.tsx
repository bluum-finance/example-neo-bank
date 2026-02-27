'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { PersonalizedStrategyPanel } from '@/components/ai-wealth/personalized-strategy-panel';

/**
 * PersonalizedStrategyCTA Component
 * A premium call-to-action widget inviting users to get a tailored strategy.
 */
export function PersonalizedStrategyCTA() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <section className="lg:py-4 xl:py-0 relative flex w-full flex-col overflow-hidden rounded-2xl border border-[#1E3D2F] bg-linear-to-r from-black to-[#0F2A20] lg:flex-row">
        {/* Background Gradient */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(to right, #07120F, #102418)',
          }}
        />
        {/* Left Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-8 py-8 lg:py-0">
          <h2 className="mb-4 max-w-md text-xl lg:text-xl font-normal leading-tight text-white">Get a personalized investment strategy</h2>
          <p className="mb-6 max-w-lg text-sm leading-relaxed text-[#8DA69B]">
            Answer a few questions about your goals, life events, and finances — and we will tailor your portfolio strategy to match.
          </p>

          <button
            onClick={() => setIsPanelOpen(true)}
            className="group flex w-fit items-center gap-2 rounded-full bg-[#57B75C] px-8 h-11 text-sm font-semibold text-white transition-all hover:bg-[#4ca651] active:scale-95"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Right Visual Section */}
        <div className="relative max-h-52.5 overflow-hidden z-10 flex-1 w-full flex items-center justify-center">
          <img src="/images/cta-personalize-ui.svg" alt="Personalized Strategy CTA" className="h-full w-full object-contain scale-120" />
        </div>
      </section>

      {/* Side Panel Wizard */}
      <PersonalizedStrategyPanel open={isPanelOpen} onOpenChange={setIsPanelOpen} />
    </>
  );
}
