import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const params: {
      status?: 'active' | 'paused' | 'completed' | 'cancelled';
      portfolio_id?: string;
    } = {};

    const status = searchParams.get('status');
    if (status) {
      params.status = status as 'active' | 'paused' | 'completed' | 'cancelled';
    }

    const portfolioId = searchParams.get('portfolio_id');
    if (portfolioId) {
      params.portfolio_id = portfolioId;
    }

    const data = await bluumApi.getAutoInvestSchedules(accountId, params);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

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

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!body.portfolio_id) {
      return NextResponse.json({ error: 'portfolio_id is required' }, { status: 400 });
    }

    if (!body.funding_source_id) {
      return NextResponse.json({ error: 'funding_source_id is required' }, { status: 400 });
    }

    if (!body.amount) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });
    }

    if (!body.frequency) {
      return NextResponse.json({ error: 'frequency is required' }, { status: 400 });
    }

    if (!body.allocation_rule) {
      return NextResponse.json({ error: 'allocation_rule is required' }, { status: 400 });
    }

    if (!body.start_date) {
      return NextResponse.json({ error: 'start_date is required' }, { status: 400 });
    }

    const scheduleData = {
      name: body.name,
      portfolio_id: body.portfolio_id,
      funding_source_id: body.funding_source_id,
      amount: body.amount,
      currency: body.currency || 'USD',
      frequency: body.frequency,
      schedule: body.schedule,
      allocation_rule: body.allocation_rule,
      start_date: body.start_date,
    };

    const idempotencyKey = request.headers.get('Idempotency-Key') || undefined;
    const response = await bluumApi.createAutoInvestSchedule(accountId, scheduleData, idempotencyKey);
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
