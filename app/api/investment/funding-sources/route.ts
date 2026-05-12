import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';
import { extractFundingSourceRows, toFundingSource } from '@/lib/funding-source-normalize';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const typeParam = searchParams.get('type') || 'all';
    const bluumType: 'plaid' | 'manual' | 'all' =
      typeParam === 'plaid' || typeParam === 'manual' || typeParam === 'all' ? typeParam : 'all';

    const raw = await bluumApi.getFundingSources(accountId, bluumType);
    const fundingSources = extractFundingSourceRows(raw).map((row) => toFundingSource(row));

    return NextResponse.json({ fundingSources }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
