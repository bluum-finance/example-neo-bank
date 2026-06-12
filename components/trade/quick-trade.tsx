'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronDown, Loader2, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, OrderRequest } from '@/lib/bluum-api.types';
import { InvestmentService } from '@/services/investment.service';
import { useUser } from '@/store/user.store';
import { useAccountStore } from '@/store/account.store';
import { useWallets, useFetchWallets } from '@/store/wallet.store';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';
import { cn } from '@/lib/utils';
import { MARKET_OPTIONS, marketDisplayLabel } from '@/lib/market';
import { ReviewOrderDialog } from '@/components/trade/review-order-dialog';

type Side = 'buy' | 'sell';
type OrderType = 'limit' | 'market';

const fieldClass =
  'w-full h-12 px-4 bg-[#0C211B] border border-[#1E3D2F] rounded-2xl text-sm text-white placeholder:text-[#9DB9AB] hover:border-[#57B75C]/40 focus:outline-none focus:border-[#57B75C] transition-colors';

const selectClass =
  'w-full h-12 pl-4 pr-9 bg-[#0C211B] border border-[#1E3D2F] rounded-2xl text-sm text-white appearance-none cursor-pointer hover:border-[#57B75C]/40 focus:outline-none focus:border-[#57B75C] transition-colors';

interface AssetInfo {
  symbol: string;
  name: string;
  price: number | null;
  currency?: CurrencyCode;
  market?: string;
  changePercent?: number;
}

export interface QuickTradeProps {
  initialSymbol?: string;
  initialMarket?: string;
  initialSide?: Side;
  onOrderPlaced?: () => void;
}

