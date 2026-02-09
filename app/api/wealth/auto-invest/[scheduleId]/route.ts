import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const schedule = await bluumApi.getAutoInvestSchedule(accountId, scheduleId);
    return NextResponse.json(schedule);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    const scheduleData = {
      name: body.name,
      amount: body.amount,
      frequency: body.frequency,
      schedule: body.schedule,
      allocation_rule: body.allocation_rule,
      status: body.status,
    };

    const response = await bluumApi.updateAutoInvestSchedule(
      accountId,
      scheduleId,
      scheduleData
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    await bluumApi.deleteAutoInvestSchedule(accountId, scheduleId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
