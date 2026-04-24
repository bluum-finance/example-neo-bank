import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(request: NextRequest) {
  try {
    const symbols = request.nextUrl.searchParams.get('symbols');
    if (!symbols) {
      return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
    }

    const quotes = await bluumApi.getAssetQuotes(symbols.split(',').map((s) => s.trim().toUpperCase()));
    return NextResponse.json(quotes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
