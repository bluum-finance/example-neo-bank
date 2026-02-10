'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { type Insight, type Recommendation } from '@/services/widget.service';
import { Receipt, TrendingUp, RotateCcw, BarChart3, AlertCircle } from 'lucide-react';

interface InsightsWidgetProps {
  insights?: { insights: Insight[]; recommendations: Recommendation[] };
  // Props kept for future use when connecting to real data
  positions?: any[];
  portfolioGains?: {
    totalGain: number;
    totalGainPercent: number;
  };
  accountBalance?: number;
}

// Get icon component based on insight/recommendation category
const getIconComponent = (item: Insight | Recommendation, index: number) => {
  const category = 'category' in item ? item.category : item.type || 'all';
  const title = item.title?.toLowerCase() || '';

  if (category === 'tax' || title.includes('tax') || title.includes('optimization')) {
    return <Receipt className="w-3.5 h-3.5 text-green-800 dark:text-green-400" />;
  }
  if (category === 'rebalancing' || title.includes('rebalancing') || title.includes('rebalance')) {
    return <RotateCcw className="w-3.5 h-3.5 text-green-800 dark:text-green-400" />;
  }
  if (category === 'risk' || title.includes('alert') || title.includes('warning')) {
    return <AlertCircle className="w-3.5 h-3.5 text-green-800 dark:text-green-400" />;
  }
  if (category === 'opportunity' || title.includes('outperforming') || title.includes('benchmark') || title.includes('performance')) {
    return <TrendingUp className="w-3.5 h-3.5 text-green-800 dark:text-green-400" />;
  }

  // Default icons based on index
  const defaultIcons = [
    <BarChart3 className="w-3.5 h-3.5 text-green-800 dark:text-green-400" />,
    <TrendingUp className="w-3.5 h-3.5 text-green-800 dark:text-green-400" />,
    <Receipt className="w-3.5 h-3.5 text-green-800 dark:text-green-400" />,
  ];
  return defaultIcons[index % defaultIcons.length];
};

export function InsightsWidget({
  insights,
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

  // Combine insights and recommendations
  const allItems: Array<Insight | Recommendation> = [
    ...(insights?.insights || []),
    ...(insights?.recommendations || []),
  ];

  return (
    <Card className="w-full h-full">
      <CardContent className="">
        <div className="w-full h-full flex flex-col gap-4">
          <div className="text-base font-semibold text-foreground/70 dark:text-white/70">Your Insights</div>

          <div className="flex flex-col gap-0">
            {allItems.map((item, index) => {
              const iconElement = getIconComponent(item, index);
              const showDivider = index < allItems.length - 1;
              const description = 'summary' in item ? item.summary : item.rationale || '';
              const hasAction = ('action' in item && item.action) || ('suggested_actions' in item && item.suggested_actions?.length > 0);

              return (
                <div key={('insight_id' in item ? item.insight_id : item.recommendation_id) || index} className="flex flex-col gap-0">
                  {/* Insight Card */}
                  <div className="rounded-[10px] flex flex-col gap-2">
                    {/* Header with Icon and Title */}
                    <div className="flex items-center gap-2">
                      {/* Icon Container */}
                      <div
                        className="w-7 h-7 relative flex items-center justify-center shrink-0 rounded-md bg-green-100 dark:bg-green-900/30"
                      >
                        {iconElement}
                      </div>
                      {/* Title */}
                      <div
                        className="flex items-center text-sm text-gray-700 dark:text-foreground"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 600,
                        }}
                      >
                        {item.title}
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
                      {description.split('<br/>').map((line: string, lineIndex: number, array: string[]) => (
                        <span key={lineIndex}>
                          {line}
                          {lineIndex < array.length - 1 && <br />}
                        </span>
                      ))}
                    </div>

                    {/* Action Link */}
                    {hasAction && (
                      <div className="h-[19.50px] relative mt-1">
                        <button
                          onClick={() => handleActionClick('/trade')}
                          className="h-4 flex items-center cursor-pointer hover:opacity-80 transition-opacity text-green-600 dark:text-green-400"
                          style={{
                            fontSize: 13,
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            lineHeight: '19.50px',
                          }}
                        >
                          Review allocation →
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

          {allItems.length === 0 && (
            <div className="flex flex-col items-center gap-0 pb-2">
              <div className="w-full text-base font-normal text-gray-500 dark:text-muted-foreground">
                No insights found
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
