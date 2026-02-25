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
      event_type?: string;
    } = {};

    const status = searchParams.get('status');
    if (status) {
      params.status = status as 'active' | 'completed' | 'archived';
    }

    const eventType = searchParams.get('event_type');
    if (eventType) {
      params.event_type = eventType;
    }

    const response = await bluumApi.listLifeEvents(accountId, params);
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

    if (!body.event_type) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 });
    }

    if (!body.expected_date) {
      return NextResponse.json({ error: 'expected_date is required' }, { status: 400 });
    }

    if (!body.estimated_cost) {
      return NextResponse.json({ error: 'estimated_cost is required' }, { status: 400 });
    }

    const eventData = {
      name: body.name,
      event_type: body.event_type,
      expected_date: body.expected_date,
      estimated_cost: body.estimated_cost,
      currency: body.currency,
      recurring: body.recurring,
      linked_goal_id: body.linked_goal_id,
      notes: body.notes,
    };

    const response = await bluumApi.createLifeEvent(accountId, eventData);
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
