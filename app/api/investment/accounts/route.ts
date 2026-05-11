import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';
import { normalizeNewAccountFinancialProfile } from '@/lib/new-account-financial-profile';

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const accountData = normalizeNewAccountFinancialProfile(raw);
    const account = await bluumApi.createAccount(accountData);
    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
