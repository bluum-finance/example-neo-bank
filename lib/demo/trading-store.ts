import type { Order, OrderRequest, Position, Wallet } from '@/lib/bluum-api.types';
import {
  BANK_ACCOUNTS,
  bankAccountIdFromWalletId,
  walletIdForBankAccount,
} from '@/lib/demo/bank-accounts';
import { getDemoAssetPrice } from '@/lib/demo/assets';
import { isAssetDemo } from '@/lib/demo-mode';
import { createOrderId, normalizeLegacyOrderId, seedOrderId } from '@/lib/order-id';

export const SEED_POSITIONS: Position[] = [
  {
    id: 'pos_msft',
    investor_id: 'demo',
    symbol: 'MSFT',
    currency: 'USD',
    quantity: '10',
    average_cost_basis: '375.00',
    current_price: '380.25',
    market_value: '3802.50',
    unrealized_pl: '52.50',
    unrealized_pl_percent: '1.40',
  },
  {
    id: 'pos_aapl',
    investor_id: 'demo',
    symbol: 'AAPL',
    currency: 'USD',
    quantity: '15',
    average_cost_basis: '165.00',
    current_price: '175.50',
    market_value: '2632.50',
    unrealized_pl: '157.50',
    unrealized_pl_percent: '6.36',
  },
  {
    id: 'pos_nvda',
    investor_id: 'demo',
    symbol: 'NVDA',
    currency: 'USD',
    quantity: '5',
    average_cost_basis: '480.00',
    current_price: '501.12',
    market_value: '2505.60',
    unrealized_pl: '105.60',
    unrealized_pl_percent: '4.42',
  },
];

const SEED_ORDER_OFFSETS_DAYS = [14, 10, 5];

function buildSeedOrders(investorId: string): Order[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return SEED_POSITIONS.map((pos, index) => {
    const created = now - SEED_ORDER_OFFSETS_DAYS[index]! * dayMs;
    const qty = pos.quantity ?? '0';
    const price = pos.average_cost_basis ?? '0';

    return {
      id: seedOrderId(pos.symbol),
      object: 'order',
      created,
      livemode: false,
      metadata: {},
      investor_id: investorId,
      symbol: pos.symbol,
      currency: pos.currency ?? 'USD',
      quantity: qty,
      side: 'buy',
      type: 'market',
      time_in_force: 'day',
      limit_price: null,
      status: 'filled',
      filled_quantity: qty,
      remaining_quantity: '0',
      average_price: price,
      filled_at: new Date(created).toISOString(),
    };
  });
}

function hasSeedHoldings(positions: Position[]): boolean {
  return SEED_POSITIONS.every((seed) =>
    positions.some((p) => p.symbol.toUpperCase() === seed.symbol.toUpperCase())
  );
}

function ensureSeedOrders(state: DemoTradingState, investorId: string): DemoTradingState {
  if (state.orders.length > 0 || !hasSeedHoldings(state.positions)) {
    return state;
  }
  return { ...state, orders: buildSeedOrders(investorId) };
}

export interface DemoTradingState {
  orders: Order[];
  positions: Position[];
  walletBalances: Record<string, number>;
}

const STORAGE_PREFIX = 'bluum-demo-trading:';

function defaultWalletBalances(): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const account of BANK_ACCOUNTS) {
    balances[walletIdForBankAccount(account.id)] = account.defaultBalance;
  }
  return balances;
}

function seedState(investorId: string): DemoTradingState {
  return {
    orders: buildSeedOrders(investorId),
    positions: SEED_POSITIONS.map((p) => ({ ...p, investor_id: investorId })),
    walletBalances: defaultWalletBalances(),
  };
}

function readState(investorId: string): DemoTradingState {
  if (typeof window === 'undefined') {
    return seedState(investorId);
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${investorId}`);
    if (!raw) return seedState(investorId);
    const parsed = JSON.parse(raw) as DemoTradingState;
    const state: DemoTradingState = {
      orders: (parsed.orders ?? []).map((order) => ({
        ...order,
        id: normalizeLegacyOrderId(order.id),
      })),
      positions: parsed.positions ?? [],
      walletBalances: { ...defaultWalletBalances(), ...parsed.walletBalances },
    };
    const withOrders = ensureSeedOrders(state, investorId);
    const ordersChanged =
      withOrders.orders.length > state.orders.length ||
      withOrders.orders.some((order, i) => order.id !== state.orders[i]?.id);
    if (ordersChanged) {
      localStorage.setItem(`${STORAGE_PREFIX}${investorId}`, JSON.stringify(withOrders));
    }
    return withOrders;
  } catch {
    return seedState(investorId);
  }
}

function writeState(investorId: string, state: DemoTradingState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}${investorId}`, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('demo-trading-updated', { detail: { investorId } }));
}

export function getDemoTradingState(investorId: string): DemoTradingState {
  return readState(investorId);
}

export function getDemoPositions(investorId: string): Position[] {
  return readState(investorId).positions;
}

export function getDemoOrders(investorId: string): Order[] {
  return [...readState(investorId).orders].reverse();
}

export function getDemoWallets(investorId: string): Wallet[] {
  const state = readState(investorId);
  return BANK_ACCOUNTS.map((account) => {
    const walletId = walletIdForBankAccount(account.id);
    const balance = state.walletBalances[walletId] ?? account.defaultBalance;
    const balanceStr = balance.toFixed(2);
    return {
      id: walletId,
      object: 'wallet',
      created: null,
      livemode: false,
      metadata: { label: account.label, mask: account.mask, accountId: account.id },
      currency: 'USD',
      balance: balanceStr,
      available_balance: balanceStr,
      reserved_balance: '0.00',
      cash_withdrawable: balanceStr,
      buying_power: balanceStr,
      equity: balanceStr,
      status: 'active' as const,
    };
  });
}

