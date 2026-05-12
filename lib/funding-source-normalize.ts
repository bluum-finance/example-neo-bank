import type { FundingSource } from '@/lib/bluum-api.types';

function asRecord(row: unknown): Record<string, unknown> | null {
  if (row == null || typeof row !== 'object' || Array.isArray(row)) return null;
  return row as Record<string, unknown>;
}

function pickString(r: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = r[k];
    if (v != null && v !== '') return String(v);
  }
  return undefined;
}

function pickStringOrNull(r: Record<string, unknown>, keys: string[]): string | null {
  const v = pickString(r, keys);
  return v ?? null;
}

/**
 * Normalizes a funding source row from Bluum list (snake_case) or connect (camelCase).
 */
export function toFundingSource(row: unknown): FundingSource {
  const r = asRecord(row);
  if (!r) {
    throw new Error('Invalid funding source row');
  }

  const id = pickString(r, ['id']) ?? '';
  const typeRaw = (pickString(r, ['type']) ?? 'manual').toLowerCase();
  const type: FundingSource['type'] = typeRaw === 'plaid' ? 'plaid' : 'manual';

  const statusRaw = (pickString(r, ['status']) ?? '').toLowerCase();
  const status: FundingSource['status'] =
    statusRaw === 'active' || statusRaw === 'disconnected' || statusRaw === 'error' ? statusRaw : 'disconnected';

  const createdSec =
    typeof r.created === 'number'
      ? r.created
      : typeof r.created === 'string' && /^\d+$/.test(r.created)
        ? parseInt(r.created, 10)
        : undefined;
  const createdAt =
    createdSec != null && !Number.isNaN(createdSec)
      ? new Date(createdSec * 1000).toISOString()
      : (pickString(r, ['created_at', 'createdAt']) ?? '');
  const updatedAt = pickString(r, ['updated_at', 'updatedAt']) ?? createdAt;

  return {
    id,
    type,
    status,
    bankName: pickStringOrNull(r, ['bank_name', 'bankName']),
    mask: pickStringOrNull(r, ['mask']),
    providerId: pickString(r, ['provider_id', 'providerId']),
    accountName: pickString(r, ['account_name', 'accountName']),
    accountType: pickString(r, ['account_type', 'accountType']),
    accountSubtype: pickString(r, ['account_subtype', 'accountSubtype']),
    currency: pickString(r, ['currency']) ?? null,
    country: pickString(r, ['country']) ?? null,
    createdAt,
    updatedAt,
  };
}

/** Extract raw funding source rows from various Bluum list payload shapes. */
export function extractFundingSourceRows(payload: unknown): unknown[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;

  if (typeof payload !== 'object') return [];

  const o = payload as Record<string, unknown>;

  if (o.object === 'list' && Array.isArray(o.data)) {
    return o.data;
  }

  const fromKey = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : null);

  const fromRoot = fromKey(o.funding_sources) ?? fromKey(o.fundingSources);
  if (fromRoot) return fromRoot;

  if (o.data && typeof o.data === 'object') {
    const d = o.data as Record<string, unknown>;
    const fromData = fromKey(d.funding_sources) ?? fromKey(d.fundingSources);
    if (fromData) return fromData;
  }

  return [];
}

/** Rows from POST .../funding-sources/connect — list envelope, single envelope, or legacy keys. */
export function extractConnectFundingSourceRows(bluumBody: unknown): unknown[] {
  if (bluumBody == null || typeof bluumBody !== 'object') return [];
  const b = bluumBody as Record<string, unknown>;

  if (b.object === 'list' && Array.isArray(b.data)) {
    return b.data;
  }

  if (b.object === 'funding_source') {
    return [bluumBody];
  }

  const data = b.data;
  if (data == null || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.funding_sources)) return d.funding_sources;
  if (Array.isArray(d.fundingSources)) return d.fundingSources;
  if (d.fundingSource != null) return [d.fundingSource];
  return [];
}
