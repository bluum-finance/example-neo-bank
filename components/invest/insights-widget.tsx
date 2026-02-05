'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { type WidgetInsight } from '@/services/widget.service';
import { Clock } from 'lucide-react';

interface InsightsWidgetProps {
  insights?: WidgetInsight[];
  // Props kept for future use when connecting to real data
  positions?: any[];
  portfolioGains?: {
    totalGain: number;
    totalGainPercent: number;
  };
  accountBalance?: number;
}

// Custom icon components matching the design
const ChartIcon = () => (
  <div className="w-3.5 h-3.5 relative">
    <div
      className="absolute left-[1.17px] top-[1.17px] w-[11.67px] h-[11.67px]"
      style={{
        outline: '1.17px #5856D6 solid',
        outlineOffset: '-0.58px',
      }}
    />
    <div
      className="absolute left-[5.30px] top-[4.08px] w-[3.40px] h-[3.50px]"
      style={{
        outline: '1.17px #5856D6 solid',
        outlineOffset: '-0.58px',
      }}
    />
  </div>
);

const ChartIcon2 = () => (
  <div className="w-3.5 h-3.5 relative">
    <div
      className="absolute left-[1.17px] top-[1.16px] w-[11.67px] h-[11.67px]"
      style={{
        outline: '1.17px #5856D6 solid',
        outlineOffset: '-0.58px',
      }}
    />
    <div
      className="absolute left-[5.25px] top-[2.33px] w-[7.58px] h-[5.84px]"
      style={{
        outline: '1.17px #5856D6 solid',
        outlineOffset: '-0.58px',
      }}
    />
  </div>
);

const ChartIcon3 = () => (
  <div className="w-3.5 h-3.5 relative">
    <div
      className="absolute left-[1.17px] top-[1.17px] w-[11.67px] h-[11.67px]"
      style={{
        outline: '1.17px #5856D6 solid',
        outlineOffset: '-0.58px',
      }}
    />
  </div>
);

const getIconComponent = (index: number) => {
  const icons = [ChartIcon, ChartIcon2, ChartIcon3];
  return icons[index % icons.length];
};

export function InsightsWidget({
  insights = [],
  positions,
  portfolioGains,
  accountBalance,
}: InsightsWidgetProps) {
  const router = useRouter();

  const handleActionClick = (link?: string) => {
    if (link) {
      router.push(link);
    }
  };

  return (
    <Card className="w-full h-full">
      <CardContent className="">
        <div className="w-full h-full flex flex-col gap-4">
          {/* Title */}
          <div
            className="flex items-center mb-2 text-gray-500 dark:text-muted-foreground"
            style={{
              fontSize: 18,
              fontFamily: 'Inter',
              fontWeight: 500,
            }}
          >
            Your Insights
          </div>

          {/* Insights List */}
          <div className="flex flex-col gap-0">
            {insights.map((insight, index) => {
              const IconComponent = getIconComponent(index);
              const showDivider = index < insights.length - 1;

              return (
                <div key={insight.id} className="flex flex-col gap-0">
                  {/* Insight Card */}
                  <div className="rounded-[10px] flex flex-col gap-2">
                    {/* Header with Icon and Title */}
                    <div className="flex items-center gap-2">
                      {/* Icon Container */}
                      <div
                        className="w-7 h-7 relative flex items-center justify-center shrink-0"
                        style={{
                          background: 'rgba(88, 86, 214, 0.10)',
                          borderRadius: 6,
                        }}
                      >
                        <IconComponent />
                      </div>
                      {/* Title */}
                      <div
                        className="flex items-center text-sm text-gray-700 dark:text-foreground"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 600,
                        }}
                      >
                        {insight.title}
                      </div>
                    </div>

                    {/* Description */}
                    <div
                      className="text-gray-600 dark:text-muted-foreground"
                      style={{
                        fontSize: 13,
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        lineHeight: '19.50px',
                      }}
                    >
                      {insight.description.split('<br/>').map((line, lineIndex, array) => (
                        <span key={lineIndex}>
                          {line}
                          {lineIndex < array.length - 1 && <br />}
                        </span>
                      ))}
                    </div>

                    {/* Action Link */}
                    {insight.actionLabel && insight.actionLink && (
                      <div className="h-[19.50px] relative mt-1">
                        <button
                          onClick={() => handleActionClick(insight.actionLink)}
                          className="h-4 flex items-center cursor-pointer hover:opacity-80 transition-opacity text-blue-600 dark:text-blue-400"
                          style={{
                            fontSize: 13,
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            lineHeight: '19.50px',
                          }}
                        >
                          {insight.actionLabel} →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  {showDivider && (
                    <div
                      className="w-full h-px my-4 bg-gray-200 dark:bg-border"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
