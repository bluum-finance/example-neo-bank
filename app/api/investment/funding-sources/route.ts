import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

interface FundingSourceRaw {
  id: string;
  type: 'plaid' | 'manual';
  status: string;
  bank_name: string;
  mask?: string;
  account_name?: string;
  account_type?: string;
  account_subtype?: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

/** Bluum may return a bare list, camelCase, or { status, data: { … } } */
function extractFundingSourceRows(payload: unknown): FundingSourceRaw[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) {
    return payload as FundingSourceRaw[];
  }
  if (typeof payload !== 'object') return [];

  const o = payload as Record<string, unknown>;
  const asArray = (v: unknown): FundingSourceRaw[] | null => (Array.isArray(v) ? (v as FundingSourceRaw[]) : null);

  const fromRoot = asArray(o.funding_sources) ?? asArray(o.fundingSources);
  if (fromRoot) return fromRoot;

  if (o.data && typeof o.data === 'object') {
    const d = o.data as Record<string, unknown>;
    const fromData = asArray(d.funding_sources) ?? asArray(d.fundingSources);
    if (fromData) return fromData;
  }

  return [];
}

function normalizeFundingSource(source: FundingSourceRaw) {
  return {
    id: source.id,
    type: source.type,
    status: source.status,
    bankName: source.bank_name,
    mask: source.mask,
    accountName: source.account_name,
    accountType: source.account_type,
    accountSubtype: source.account_subtype,
    providerId: source.provider_id,
    createdAt: source.created_at,
    updatedAt: source.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const typeParam = searchParams.get('type') || 'all';
    const bluumType: 'plaid' | 'manual' | 'all' =
      typeParam === 'plaid' || typeParam === 'manual' || typeParam === 'all' ? typeParam : 'all';

    const raw = await bluumApi.getFundingSources(accountId, bluumType);
    const fundingSources = extractFundingSourceRows(raw).map(normalizeFundingSource);

    return NextResponse.json({ fundingSources }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
