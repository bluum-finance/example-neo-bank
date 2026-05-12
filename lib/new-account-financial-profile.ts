/**
 * New-account `identity.financial_profile` helpers:
 * - bracket → { min, max } strings for onboarding
 * - coerce range min/max to strings on create-account payloads (server)
 */

import type { NewAccountRequest } from '@/lib/bluum-api.types';

export type IncomeBracketKey = '' | 'under_25000' | '25000_99999' | '100000_249999' | 'over_250000';
export type NetWorthBracketKey = '' | 'under_205000' | '205000_499999' | 'over_500000';
export type LiquidBracketKey = '' | 'under_50000' | '50000_199999' | 'over_200000';

export type FinancialProfileRange = { min: string; max: string };

const OPEN_END_MAX = '999999999';

const ANNUAL_INCOME_RANGES: Record<Exclude<IncomeBracketKey, ''>, FinancialProfileRange> = {
  under_25000: { min: '0', max: '25000' },
  '25000_99999': { min: '25000', max: '99999' },
  '100000_249999': { min: '100000', max: '249999' },
  over_250000: { min: '250000', max: OPEN_END_MAX },
};

const NET_WORTH_RANGES: Record<Exclude<NetWorthBracketKey, ''>, FinancialProfileRange> = {
  under_205000: { min: '0', max: '205000' },
  '205000_499999': { min: '205000', max: '499999' },
  over_500000: { min: '500000', max: OPEN_END_MAX },
};

const LIQUID_NET_WORTH_RANGES: Record<Exclude<LiquidBracketKey, ''>, FinancialProfileRange> = {
  under_50000: { min: '0', max: '50000' },
  '50000_199999': { min: '50000', max: '199999' },
  over_200000: { min: '200000', max: OPEN_END_MAX },
};

function asStringRange(range: FinancialProfileRange): FinancialProfileRange {
  return { min: String(range.min), max: String(range.max) };
}

export function annualIncomeBracketToRange(key: string): FinancialProfileRange {
  const range = ANNUAL_INCOME_RANGES[key as Exclude<IncomeBracketKey, ''>];
  if (!range) {
    throw new Error(`Invalid annual income bracket: ${key || '(empty)'}`);
  }
  return asStringRange(range);
}

export function netWorthBracketToRange(key: string): FinancialProfileRange {
  const range = NET_WORTH_RANGES[key as Exclude<NetWorthBracketKey, ''>];
  if (!range) {
    throw new Error(`Invalid net worth bracket: ${key || '(empty)'}`);
  }
  return asStringRange(range);
}

export function liquidNetWorthBracketToRange(key: string): FinancialProfileRange {
  const range = LIQUID_NET_WORTH_RANGES[key as Exclude<LiquidBracketKey, ''>];
  if (!range) {
    throw new Error(`Invalid liquid net worth bracket: ${key || '(empty)'}`);
  }
  return asStringRange(range);
}

type UnknownRecord = Record<string, unknown>;

function stringifyRangeField(value: unknown): { min: string; max: string } | undefined {
  if (value === null || typeof value !== 'object') return undefined;
  const o = value as UnknownRecord;
  if (o.min === undefined || o.max === undefined) return undefined;
  return { min: String(o.min), max: String(o.max) };
}

/** Coerces `identity.financial_profile` range min/max to strings before Bluum. */
export function normalizeNewAccountFinancialProfile(body: unknown): NewAccountRequest {
  if (body === null || typeof body !== 'object') return body as NewAccountRequest;
  const root = body as UnknownRecord;
  const identity = root.identity;
  if (identity === null || typeof identity !== 'object') return body as NewAccountRequest;

  const id = identity as UnknownRecord;
  const fp = id.financial_profile;
  if (fp === null || typeof fp !== 'object') return body as NewAccountRequest;

  const financialProfile = fp as UnknownRecord;
  const nextFp: UnknownRecord = { ...financialProfile };

  for (const key of ['annual_income', 'net_worth', 'liquid_net_worth'] as const) {
    const coerced = stringifyRangeField(financialProfile[key]);
    if (coerced) nextFp[key] = coerced;
  }

  return {
    ...root,
    identity: {
      ...id,
      financial_profile: nextFp,
    },
  } as NewAccountRequest;
}
