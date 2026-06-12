/** MIC venue catalog for asset lookup (`GET /assets/:symbol?market=`). */
export const MARKET_CATALOG = [
  { mic: 'XNAS', common_code: 'NASDAQ', exchange: 'NASDAQ', country: 'US', currency: 'USD', trading_hours: '09:30–16:00' },
  { mic: 'XNYS', common_code: 'NYSE', exchange: 'New York Stock Exchange', country: 'US', currency: 'USD', trading_hours: '09:30–16:00' },
  { mic: 'BATS', common_code: 'BATS', exchange: 'BATS Global Markets', country: 'US', currency: 'USD', trading_hours: '09:30–16:00' },
  { mic: 'ARCA', common_code: 'ARCA', exchange: 'NYSE Arca', country: 'US', currency: 'USD', trading_hours: '09:30–16:00' },
  { mic: 'OTC', common_code: 'OTC', exchange: 'OTC Markets', country: 'US', currency: 'USD', trading_hours: '09:30–16:00' },
  { mic: 'XNSA', common_code: 'NGX', exchange: 'Nigerian Stock Exchange', country: 'NG', currency: 'NGN', trading_hours: '10:00–14:30' },
  { mic: 'XJSE', common_code: 'JSE', exchange: 'Johannesburg Stock Exchange', country: 'ZA', currency: 'ZAR', trading_hours: '09:00–17:00' },
  { mic: 'XNAI', common_code: 'NSE', exchange: 'Nairobi Securities Exchange', country: 'KE', currency: 'KES', trading_hours: '09:00–15:00' },
  { mic: 'XCAI', common_code: 'EGX', exchange: 'Egyptian Exchange', country: 'EG', currency: 'EGP', trading_hours: '10:00–14:30' },
  { mic: 'XGHA', common_code: 'GSE', exchange: 'Ghana Stock Exchange', country: 'GH', currency: 'GHS', trading_hours: '09:30–15:00' },
  // { mic: 'XBRV', common_code: 'BRVM', exchange: 'Bourse Régionale des Valeurs Mobilières', country: 'CI', currency: 'XOF', trading_hours: '09:00–15:30' },
  // { mic: 'XDAR', common_code: 'DSE', exchange: 'Dar es Salaam Stock Exchange', country: 'TZ', currency: 'TZS', trading_hours: '10:00–14:00' },
  { mic: 'XBOT', common_code: 'BSE', exchange: 'Botswana Stock Exchange', country: 'BW', currency: 'BWP', trading_hours: '09:30–13:30' },
  // { mic: 'XLUS', common_code: 'LuSE', exchange: 'Lusaka Securities Exchange', country: 'ZM', currency: 'ZMW', trading_hours: '10:00–12:00' },
  { mic: 'XRWA', common_code: 'RSE', exchange: 'Rwanda Stock Exchange', country: 'RW', currency: 'RWF', trading_hours: '09:00–12:00' },
] as const;

export type MarketCatalogEntry = (typeof MARKET_CATALOG)[number];

export function marketOptionLabel(entry: Pick<MarketCatalogEntry, 'common_code' | 'exchange' | 'mic'>): string {
  return `${entry.common_code} — ${entry.exchange}`;
}

export function getMarketByMic(mic: string): MarketCatalogEntry | undefined {
  return MARKET_CATALOG.find((m) => m.mic === mic);
}

/** Compact label for headers and chips, e.g. `NGX (XNSA)`. */
export function marketDisplayLabel(mic: string): string {
  const entry = getMarketByMic(mic);
  return entry ? `${entry.common_code} (${entry.mic})` : mic;
}

/** Select options for market filter dropdowns (MIC value sent to asset APIs). */
export const MARKET_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Markets' },
  ...MARKET_CATALOG.map((m) => ({ value: m.mic, label: marketOptionLabel(m) })),
];
