export type CurrencyCode = 'USD' | 'NGN' | 'GBP' | 'EUR' | 'KES';

export interface CurrencyDefinition {
  code: CurrencyCode;
  name: string;
  symbol: string;
  precision: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDefinition> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', precision: 2 },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', precision: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', precision: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', precision: 2 },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', precision: 2 },
};

export const DEFAULT_CURRENCY = CURRENCIES.USD;

/** USD-relative rates (used when API fails). */
export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  NGN: 1450,
  GBP: 0.79,
  EUR: 0.92,
  KES: 129,
};

export function isKnownCurrency(code: string): code is CurrencyCode {
  return code in CURRENCIES;
}

export function resolveRate(code: string, rates: Record<string, number>): number | undefined {
  const rate = rates[code] ?? (isKnownCurrency(code) ? FALLBACK_RATES[code] : undefined);
  return rate != null && Number.isFinite(rate) && rate > 0 ? rate : undefined;
}
