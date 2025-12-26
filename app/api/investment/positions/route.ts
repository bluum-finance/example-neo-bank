import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

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
      ? positions.map((pos: any) => {
          const shares = parseFloat(pos.quantity) || 0;
          return {
            symbol: pos.symbol,
            name: pos.symbol, // You might want to fetch asset name separately
            shares,
            currentPrice: pos.current_price ? parseFloat(pos.current_price) : null,
            purchasePrice: pos.average_cost_basis ? parseFloat(pos.average_cost_basis) : null,
            // Value should be 0 when shares is 0, not null
            value: shares === 0 ? 0 : pos.market_value ? parseFloat(pos.market_value) : null,
            gain: pos.unrealized_pl ? parseFloat(pos.unrealized_pl) : null,
            gainPercent: pos.unrealized_pl_percent
              ? parseFloat(pos.unrealized_pl_percent)
              : null,
          };
        })
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
