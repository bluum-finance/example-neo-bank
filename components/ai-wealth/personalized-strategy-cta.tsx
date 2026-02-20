'use client';

import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PersonalizedStrategyPanel } from '@/components/ai-wealth/personalized-strategy-panel';

/**
 * PersonalizedStrategyCTA Component
 * A premium call-to-action widget inviting users to get a tailored strategy.
 */
export function PersonalizedStrategyCTA() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <section className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-[#1E3D2F] bg-linear-to-r from-black to-[#0F2A20] lg:flex-row">
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

export function PersonalizedStrategyCTA2() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <section className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#1E3D2F]/30 bg-[#07120F] p-6 shadow-sm">
        <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-8">
          {/* Text Content */}
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Icon Container */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#124031]">
                <Sparkles className="h-3.5 w-3.5 text-[#57B75C]" />
              </div>
              <h2 className="text-base font-semibold leading-tight text-[#D1D5DB]">Get a personalized investment strategy</h2>
            </div>
            <p className="max-w-[640px] text-sm leading-relaxed text-[#A1BEAD]">
              Answer a few questions about your goals, life events, and finances — and we will tailor your portfolio strategy to match.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsPanelOpen(true)}
            className="group flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#57B75C] px-4 transition-all hover:bg-[#4ca651] active:scale-95 lg:min-w-[154px]"
          >
            <span className="text-xs font-semibold text-white">Get Started</span>
            <ArrowRight className="h-3.5 w-3.5 text-white transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      <PersonalizedStrategyPanel open={isPanelOpen} onOpenChange={setIsPanelOpen} />
    </>
  );
}
