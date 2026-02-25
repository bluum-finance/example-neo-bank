import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const event = await bluumApi.getLifeEvent(accountId, eventId);
    return NextResponse.json(event);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Life event not found' },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    const eventData: any = {};
    if (body.name !== undefined) eventData.name = body.name;
    if (body.event_type !== undefined) eventData.event_type = body.event_type;
    if (body.expected_date !== undefined) eventData.expected_date = body.expected_date;
    if (body.estimated_cost !== undefined) eventData.estimated_cost = body.estimated_cost;
    if (body.currency !== undefined) eventData.currency = body.currency;
    if (body.recurring !== undefined) eventData.recurring = body.recurring;
    if (body.status !== undefined) eventData.status = body.status;
    if (body.linked_goal_id !== undefined) eventData.linked_goal_id = body.linked_goal_id;
    if (body.notes !== undefined) eventData.notes = body.notes;

    const response = await bluumApi.updateLifeEvent(accountId, eventId, eventData);
    return NextResponse.json(response);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Life event not found' },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    await bluumApi.deleteLifeEvent(accountId, eventId);
    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Life event not found' },
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
