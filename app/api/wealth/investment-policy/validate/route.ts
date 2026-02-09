import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    if (!body.portfolio_id) {
      return NextResponse.json(
        { error: 'portfolio_id is required' },
        { status: 400 }
      );
    }

    const validationResult = await bluumApi.validatePortfolioAgainstIPS(
      accountId,
      body.portfolio_id
    );
    return NextResponse.json(validationResult);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
