'use client';

import { useState, useEffect } from 'react';
import numeral from 'numeral';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  FALLBACK_RATES,
  isKnownCurrency,
  resolveRate,
  type CurrencyCode,
  type CurrencyDefinition,
} from '@/lib/currency';

export type { CurrencyCode, CurrencyDefinition };

const KNOWN_CODES = new Set<string>(Object.keys(CURRENCIES));

let cachedRates: Record<string, number> | null = null;
let cacheTimestamp = 0;
let inFlight: Promise<Record<string, number>> | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

async function loadExchangeRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const response = await fetch('/api/currency/exchange-rate?base=USD');
      if (!response.ok) throw new Error('Failed to fetch exchange rates');
      const data = await response.json();
      const rates = Object.fromEntries(
        Object.entries(data.rates as Record<string, number>).filter(([currency]) => KNOWN_CODES.has(currency))
      );
      cachedRates = rates;
      cacheTimestamp = Date.now();
      return rates;
    } catch {
      cachedRates = { ...FALLBACK_RATES };
      cacheTimestamp = Date.now();
      return cachedRates;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function useCurrency() {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(cachedRates ?? FALLBACK_RATES);
  const [loading, setLoading] = useState(!cachedRates);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadExchangeRates()
      .then((rates) => {
        if (!cancelled) {
          setExchangeRates(rates);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setExchangeRates(FALLBACK_RATES);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function canConvertCurrency(from: string, to: string = 'USD'): boolean {
    if (from === to) return true;
    return resolveRate(from, exchangeRates) != null && resolveRate(to, exchangeRates) != null;
  }

  function convertToCurrency(amount: number, from: string, to: string = 'USD'): number | null {
    if (from === to) return amount;
    const fromRate = resolveRate(from, exchangeRates);
    const toRate = resolveRate(to, exchangeRates);
    if (fromRate == null || toRate == null) return null;
    return (amount / fromRate) * toRate;
  }

  /** @deprecated Use convertToCurrency */
  function convertCurrency(amount: number, from: CurrencyCode = 'USD', to: CurrencyCode): number {
    return convertToCurrency(amount, from, to) ?? amount;
  }

  function getExchangeRate(from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return 1;
    const fromRate = resolveRate(from, exchangeRates);
    const toRate = resolveRate(to, exchangeRates);
    if (fromRate == null || toRate == null) return NaN;
    return toRate / fromRate;
  }

  function formatAmount(amount: number | string, code: CurrencyCode) {
    const currency = CURRENCIES[code];
    if (!currency) {
      throw new Error(`Currency ${code} not found`);
    }
    const symbol = currency.symbol;
    const formatStyle = currency.precision === 2 ? '0,0.00' : '0,0';
    return `${symbol} ${numeral(amount).format(formatStyle)}`;
  }

  function displayAmount(amount: number, code?: string) {
    if (code && isKnownCurrency(code)) {
      return formatAmount(amount, code);
    }
    if (code) {
      return `${numeral(amount).format('0,0.00')} ${code}`;
    }
    return formatAmount(amount, DEFAULT_CURRENCY.code);
  }

  function displayAmountInUSD(amount: number | null | undefined, from?: string): string | null {
    if (amount == null || !from || from === 'USD') return null;
    const amountInUSD = convertToCurrency(amount, from, 'USD');
    if (amountInUSD == null) return null;
    return displayAmount(amountInUSD, 'USD');
  }

  return {
    exchangeRates,
    currencies: CURRENCIES,
    canConvertCurrency,
    convertToCurrency,
    convertCurrency,
    getExchangeRate,
    formatAmount,
    displayAmount,
    displayAmountInUSD,
    loading,
    error,
  };
}
