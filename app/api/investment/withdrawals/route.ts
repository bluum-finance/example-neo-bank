import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    if (!body.amount) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });
    }

    if (!body.funding_source_id) {
      return NextResponse.json({ error: 'funding_source_id is required' }, { status: 400 });
    }

    const withdrawalData = {
      amount: body.amount,
      currency: body.currency || 'USD',
      method: body.method || 'ach_plaid',
      funding_source_id: body.funding_source_id,
      description: body.description,
    };

    const response = await bluumApi.createWithdrawal(accountId, withdrawalData, body.idempotency_key);
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
