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

    // Validate required fields
    if (!body.amount || !body.funding_details) {
      return NextResponse.json(
        { error: 'amount and funding_details are required' },
        { status: 400 }
      );
    }

    // Extract fund request data (excluding account_id which goes in the URL)
    const fundData: FundRequest = {
      amount: body.amount,
      funding_details: body.funding_details,
      description: body.description,
      external_reference_id: body.external_reference_id,
    };

    const transaction = await bluumApi.fundAccount(accountId, fundData);
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

