'use client';

import { useState, useEffect } from 'react';
import numeral from 'numeral';

// TYPES
export type CurrencyCode = 'USD' | 'NGN' | 'GBP' | 'EUR';
export interface CurrencyDefinition {
  code: CurrencyCode;
  name: string;
  symbol: string;
  precision: number;
}

// CONSTANTS
const CURRENCIES: Record<CurrencyCode, CurrencyDefinition> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', precision: 2 },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', precision: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', precision: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', precision: 2 },
};

const DEFAULT_CURRENCY = CURRENCIES.USD;

// Fallback exchange rates (used if API fails)
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  NGN: 1450,
  GBP: 0.79,
  EUR: 0.92,
};

export function useCurrency() {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/currency/exchange-rate?base=USD');
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();
        // Only set rates supported currencies [USD, NGN, GBP, EUR]
        const rates = Object.fromEntries(Object.entries(data.rates).filter(([currency]) => Object.keys(CURRENCIES).includes(currency)));
        setExchangeRates(rates as Record<CurrencyCode, number>);
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Use fallback rates on error
        setExchangeRates(FALLBACK_RATES);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  /**
   * Convert amount from one currency to another
   * @param amount - Amount to convert
   * @param from - Source currency code (default: USD)
   * @param to - Target currency code
   * @returns Converted amount
   */
  function convertCurrency(amount: number, from: CurrencyCode = 'USD', to: CurrencyCode): number {
    if (from === to) return amount;

    // Get rates relative to USD
    const fromRate = exchangeRates[from];
    const toRate = exchangeRates[to];

    // Convert: amount -> USD -> target currency
    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;

    return convertedAmount;
  }

  /**
   * Get exchange rate between two currencies
   * @param from - Source currency code
   * @param to - Target currency code
   * @returns Exchange rate (how many 'to' units per 1 'from' unit)
   */
  function getExchangeRate(from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return 1;

    const fromRate = exchangeRates[from] || FALLBACK_RATES[from];
    const toRate = exchangeRates[to] || FALLBACK_RATES[to];

    return toRate / fromRate;
  }

  function formatAmount(amount: number | string, code: CurrencyCode) {
    const currency = CURRENCIES[code];
    if (!currency) {
      throw new Error(`Currency ${code} not found`);
    }

    const symbol = currency.symbol;
    const formatStyle = currency.precision === 2 ? '0,0.00' : '0,0';
    return `${symbol}${numeral(amount).format(formatStyle)}`;
  }

  function displayAmount(amount: number, code?: string) {
    const resolvedCode = code && CURRENCIES[code as CurrencyCode] ? (code as CurrencyCode) : DEFAULT_CURRENCY.code;
    return formatAmount(amount, resolvedCode);
  }

  return {
    exchangeRates,
    currencies: CURRENCIES,
    convertCurrency,
    getExchangeRate,
    formatAmount,
    displayAmount,
    loading,
    error,
  };
}
