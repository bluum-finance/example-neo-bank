import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const result = await bluumApi.restartComplianceWorkflow(accountId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
