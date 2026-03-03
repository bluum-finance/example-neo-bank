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

export function useCurrency() {
  const exchangeRate = 1450; // TODO: Implement exchange rate calculation

  // function convertAmount(amount: number, from: string = BASE_CURRENCY.code, to: string) {
  //   amount = amount / 100;
  //   if (from === to) return amount;
  //   if (from === 'USD' && to === 'NGN') return amount * exchangeRate;
  //   if (from === 'NGN' && to === 'USD') return amount / exchangeRate;
  //   return amount;
  // }

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
    exchangeRate,
    currencies: CURRENCIES,
    formatAmount,
    displayAmount,
  };
}
