import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // account_id is the Bluum account ID (UUID)
    const bluumAccountId = body.account_id;

    if (!bluumAccountId) {
      return NextResponse.json(
        { error: 'account_id (Bluum account ID) is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.amount) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });
    }

    // Either public_token or item_id must be provided
    if (!body.public_token && !body.item_id) {
      return NextResponse.json(
        { error: 'Either public_token or item_id must be provided' },
        { status: 400 }
      );
    }

    const withdrawalData = {
      public_token: body.public_token,
      item_id: body.item_id,
      account_id: body.plaid_account_id, // Plaid account ID (optional, for stored accounts)
      amount: body.amount,
      currency: body.currency || 'USD',
      description: body.description,
    };

    const response = await bluumApi.initiatePlaidWithdrawal(bluumAccountId, withdrawalData);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
