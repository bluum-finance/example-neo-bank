'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Info, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Insight } from '@/services/widget.service';

interface WelcomeInsightsCardProps {
  insights: Insight[];
  userName: string;
  aiInputValue: string;
  onAiInputChange: (value: string) => void;
  onAiSend: () => void;
  onPromptClick: (prompt: string) => void;
  suggestedPrompts: string[];
}

export function WelcomeInsightsCard({
  insights,
  userName,
  aiInputValue,
  onAiInputChange,
  onAiSend,
  onPromptClick,
  suggestedPrompts,
}: WelcomeInsightsCardProps) {
  const router = useRouter();
  const insightVisibleCount = Math.min(insights.length, 3);

  return (
    <Card className="py-6 bg-[#0F2A20] border-[#1E3D2F]">
      <CardContent className="px-6">
        <div className="flex flex-col gap-6">
          {/* Welcome Heading */}
          <div className="text-[30px] font-normal text-white leading-9" style={{ fontFamily: 'Inter' }}>
            Welcome, {userName}
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left: Your Insights */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-4">
                <div className="text-lg font-normal text-[#B0B8BD] leading-[27px]" style={{ fontFamily: 'Inter' }}>
                  Your Insights
                </div>

                <div className="flex flex-col gap-4">
                  {insights.slice(0, insightVisibleCount).map((item, index) => {
                    const description = item.summary || '';
                    const hasAction = !!item.action;
                    const showDivider = index < insightVisibleCount - 1;

                    // Get icon based on category
                    let IconComponent;
                    const category = item.category?.toLowerCase() || '';
                    if (category === 'tax') {
                      IconComponent = <Info className="w-3.5 h-3.5 text-[#4CAF50]" />;
                    } else if (category === 'opportunity') {
                      IconComponent = <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />;
                    } else if (category === 'rebalancing') {
                      IconComponent = <Clock className="w-3.5 h-3.5 text-[#4CAF50]" />;
                    } else {
                      IconComponent = <Info className="w-3.5 h-3.5 text-[#4CAF50]" />;
                    }

                    // Handle action click
                    const handleActionClick = () => {
                      if (item.action?.type === 'rebalance') {
                        router.push('/trade');
                      } else if (item.action?.type === 'view') {
                        router.push('/trade');
                      }
                    };

                    return (
                      <div key={item.insight_id || index}>
                        <div className="flex flex-col gap-2">
                          {/* Header with Icon and Title */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#124031] rounded-md flex items-center justify-center">
                              {IconComponent}
                            </div>
                            <div className="text-xs font-medium text-[#D1D5DB] leading-[19.5px]" style={{ fontFamily: 'Inter' }}>
                              {item.title}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="text-[13px] font-light text-[#A1BEAD] leading-[19.5px]" style={{ fontFamily: 'Inter' }}>
                            {description.split('<br/>').map((line: string, lineIndex: number, array: string[]) => (
                              <span key={lineIndex}>
                                {line}
                                {lineIndex < array.length - 1 && <br />}
                              </span>
                            ))}
                          </div>

                          {/* Action Link */}
                          {hasAction && item.action?.cta_label && (
                            <div className="text-[13px] font-medium text-[#66D07A] leading-[19.5px] cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: 'Inter' }}>
                              <button onClick={handleActionClick}>
                                {item.action.cta_label} →
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        {showDivider && (
                          <div className="w-full h-px bg-[#1E3D2F] my-4" />
                        )}
                      </div>
                    );
                  })}
                  {insights.length === 0 && (
                    <div className="text-sm text-[#A1BEAD]" style={{ fontFamily: 'Inter' }}>
                      No insights found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-px h-full min-h-[400px] bg-[#1E3D2F] mx-4" />

            {/* Right: AI Chat */}
            <div className="flex-1 min-w-0 flex flex-col items-center gap-4">
              <div className="relative flex flex-col items-center h-fit">
                {/* Glow effect */}
                <div
                  className="absolute w-28 h-28 rounded-full bottom-[28px]"
                  style={{
                    background: 'rgba(76, 175, 80, 0.30)',
                    filter: 'blur(32px)',
                  }}
                />
                <Image src="/ai-icon.svg" alt="AI Icon" width={190} height={190} className="z-10" />
              </div>

              {/* Input Section */}
              <div className="w-full relative">
                <div className="flex-1 h-16 relative bg-[#0E231F] rounded-full border border-[#1E3D2F] px-5 flex items-center gap-3">
                  {/* Plus icon */}
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.39062 19.5703C7.38281 21.5234 9.74609 22.5 12.4805 22.5C15.2148 22.5 17.5586 21.5234 19.5117 19.5703C21.5039 17.5781 22.5 15.2148 22.5 12.4805C22.5 9.74609 21.5039 7.40234 19.5117 5.44922C17.5586 3.45703 15.2148 2.46094 12.4805 2.46094C9.74609 2.46094 7.38281 3.45703 5.39062 5.44922C3.4375 7.40234 2.46094 9.74609 2.46094 12.4805C2.46094 15.2148 3.4375 17.5781 5.39062 19.5703ZM3.63281 3.69141C6.09375 1.23047 9.04297 0 12.4805 0C15.918 0 18.8477 1.23047 21.2695 3.69141C23.7305 6.11328 24.9609 9.04297 24.9609 12.4805C24.9609 15.918 23.7305 18.8672 21.2695 21.3281C18.8477 23.75 15.918 24.9609 12.4805 24.9609C9.04297 24.9609 6.09375 23.75 3.63281 21.3281C1.21094 18.8672 0 15.918 0 12.4805C0 9.04297 1.21094 6.11328 3.63281 3.69141ZM13.7109 6.21094V11.25H18.75V13.7109H13.7109V18.75H11.25V13.7109H6.21094V11.25H11.25V6.21094H13.7109Z" fill="#A1BEAD" />
                    </svg>
                  </div>

                  {/* Input */}
                  <input
                    type="text"
                    value={aiInputValue}
                    onChange={(e) => onAiInputChange(e.target.value)}
                    placeholder="Ask AI"
                    className="flex-1 pl-4 bg-transparent text-[#A1BEAD] placeholder:text-[#A1BEAD] placeholder:font-extralight outline-none text-xl font-light"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        onAiSend();
                      }
                    }}
                  />
                  {/* Send icon */}
                  <button
                    className="w-8 h-9 flex items-center justify-center disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                    onClick={onAiSend}
                    disabled={!aiInputValue.trim()}
                  >
                    <svg width="29" height="22" viewBox="0 0 29 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#A1BEAD]" style={{ transform: 'rotate(-12deg)' }}>
                      <path d="M4.67801 22.0083L2.86285 13.4686L20.6793 7.10582L1.81517 8.53969L0 0L28.0154 5.54648L4.67801 22.0083Z" fill="#A1BEAD" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggested Prompts */}
              <div className="w-full mt-4 max-w-3xl flex flex-col items-center gap-4">
                <div className="w-full flex flex-col items-center gap-4">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => onPromptClick(prompt)}
                      className="cursor-pointer transition-colors rounded-full border border-[#1E3D2F] bg-[#0E231F] flex px-6 py-2"
                    >
                      <span
                        className="text-center justify-center text-[#A1BEAD] text-xs font-light leading-5"
                      >
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
