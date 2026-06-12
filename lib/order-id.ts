const SEED_ORDER_IDS: Record<string, string> = {
  MSFT: 'ord_7f2a91bc4e038d51',
  AAPL: 'ord_3c8b72ef1a905426',
  NVDA: 'ord_9d41e6a0f2873b1c',
  DANGCEM: 'ord_5e8c14d2b7094a3f',
};

const LEGACY_SEED_MAP: Record<string, string> = {
  ord_seed_msft: SEED_ORDER_IDS.MSFT!,
  ord_seed_aapl: SEED_ORDER_IDS.AAPL!,
  ord_seed_nvda: SEED_ORDER_IDS.NVDA!,
  ord_seed_dangcem: SEED_ORDER_IDS.DANGCEM!,
};

function stableHexFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0') + input.length.toString(16).padStart(8, '0');
}

export function createOrderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ord_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  return `ord_${Date.now().toString(36)}${rand}`;
}

export function seedOrderId(symbol: string): string {
  return SEED_ORDER_IDS[symbol.toUpperCase()] ?? `ord_${stableHexFromString(`seed:${symbol}`)}`;
}

/** Rewrite legacy internal ids (ord_demo_*, ord_seed_*) to production-style references. */
export function normalizeLegacyOrderId(id: string): string {
  if (LEGACY_SEED_MAP[id]) return LEGACY_SEED_MAP[id];

  const demoMatch = id.match(/^ord_demo_(\d+)$/);
  if (demoMatch) return `ord_${stableHexFromString(demoMatch[1]!)}`;

  const seedMatch = id.match(/^ord_seed_(\w+)$/i);
  if (seedMatch) {
    const key = `ord_seed_${seedMatch[1]!.toLowerCase()}`;
    return LEGACY_SEED_MAP[key] ?? `ord_${stableHexFromString(id)}`;
  }

  return id;
}

export function formatOrderReference(orderId: string): string {
  const core = normalizeLegacyOrderId(orderId).replace(/^ord_/, '');
  if (core.length <= 16) return core.toUpperCase();
  return `${core.slice(0, 8).toUpperCase()}···${core.slice(-4).toUpperCase()}`;
}
