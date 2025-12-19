import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';
import type { NewAccountRequest } from '@/types/bluum';

export async function POST(request: NextRequest) {
  try {
    const accountData: NewAccountRequest = await request.json();
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

export async function GET() {
  try {
    const accounts = await bluumApi.listAccounts();
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

