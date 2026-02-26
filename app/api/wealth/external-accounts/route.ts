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
      status?: 'active' | 'archived';
      is_asset?: boolean;
      account_type?: string;
    } = {};

    const status = searchParams.get('status');
    if (status) {
      params.status = status as 'active' | 'archived';
    }

    const isAsset = searchParams.get('is_asset');
    if (isAsset !== null) {
      params.is_asset = isAsset === 'true';
    }

    const accountType = searchParams.get('account_type');
    if (accountType) {
      params.account_type = accountType;
    }

    const response = await bluumApi.listExternalAccounts(accountId, params);
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

    if (!body.account_type) {
      return NextResponse.json({ error: 'account_type is required' }, { status: 400 });
    }

    if (body.is_asset === undefined) {
      return NextResponse.json({ error: 'is_asset is required' }, { status: 400 });
    }

    if (!body.balance) {
      return NextResponse.json({ error: 'balance is required' }, { status: 400 });
    }

    const accountData = {
      name: body.name,
      account_type: body.account_type,
      is_asset: body.is_asset,
      balance: body.balance,
      currency: body.currency,
      institution: body.institution,
      notes: body.notes,
    };

    const idempotencyKey = request.headers.get('Idempotency-Key') || undefined;
    const response = await bluumApi.createExternalAccount(accountId, accountData, idempotencyKey);
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
