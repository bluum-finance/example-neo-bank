import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const limit = searchParams.get('limit');
    const adjustment = searchParams.get('adjustment');
    const feed = searchParams.get('feed');

    if (!timeframe) {
      return NextResponse.json({ error: 'timeframe is required' }, { status: 400 });
    }

    const chartData = await bluumApi.getChartData({
      symbol,
      timeframe: timeframe as any,
      start: start || undefined,
      end: end || undefined,
      limit: limit ? parseInt(limit) : undefined,
      adjustment: adjustment as any,
      feed: feed as any,
    });
    return NextResponse.json(chartData);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

