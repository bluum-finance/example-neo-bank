import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';
import type { FundRequest } from '@/types/bluum'; 

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id;
    
    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const withdrawalData = {
      account_id: accountId,
      amount: body.amount,
      currency: body.currency || 'USD',
      funding_type: body.funding_type || 'fiat',
    };

    const transaction = await bluumApi.withdrawFunds(withdrawalData);
    return NextResponse.json(transaction, { status: 202 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

