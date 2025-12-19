import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/services/bluum-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const account = await bluumApi.getAccount(accountId);
    return NextResponse.json(account);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

