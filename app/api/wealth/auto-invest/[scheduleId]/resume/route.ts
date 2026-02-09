import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(
  request: NextRequest,
  { params }: { params: { scheduleId: string } }
) {
  try {
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    const response = await bluumApi.resumeAutoInvestSchedule(accountId, params.scheduleId);
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