function parseNum(value?: string | null): number {
  const n = parseFloat(value ?? '0');
  return Number.isFinite(n) ? n : 0;
}

function resolveFillPrice(symbol: string, orderData: OrderRequest, fallbackPrice?: number | null): number {
  if (orderData.type === 'limit' && orderData.limit_price) {
    return parseNum(orderData.limit_price);
  }
  if (isAssetDemo()) {
    return getDemoAssetPrice(symbol) ?? fallbackPrice ?? 0;
  }
  return fallbackPrice ?? 0;
}

function updatePosition(
  positions: Position[],
  investorId: string,
  symbol: string,
  side: 'buy' | 'sell',
  qty: number,
  fillPrice: number
): Position[] {
  const upper = symbol.toUpperCase();
  const idx = positions.findIndex((p) => p.symbol.toUpperCase() === upper);
  const existing = idx >= 0 ? positions[idx] : null;
  const existingQty = existing ? parseNum(existing.quantity) : 0;

  if (side === 'sell') {
    if (!existing || existingQty < qty) {
      throw new Error(`Insufficient shares of ${upper} to sell.`);
    }
    const newQty = existingQty - qty;
    if (newQty <= 0) {
      return positions.filter((_, i) => i !== idx);
    }
    const avgCost = parseNum(existing.average_cost_basis);
    const marketValue = newQty * fillPrice;
    const costBasis = newQty * avgCost;
    const unrealized = marketValue - costBasis;
    const updated: Position = {
      ...existing,
      quantity: newQty.toFixed(4),
      current_price: fillPrice.toFixed(2),
      market_value: marketValue.toFixed(2),
      unrealized_pl: unrealized.toFixed(2),
      unrealized_pl_percent: costBasis > 0 ? ((unrealized / costBasis) * 100).toFixed(2) : '0.00',
    };
    return positions.map((p, i) => (i === idx ? updated : p));
  }

  const newQty = existingQty + qty;
  const prevCost = existing ? parseNum(existing.average_cost_basis) * existingQty : 0;
  const newCost = prevCost + qty * fillPrice;
  const avgCost = newQty > 0 ? newCost / newQty : fillPrice;
  const marketValue = newQty * fillPrice;
  const unrealized = marketValue - newCost;

  const updated: Position = {
    id: existing?.id ?? `pos_${upper.toLowerCase()}_${Date.now()}`,
    investor_id: investorId,
    symbol: upper,
    currency: 'USD',
    quantity: newQty.toFixed(4),
    average_cost_basis: avgCost.toFixed(2),
    current_price: fillPrice.toFixed(2),
    market_value: marketValue.toFixed(2),
    unrealized_pl: unrealized.toFixed(2),
    unrealized_pl_percent: newCost > 0 ? ((unrealized / newCost) * 100).toFixed(2) : '0.00',
  };

  if (idx >= 0) {
    return positions.map((p, i) => (i === idx ? updated : p));
  }
  return [...positions, updated];
}

function resolveWalletId(investorId: string, orderData: OrderRequest): string {
  if (orderData.wallet_id) return orderData.wallet_id;
  if (orderData.wallet_currency) {
    const match = getDemoWallets(investorId).find((w) => w.currency === orderData.wallet_currency);
    if (match) return match.id;
  }
  return walletIdForBankAccount('3168');
}

export function placeDemoOrder(
  investorId: string,
  orderData: OrderRequest,
  options?: { fillPrice?: number | null }
): Order {
  const state = readState(investorId);
  const symbol = orderData.symbol.toUpperCase();
  const qty = parseNum(orderData.quantity);
  if (qty <= 0) throw new Error('Invalid order quantity.');

  const fillPrice = resolveFillPrice(symbol, orderData, options?.fillPrice);
  if (fillPrice <= 0) throw new Error('Unable to determine fill price for this order.');

  const total = qty * fillPrice;
  const walletId = resolveWalletId(investorId, orderData);

  if (!bankAccountIdFromWalletId(walletId)) {
    throw new Error('Invalid wallet for this order.');
  }

  const balance = state.walletBalances[walletId] ?? 0;

  if (orderData.side === 'buy' && total > balance) {
    throw new Error('Insufficient buying power in selected wallet.');
  }

  if (orderData.side === 'sell') {
    const pos = state.positions.find((p) => p.symbol.toUpperCase() === symbol);
    if (!pos || parseNum(pos.quantity) < qty) {
      throw new Error(`Insufficient shares of ${symbol} to sell.`);
    }
  }

  const now = Date.now();
  const order: Order = {
    id: createOrderId(),
    object: 'order',
    created: now,
    livemode: false,
    metadata: {},
    investor_id: investorId,
    symbol,
    currency: 'USD',
    quantity: qty.toFixed(4),
    side: orderData.side,
    type: orderData.type,
    time_in_force: orderData.time_in_force,
    limit_price: orderData.limit_price ?? null,
    status: 'filled',
    filled_quantity: qty.toFixed(4),
    remaining_quantity: '0',
    average_price: fillPrice.toFixed(2),
    filled_at: new Date(now).toISOString(),
  };

  const newBalances = { ...state.walletBalances };
  if (orderData.side === 'buy') {
    newBalances[walletId] = balance - total;
  } else {
    newBalances[walletId] = balance + total;
  }

  const newPositions = updatePosition(state.positions, investorId, symbol, orderData.side, qty, fillPrice);

  writeState(investorId, {
    orders: [...state.orders, order],
    positions: newPositions,
    walletBalances: newBalances,
  });
  return order;
}

export function resolveDemoInvestorKey(accountId: string): string {
  return accountId || 'local-demo';
}
