import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';
import { extractConnectFundingSourceRows, toFundingSource } from '@/lib/funding-source-normalize';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    if (!body.type || !['plaid', 'manual'].includes(body.type)) {
      return NextResponse.json({ error: 'type must be "plaid" or "manual"' }, { status: 400 });
    }

    if (body.type === 'plaid' && !body.public_token) {
      return NextResponse.json({ error: 'public_token is required for plaid connections' }, { status: 400 });
    }

    if (body.type === 'manual' && !body.account_number) {
      return NextResponse.json({ error: 'account_number is required for manual connections' }, { status: 400 });
    }

    const { account_id, ...connectPayload } = body;
    const bluumResponse = await bluumApi.connectFundingSource(accountId, connectPayload);
    const rows = extractConnectFundingSourceRows(bluumResponse);
    const fundingSources = rows.map((row) => toFundingSource(row));

    const envelope = bluumResponse && typeof bluumResponse === 'object' ? (bluumResponse as Record<string, unknown>) : {};

    return NextResponse.json(
      {
        status: typeof envelope.status === 'string' ? envelope.status : 'success',
        message:
          typeof envelope.message === 'string'
            ? envelope.message
            : 'Funding source connected successfully',
        data: { fundingSources },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
