import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/services/bluum-api';

function getAccountId(request: NextRequest): string | null {
  const searchParams = request.nextUrl.searchParams;
  return searchParams.get('account_id');
}

export async function GET(request: NextRequest) {
  try {
    const accountId = getAccountId(request);
    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const non_zero_only = searchParams.get('non_zero_only');

    const positions = await bluumApi.listPositions(accountId, {
      symbol: symbol || undefined,
      non_zero_only: non_zero_only === 'true',
    });

    // Transform positions to match frontend Stock interface
    const holdings = Array.isArray(positions)
      ? positions.map((pos: any) => ({
          symbol: pos.symbol,
          name: pos.symbol, // You might want to fetch asset name separately
          shares: parseFloat(pos.quantity),
          currentPrice: parseFloat(pos.current_price),
          purchasePrice: parseFloat(pos.average_cost_basis),
          value: parseFloat(pos.market_value),
          gain: parseFloat(pos.unrealized_pl),
          gainPercent: parseFloat(pos.unrealized_pl_percent),
        }))
      : [];

    return NextResponse.json(holdings);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

