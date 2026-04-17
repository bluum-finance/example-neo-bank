import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    // Validate required fields
    if (!body.amount) {
      return NextResponse.json(
        { error: 'amount is required' },
        { status: 400 }
      );
    }

    // Map legacy format (funding_details/plaidOptions) to external contract payload
    let depositData: any;

    if (body.plaidOptions) {
      depositData = {
        amount: body.amount,
        currency: body.currency || 'USD',
        method: body.method === 'ach_plaid' ? 'ach' : body.method || 'ach',
        description: body.description,
        manual_options: body.manual_options,
        wire_options: body.wire_options,
      };
    } else if (body.funding_details) {
      if (body.public_token) {
        depositData = {
          amount: body.amount,
          currency: body.funding_details.fiat_currency || 'USD',
          method: body.funding_details.method === 'ach' ? 'ach' : 'wire',
          description: body.description,
          wire_options: body.wire_options,
        };
      } else {
        depositData = {
          amount: body.amount,
          currency: body.funding_details.fiat_currency || 'USD',
          method: 'manual_bank_transfer',
          description: body.description,
          manual_options: body.manual_options,
        };
      }
    } else {
      return NextResponse.json(
        { error: 'Either contract payload fields or funding_details is required' },
        { status: 400 }
      );
    }

    if (!['ach', 'manual_bank_transfer', 'wire'].includes(depositData.method)) {
      return NextResponse.json({ error: 'method must be one of ach, manual_bank_transfer, or wire' }, { status: 400 });
    }

    const response = await bluumApi.createDeposit(accountId, depositData, body.external_reference_id);
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
