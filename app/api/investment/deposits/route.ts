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

    const method = body.method === 'ach_plaid' ? 'ach' : body.method;
    if (!method || !['ach', 'manual_bank_transfer', 'wire'].includes(method)) {
      return NextResponse.json({ error: 'method is required and must be one of ach, manual_bank_transfer, or wire' }, { status: 400 });
    }

    const depositData = {
      amount: body.amount,
      currency: body.currency || 'USD',
      description: body.description,
      method,
      funding_source_id: body.funding_source_id,
      manual_options: body.manual_options,
      wire_options: body.wire_options,
    };

    const response = await bluumApi.createDeposit(bluumAccountId, depositData, body.idempotency_key);
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
