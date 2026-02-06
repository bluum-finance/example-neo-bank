import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ widgetType: string }> }
) {
  try {
    const { widgetType } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    // Require account_id for all widget requests
    if (!accountId) {
      return NextResponse.json(
        {
          error: 'account_id is required',
        },
        { status: 400 }
      );
    }

    // Fetch from real API and return directly
    switch (widgetType) {
      case 'financial-goals': {
        try {
          const response = await bluumApi.getGoals(accountId);
          return NextResponse.json(response || []);
        } catch (error: any) {
          if (error.response?.status === 404) {
            return NextResponse.json([]);
          }
          throw error;
        }
      }

      case 'investment-policy': {
        try {
          const response = await bluumApi.getInvestmentPolicy(accountId);
          return NextResponse.json(response);
        } catch (error: any) {
          // Handle 404 - investment policy may not exist yet
          if (error.response?.status === 404) {
            return NextResponse.json(
              {
                error: 'Investment policy not found',
              },
              { status: 404 }
            );
          }
          throw error;
        }
      }

      case 'widget-insights': {
        try {
          const [insightsResponse, recommendationsResponse] = await Promise.all([
            bluumApi.getInsights(accountId, { limit: 10 }).catch(() => []),
            bluumApi.getRecommendations(accountId, { type: 'all' }).catch(() => []),
          ]);
          return NextResponse.json({
            insights: insightsResponse || [],
            recommendations: recommendationsResponse || [],
          });
        } catch (error: any) {
          // Return empty arrays if API fails
          return NextResponse.json({
            insights: [],
            recommendations: [],
          });
        }
      }

      case 'portfolio-performance': {
        const range = (searchParams.get('range') || '1y') as '1d' | '1w' | '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | 'all';
        const portfolioId = searchParams.get('portfolio_id');
        
        if (!portfolioId) {
          return NextResponse.json(
            {
              error: 'portfolio_id is required for portfolio-performance',
            },
            { status: 400 }
          );
        }

        try {
          const response = await bluumApi.getPortfolioPerformance(accountId, portfolioId, {
            period: range,
            benchmark: 'SPY',
          });
          return NextResponse.json(response);
        } catch (error: any) {
          if (error.response?.status === 404) {
            return NextResponse.json(
              {
                error: 'Portfolio performance data not found',
              },
              { status: 404 }
            );
          }
          throw error;
        }
      }

      case 'portfolio-summary': {
        const portfolioId = searchParams.get('portfolio_id');
        if (!portfolioId) {
          return NextResponse.json(
            {
              error: 'portfolio_id is required for portfolio-summary',
            },
            { status: 400 }
          );
        }

        const refreshPricesParam = searchParams.get('refresh_prices');
        const refreshPrices =
          refreshPricesParam === 'true' || refreshPricesParam === '1' || refreshPricesParam === 'yes';

        try {
          const response = await bluumApi.getPortfolioSummary(accountId, portfolioId, {
            refresh_prices: refreshPrices ? true : undefined,
          });
          return NextResponse.json(response);
        } catch (error: any) {
          if (error.response?.status === 404) {
            return NextResponse.json(
              {
                error: 'Portfolio summary not found',
              },
              { status: 404 }
            );
          }
          throw error;
        }
      }

      default: {
        return NextResponse.json(
          {
            error: `Unknown widget type: ${widgetType}`,
          },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    try {
      const { widgetType } = await params;
      console.error(`API error for ${widgetType}:`, error);
      return NextResponse.json(
        {
          error: error.message || `Failed to fetch ${widgetType}`,
        },
        { status: 500 }
      );
    } catch {
      // If params can't be awaited, use generic error
      return NextResponse.json(
        {
          error: error.message || 'Failed to fetch widget data',
        },
        { status: 500 }
      );
    }
  }
}
