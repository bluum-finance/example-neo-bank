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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const funding_type = searchParams.get('funding_type');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const transactions = await bluumApi.listTransactions(accountId, {
      type: type as 'deposit' | 'withdrawal' | undefined,
      status: status as any,
      funding_type: funding_type as 'fiat' | 'crypto' | undefined,
      date_from: date_from || undefined,
      date_to: date_to || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

