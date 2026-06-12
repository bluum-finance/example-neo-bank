import type { Position } from '@/lib/bluum-api.types';
import { convertAmount, DEFAULT_CURRENCY, type CurrencyCode } from '@/lib/currency';
import { isTradingDemo } from '@/lib/demo-mode';

function parseMarketValue(position: Position): number {
  return parseFloat(position.market_value || '0') || 0;
}

/** Sum position market values, converting each to `targetCurrency` (default USD). */
export function sumPositionsMarketValue(
  positions: Position[],
  targetCurrency: CurrencyCode = DEFAULT_CURRENCY.code,
  rates?: Record<string, number>
): number {
  return positions.reduce((sum, position) => {
    const raw = parseMarketValue(position);
    const from = position.currency || DEFAULT_CURRENCY.code;
    const converted = convertAmount(raw, from, targetCurrency, rates) ?? (from === targetCurrency ? raw : 0);
    return sum + converted;
  }, 0);
}

/** Investment portfolio total — demo mode uses positions only (cash lives in bank wallets). */
export function calculatePortfolioValue(accountBalance: number, positions: Position[]): number {
  const positionsValue = sumPositionsMarketValue(positions);
  if (isTradingDemo()) {
    return positionsValue;
  }
  return accountBalance + positionsValue;
}
