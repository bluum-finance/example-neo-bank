import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bluumAccountId = body.account_id;

    if (!bluumAccountId) {
      return NextResponse.json({ error: 'account_id (Bluum account ID) is required' }, { status: 400 });
    }

    if (!body.amount) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });
    }

    const depositData = {
      amount: body.amount,
      currency: body.currency || 'USD',
      description: body.description,
      method: body.method || 'ach_plaid',
      funding_source_id: body.funding_source_id,
    };

    const response = await bluumApi.createDeposit(bluumAccountId, depositData, body.idempotency_key);
    return NextResponse.json(response, { status: 202 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
