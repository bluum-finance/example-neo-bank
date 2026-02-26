import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ externalAccountId: string }> }
) {
  try {
    const { externalAccountId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const account = await bluumApi.getExternalAccount(accountId, externalAccountId);
    return NextResponse.json(account);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'External account not found' },
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
  { params }: { params: Promise<{ externalAccountId: string }> }
) {
  try {
    const { externalAccountId } = await params;
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    const accountData: any = {};
    if (body.name !== undefined) accountData.name = body.name;
    if (body.account_type !== undefined) accountData.account_type = body.account_type;
    if (body.is_asset !== undefined) accountData.is_asset = body.is_asset;
    if (body.balance !== undefined) accountData.balance = body.balance;
    if (body.currency !== undefined) accountData.currency = body.currency;
    if (body.institution !== undefined) accountData.institution = body.institution;
    if (body.notes !== undefined) accountData.notes = body.notes;
    if (body.status !== undefined) accountData.status = body.status;

    const response = await bluumApi.updateExternalAccount(accountId, externalAccountId, accountData);
    return NextResponse.json(response);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'External account not found' },
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
  { params }: { params: Promise<{ externalAccountId: string }> }
) {
  try {
    const { externalAccountId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    await bluumApi.deleteExternalAccount(accountId, externalAccountId);
    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'External account not found' },
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
