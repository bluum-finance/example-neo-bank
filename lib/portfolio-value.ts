import type { Position } from '@/lib/bluum-api.types';
import { isTradingDemo } from '@/lib/demo-mode';

export function sumPositionsMarketValue(positions: Position[]): number {
  return positions.reduce((sum, position) => sum + (parseFloat(position.market_value || '0') || 0), 0);
}

/** Investment portfolio total — demo mode uses positions only (cash lives in bank wallets). */
export function calculatePortfolioValue(accountBalance: number, positions: Position[]): number {
  const positionsValue = sumPositionsMarketValue(positions);
  if (isTradingDemo()) {
    return positionsValue;
  }
  return accountBalance + positionsValue;
}
