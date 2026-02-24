'use client';

import React from 'react';
import { CheckCheck } from 'lucide-react';

/** Thin progress bar showing wizard progress */
export function StepProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#30D158] shadow-[0_0_10px_rgba(48,209,88,0.5)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** User chat bubble (right-aligned) */
export function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-tl-2xl rounded-br-2xl rounded-bl-2xl bg-[#124031] px-4 py-3">
        <p className="text-[14px] font-normal leading-[22.75px] text-white">{text}</p>
      </div>
    </div>
  );
}

/** System / confirmation pill */
export function SystemPill({ text }: { text: string }) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2 rounded-full bg-[#124031] px-3 py-1.5 outline-1 outline-[#124031]">
        <span className="text-[12px] font-normal leading-4 text-white">{text}</span>
        <CheckCheck size={12} className="text-white" />
      </div>
    </div>
  );
}

/** Assistant chat bubble (left-aligned with avatar) */
export function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      {/* Bluum avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#07120F] outline-1 outline-[#1E3D2F]">
        <span className="text-[14px] font-bold leading-5 text-[#8DA69B]">b</span>
      </div>

      {/* Bubble */}
      <div className="max-w-[80%] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl bg-[#07120F] px-4 py-4 outline-1 outline-[#1E3D2F] shadow-sm">
        <p className="text-[14px] font-normal leading-[22.75px] text-[#E5E7EB]">{text}</p>
      </div>
    </div>
  );
}
