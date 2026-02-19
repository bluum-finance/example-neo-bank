'use client';

import React from 'react';
import { Newspaper, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  time: string;
  headline: string;
  source: string;
}

const newsData: NewsItem[] = [
  {
    id: '1',
    sentiment: 'Bullish',
    time: '2h ago',
    headline: 'Fed signals potential rate cuts in late 2024, sparking market rally.',
    source: 'Bloomberg',
  },
  {
    id: '2',
    sentiment: 'Neutral',
    time: '4h ago',
    headline: 'Tech earnings mixed as cloud growth slows for major players.',
    source: 'Reuters',
  },
];

/**
 * NewsInsights Component
 * A premium news widget with sentiment indicators.
 */
export function NewsInsights() {
  return (
    <section className="flex flex-1 flex-col w-full rounded-xl bg-[#0f2a20] border border-[#1e3d2f] p-6 text-left font-inter text-white">
      {/* Header */}
      <header className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#30d158]" />
          <h2 className="text-base font-normal leading-6">News</h2>
        </div>
        {/* <button className="flex items-center gap-1 font-manrope text-xs font-medium text-[#30d158] hover:opacity-80 transition-opacity">
          More News
          <ChevronRight className="w-3 h-3" />
        </button> */}
      </header>

      {/* News List */}
      <ul className="flex flex-col gap-6">
        {newsData.map((item, index) => (
          <li key={item.id}>
            <article
              className={cn(
                'flex flex-col gap-3 group cursor-pointer transition-opacity hover:opacity-90',
                index !== newsData.length - 1 && 'pb-6 border-b border-[#1e3d2f]/50'
              )}
            >
              <div className="flex items-center justify-between">
                {/* Sentiment Badge */}
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wider border',
                    item.sentiment === 'Bullish'
                      ? 'bg-[#30D158]/10 border-[#30D158]/30 text-[#30D158]'
                      : 'bg-[#1E3D2F] border-[#1E3D2F] text-[#A1BEAD]'
                  )}
                >
                  {item.sentiment}
                </span>
                <time className="text-[10px] font-manrope text-[#A1BEAD]">{item.time}</time>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-normal leading-5 text-white line-clamp-2">{item.headline}</h3>
                <p className="text-xs font-manrope text-[#A1BEAD]">{item.source}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
