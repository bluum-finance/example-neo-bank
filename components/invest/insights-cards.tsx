'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { getPersonalizedInsights, type PersonalizedInsight } from '@/lib/mock-data';

export function PersonalizedInsights() {
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPersonalizedInsights().then((data) => {
      setInsights(data);
      setLoading(false);
    });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'rebalancing':
        return <BarChart3 className="h-5 w-5" />;
      case 'tax-loss':
        return <DollarSign className="h-5 w-5" />;
      case 'risk':
        return <AlertCircle className="h-5 w-5" />;
      case 'market-trend':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#081c14' }}>
          Personalized Insights
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          AI-powered recommendations tailored to your portfolio
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className="cursor-pointer transition-all hover:shadow-md"
            style={{ borderColor: '#edf9cd' }}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-full p-2"
                    style={{ backgroundColor: '#edf9cd' }}
                  >
                    <div style={{ color: '#081c14' }}>{getIcon(insight.type)}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{insight.title}</h3>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-1 ${getPriorityColor(insight.priority)}`}
                    >
                      {insight.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{insight.description}</p>

              {insight.actionLabel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  style={{ borderColor: '#081c14', color: '#081c14' }}
                >
                  {insight.actionLabel}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

