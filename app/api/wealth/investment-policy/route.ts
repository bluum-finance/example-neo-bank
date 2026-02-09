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
      version?: string;
      include_history?: boolean;
    } = {};

    const version = searchParams.get('version');
    if (version) {
      params.version = version;
    }

    const includeHistory = searchParams.get('include_history');
    if (includeHistory === 'true') {
      params.include_history = true;
    }

    const policy = await bluumApi.getInvestmentPolicy(accountId, params);
    return NextResponse.json(policy);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        {
          error: 'Investment policy not found',
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.risk_profile) {
      return NextResponse.json({ error: 'risk_profile is required' }, { status: 400 });
    }

    if (!body.time_horizon) {
      return NextResponse.json({ error: 'time_horizon is required' }, { status: 400 });
    }

    if (!body.investment_objectives) {
      return NextResponse.json({ error: 'investment_objectives is required' }, { status: 400 });
    }

    if (!body.target_allocation) {
      return NextResponse.json({ error: 'target_allocation is required' }, { status: 400 });
    }

    if (!body.constraints) {
      return NextResponse.json({ error: 'constraints is required' }, { status: 400 });
    }

    // Validate target allocation sums to 100%
    const allocation = body.target_allocation;
    let totalPercent = 0;
    if (allocation.equities?.target_percent) {
      totalPercent += parseFloat(allocation.equities.target_percent);
    }
    if (allocation.fixed_income?.target_percent) {
      totalPercent += parseFloat(allocation.fixed_income.target_percent);
    }
    if (allocation.treasury?.target_percent) {
      totalPercent += parseFloat(allocation.treasury.target_percent);
    }
    if (allocation.alternatives?.target_percent) {
      totalPercent += parseFloat(allocation.alternatives.target_percent);
    }

    if (Math.abs(totalPercent - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Target allocation must sum to 100%' },
        { status: 400 }
      );
    }

    const policyData = {
      risk_profile: body.risk_profile,
      time_horizon: body.time_horizon,
      investment_objectives: body.investment_objectives,
      target_allocation: body.target_allocation,
      constraints: body.constraints,
    };

    const idempotencyKey = request.headers.get('Idempotency-Key') || undefined;
    const response = await bluumApi.createOrUpdateInvestmentPolicy(
      accountId,
      policyData,
      idempotencyKey
    );
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
