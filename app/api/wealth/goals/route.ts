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
      status?: 'active' | 'completed' | 'archived';
      goal_type?: string;
      include_projections?: boolean;
    } = {};

    const status = searchParams.get('status');
    if (status) {
      params.status = status as 'active' | 'completed' | 'archived';
    }

    const goalType = searchParams.get('goal_type');
    if (goalType) {
      params.goal_type = goalType;
    }

    const includeProjections = searchParams.get('include_projections');
    if (includeProjections === 'true') {
      params.include_projections = true;
    }

    const goals = await bluumApi.getGoals(accountId, params);
    return NextResponse.json(goals);
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

    if (!body.goal_type) {
      return NextResponse.json({ error: 'goal_type is required' }, { status: 400 });
    }

    if (!body.target_amount) {
      return NextResponse.json({ error: 'target_amount is required' }, { status: 400 });
    }

    const goalData = {
      name: body.name,
      goal_type: body.goal_type,
      target_amount: body.target_amount,
      target_date: body.target_date,
      priority: body.priority,
      monthly_contribution: body.monthly_contribution,
    };

    const idempotencyKey = request.headers.get('Idempotency-Key') || undefined;
    const response = await bluumApi.createGoal(accountId, goalData, idempotencyKey);
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