export function QuickTrade({ initialSymbol, initialMarket, initialSide, onOrderPlaced }: QuickTradeProps) {
  const user = useUser();
  const accountId = user?.externalAccountId;
  const allWallets = useWallets();
  const fetchWallets = useFetchWallets();
  const { displayAmount, displayAmountInUSD } = useCurrency();

  const [side, setSide] = useState<Side>(initialSide ?? 'buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [market, setMarket] = useState(initialMarket ?? '');
  const [symbolInput, setSymbolInput] = useState(initialSymbol ?? '');
  const [asset, setAsset] = useState<AssetInfo | null>(null);
  const didAutoLookup = useRef(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lastLookupKey, setLastLookupKey] = useState('');
  const [shares, setShares] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [placing, setPlacing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [walletCurrency, setWalletCurrency] = useState('USD');

  useEffect(() => {
    if (!accountId) return;
    void fetchWallets(accountId);
  }, [accountId, fetchWallets]);

  const eligibleWallets = useMemo(
    () => allWallets.filter((w) => w.status === 'active'),
    [allWallets]
  );

  useEffect(() => {
    if (eligibleWallets.length === 0) return;
    if (eligibleWallets.some((w) => w.currency === walletCurrency)) return;
    const usd = eligibleWallets.find((w) => w.currency === 'USD');
    setWalletCurrency((usd ?? eligibleWallets[0]).currency);
  }, [eligibleWallets, walletCurrency]);

  const effectivePrice =
    orderType === 'limit' && limitPrice
      ? parseFloat(limitPrice)
      : asset?.price ?? null;

  const estimatedTotal = effectivePrice && shares ? parseFloat(shares) * effectivePrice : null;

  const handleLookup = useCallback(
    async (sym: string, lookup?: { market?: string }) => {
      if (!sym.trim()) return;
      const upper = sym.trim().toUpperCase();
      const hint = lookup?.market !== undefined ? lookup.market : market;
      setLookingUp(true);
      setAsset(null);
      try {
        const data = await InvestmentService.getAssetBySymbol(upper, hint ? { market: hint } : undefined);
        const price = data.price != null ? Number(data.price) : null;
        const currency = (data.currency ?? 'USD').toUpperCase() as CurrencyCode;
        setAsset({
          symbol: data.symbol ?? upper,
          name: data.name ?? data.display_name ?? upper,
          price: price != null && Number.isFinite(price) ? price : null,
          currency: currency || 'USD',
          market: data.market ?? undefined,
          changePercent: data.changePercent ?? 0,
        });
        setLastLookupKey(`${upper}|${hint}`);
        if (price != null) setLimitPrice(Number(price).toFixed(2));
      } catch {
        toast.error(`Asset "${upper}" not found.`);
      } finally {
        setLookingUp(false);
      }
    },
    [market]
  );

  useEffect(() => {
    if (!initialSymbol || didAutoLookup.current) return;
    didAutoLookup.current = true;
    if (initialMarket) setMarket(initialMarket);
    if (initialSide) setSide(initialSide);
    setSymbolInput(initialSymbol);
    void handleLookup(initialSymbol, initialMarket ? { market: initialMarket } : undefined);
  }, [initialSymbol, initialMarket, initialSide, handleLookup]);

  const handleSideChange = (next: Side) => {
    setSide(next);
    setShares('');
    setLimitPrice('');
    if (!initialSymbol) {
      setAsset(null);
      setMarket('');
      setSymbolInput('');
      setLastLookupKey('');
    }
  };

  const handlePlaceOrder = () => {
    if (!asset) {
      toast.error('Please look up a ticker symbol first.');
      return;
    }
    if (!shares || parseFloat(shares) <= 0) {
      toast.error('Please enter a valid number of shares.');
      return;
    }
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error('Please enter a valid limit price.');
      return;
    }
    setShowReview(true);
  };

  const confirmOrder = async () => {
    if (!accountId || !asset) return;
    setPlacing(true);
    try {
      const orderData: OrderRequest = {
        symbol: asset.symbol,
        ...(asset.market ? { market: asset.market } : {}),
        side,
        type: orderType,
        time_in_force: 'day',
        quantity: parseFloat(shares).toFixed(4),
        wallet_currency: walletCurrency,
      };
      if (orderType === 'limit') {
        orderData.limit_price = parseFloat(limitPrice).toFixed(2);
      }
      const result = await InvestmentService.placeOrder(accountId, orderData);
      setPlacedOrder(result);

      const { fetchAccount, fetchPositions } = useAccountStore.getState();
      fetchAccount(accountId).catch(() => null);
      fetchPositions(accountId).catch(() => null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order.');
      setShowReview(false);
    } finally {
      setPlacing(false);
    }
  };

  const handleReviewOpenChange = useCallback(
    (open: boolean) => {
      setShowReview(open);
      if (open) return;
      if (placedOrder) {
        setPlacedOrder(null);
        setShares('');
        setLimitPrice('');
        if (!initialSymbol) {
          setAsset(null);
          setMarket('');
          setSymbolInput('');
          setLastLookupKey('');
        }
        onOrderPlaced?.();
      }
    },
    [placedOrder, onOrderPlaced, initialSymbol]
  );

  const quote = asset && asset.price != null && asset.price > 0
    ? { symbol: asset.symbol, price: asset.price, changePercent: asset.changePercent ?? 0 }
    : null;

  const usdPriceHint = asset?.price != null ? displayAmountInUSD(asset.price, asset.currency) : null;
  const usdEstimatedTotalHint = displayAmountInUSD(estimatedTotal, asset?.currency);

  const isPositive = (quote?.changePercent ?? 0) >= 0;
  const isSell = side === 'sell';

  return (
    <div className="h-full w-full">
      <div className="flex h-full w-full flex-col gap-5 px-6 py-5 bg-[#0F2A20] border border-[#1E3D2F] rounded-2xl">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-white text-base font-semibold">Quick Trade</h3>
            <p className="text-xs text-[#9DB9AB] mt-0.5">Place orders instantly</p>
          </div>
          <div className="flex p-1 bg-[#0C211B] border border-[#1E3D2F] rounded-full">
            {(['buy', 'sell'] as Side[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSideChange(s)}
                className={cn(
                  'px-5 py-1.5 text-sm font-medium rounded-full transition-all capitalize',
                  side === s
                    ? s === 'buy'
                      ? 'bg-[#57B75C] text-white shadow-sm'
                      : 'bg-red-600 text-white shadow-sm'
                    : 'text-[#9DB9AB] hover:text-white'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex flex-col gap-1.5 shrink-0 lg:w-2/5">
              <label className="text-[10px] font-semibold text-[#9DB9AB] uppercase tracking-[0.12em]">Market</label>
              <div className="relative">
                <select
                  value={market}
                  onChange={(e) => {
                    const next = e.target.value;
                    setMarket(next);
                    setAsset(null);
                    setLastLookupKey('');
                    const sym = symbolInput.trim();
                    if (sym) void handleLookup(sym, { market: next });
                  }}
                  className={selectClass}
                  aria-label="Market or exchange for symbol lookup"
                >
                  {MARKET_OPTIONS.map((o) => (
                    <option key={o.value || 'all'} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9DB9AB]" />
              </div>
            </div>

            <div className="w-full lg:w-3/5 flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-[#9DB9AB] uppercase tracking-[0.12em]">Ticker Symbol</label>
              <div className="relative">
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup(symbolInput)}
                  onBlur={() => {
                    const sym = symbolInput.trim();
                    const key = `${sym}|${market}`;
                    if (sym && key !== lastLookupKey) handleLookup(sym);
                  }}
                  placeholder="e.g. AAPL"
                  className={cn(fieldClass, 'pl-4 pr-10 uppercase placeholder:normal-case')}
                />
                <button
                  type="button"
                  onClick={() => handleLookup(symbolInput)}
                  disabled={lookingUp || !symbolInput.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-[#57B75C] transition-colors disabled:opacity-30"
                  aria-label="Look up symbol"
                >
                  {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {quote && asset && (
            <div className="rounded-xl bg-[#07120F] border border-[#1F4536]/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/assets/${quote.symbol.toLowerCase()}`}
                    className="font-bold text-sm font-mono hover:text-[#57B75C] transition-colors flex items-center gap-1 text-white"
                  >
                    {quote.symbol} <ArrowUpRight className="h-3.5 w-3.5 text-[#9DB9AB]" />
                  </Link>
                  {asset.name && <p className="mt-1 text-xs text-[#9DB9AB] truncate max-w-[180px]">{asset.name}</p>}
                  {asset.market && (
                    <p className="text-[10px] text-[#6B7280] mt-0.5 uppercase tracking-wide">{marketDisplayLabel(asset.market)}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold tabular-nums text-white">{displayAmount(quote.price, asset.currency)}</p>
                  {usdPriceHint && <p className="text-xs text-[#9DB9AB]">≈ {usdPriceHint}</p>}
                  <div className={cn('flex items-center justify-end gap-1 text-xs font-semibold mt-0.5', isPositive ? 'text-[#30D158]' : 'text-red-400')}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {quote.changePercent >= 0 ? '+' : ''}
                    {quote.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#9DB9AB] uppercase tracking-[0.12em]">Order Type</label>
            <div className="flex gap-2">
              {(['market', 'limit'] as OrderType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOrderType(t)}
                  className={cn(
                    'flex-1 h-12 rounded-2xl text-sm font-medium transition-all capitalize',
                    orderType === t
                      ? 'bg-[#57B75C]/10 border border-[#57B75C]/60 text-[#57B75C]'
                      : 'bg-[#0C211B] border border-[#1E3D2F] text-[#9DB9AB] hover:text-white hover:border-[#57B75C]/40'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-[#9DB9AB] uppercase tracking-[0.12em]">Shares</label>
              <input
                type="number"
                min="0"
                step="0.0001"
                placeholder="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={cn('text-[10px] font-semibold uppercase tracking-[0.12em]', orderType === 'market' ? 'text-[#9DB9AB]/80' : 'text-[#9DB9AB]')}>
                Limit Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                disabled={orderType === 'market'}
                className={cn(
                  fieldClass,
                  orderType === 'market' && 'opacity-60 cursor-not-allowed focus:border-[#1F4536]'
                )}
              />
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between pt-4 border-t border-[#1E3D2F] mt-auto gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-[#9DB9AB] uppercase tracking-[0.12em]">Est. Total</span>
            <span className="text-xl font-bold text-white tabular-nums">
              {estimatedTotal != null ? displayAmount(estimatedTotal, asset?.currency) : '—'}
            </span>
            {usdEstimatedTotalHint && <span className="text-xs text-[#9DB9AB]">≈ {usdEstimatedTotalHint}</span>}
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placing || !asset || !shares}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm',
              isSell ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#57B75C] hover:bg-[#4ca651] text-white'
            )}
          >
            {placing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Placing…
              </>
            ) : (
              <>
                Review Order <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </footer>
      </div>

      <ReviewOrderDialog
        open={showReview}
        onOpenChange={handleReviewOpenChange}
        onConfirm={confirmOrder}
        placing={placing}
        side={side}
        orderType={orderType}
        asset={asset}
        shares={shares}
        limitPrice={limitPrice}
        estimatedTotal={estimatedTotal}
        wallets={eligibleWallets}
        selectedWalletCurrency={walletCurrency}
        onSelectWalletCurrency={setWalletCurrency}
        placedOrder={placedOrder}
      />
    </div>
  );
}

export default QuickTrade;
