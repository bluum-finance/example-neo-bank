'use client';

import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth } from '@/lib/auth';
import { type RecentActivity, type WidgetInsight } from '@/services/widget.service';

interface OverviewWidgetsProps {
  recentActivities?: RecentActivity[];
  insights?: WidgetInsight[];
}

export function OverviewWidgets({
  recentActivities = [],
  insights = [],
}: OverviewWidgetsProps) {
  const user = getAuth();
  const accountId = user?.externalAccountId;

  const insightIconMap: Record<string, React.ReactNode> = {
    clock: <Clock className="h-5 w-5" />,
    'check-circle': <CheckCircle2 className="h-5 w-5" />,
    'alert-circle': <AlertCircle className="h-5 w-5" />,
  };

  const convertedInsights = insights.map((insight) => ({
    ...insight,
    icon: insightIconMap[insight.icon] || <Clock className="h-5 w-5" />,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!accountId) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recent Activity Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const isPositive = activity.amount !== null && activity.amount >= 0;
              const isNegative = activity.amount !== null && activity.amount < 0;

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">{activity.iconEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <span
                        className={`text-sm font-semibold ml-2 ${isPositive
                          ? 'text-green-600'
                          : isNegative
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                          }`}
                      >
                        {activity.amount === null
                          ? '—'
                          : `${isPositive ? '+' : ''}${formatCurrency(Math.abs(activity.amount))}`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {convertedInsights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${insight.iconColor}15`,
                    color: insight.iconColor,
                  }}
                >
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.actionLabel && insight.actionLink && (
                    <Link
                      href={insight.actionLink}
                      className="text-xs font-medium mt-2 inline-block text-blue-500 dark:text-blue-400"
                    >
                      {insight.actionLabel}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
