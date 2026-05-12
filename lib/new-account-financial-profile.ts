/**
 * Coerce `{ min, max }` money ranges in flat `POST /investors` payloads to string min/max.
 */

import type { NewAccountRequest } from '@/lib/bluum-api.types';

type UnknownRecord = Record<string, unknown>;

function stringifyRangeField(value: unknown): { min: string; max: string } | undefined {
  if (value === null || typeof value !== 'object') return undefined;
  const o = value as UnknownRecord;
  if (o.min === undefined || o.max === undefined) return undefined;
  return { min: String(o.min), max: String(o.max) };
}

/** Coerces top-level Bluum flat investor money ranges before proxying to Bluum. */
export function normalizeNewAccountFinancialProfile(body: unknown): NewAccountRequest {
  if (body === null || typeof body !== 'object') return body as unknown as NewAccountRequest;
  const root = body as UnknownRecord;
  const next: UnknownRecord = { ...root };

  for (const key of ['annual_income', 'liquid_net_worth', 'total_net_worth'] as const) {
    const coerced = stringifyRangeField(root[key]);
    if (coerced) next[key] = coerced;
  }

  return next as unknown as NewAccountRequest;
}
