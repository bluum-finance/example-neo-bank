'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ArrowRight, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { InvestmentService } from '@/services/investment.service';
import { useUser } from '@/store/user.store';
import { cn } from '@/lib/utils';
import { OrderReviewModal } from '@/components/invest/order-review-modal';
import { OrderSuccessModal } from '@/components/invest/order-success-modal';

type Side = 'buy' | 'sell';
type OrderType = 'limit' | 'market' | 'stop';
type AssetType = 'Stocks' | 'ETFs' | 'Crypto';

const ASSET_TYPES: AssetType[] = ['Stocks', 'ETFs', 'Crypto'];

interface AssetInfo {
  symbol: string;
  name: string;
  price: number | null;
}

export function QuickTrade() {
  const user = useUser();
  const accountId = user?.externalAccountId;

  const [side, setSide] = useState<Side>('buy');
  const [assetType, setAssetType] = useState<AssetType>('Stocks');
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [symbolInput, setSymbolInput] = useState('');
  const [asset, setAsset] = useState<AssetInfo | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [shares, setShares] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [placing, setPlacing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState('—');

  const effectivePrice = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : (asset?.price ?? null);
  const estimatedTotal = effectivePrice && shares ? parseFloat(shares) * effectivePrice : null;

  const handleLookup = useCallback(
    async (sym: string) => {
      if (!sym.trim()) return;
      setLookingUp(true);
      setAsset(null);
      try {
        const data = await InvestmentService.getAssetBySymbol(sym.trim().toUpperCase());
        const price = data?.current_price ?? data?.price ?? data?.data?.current_price ?? data?.data?.price ?? null;
        setAsset({
          symbol: data?.symbol ?? sym.toUpperCase(),
          name: data?.name ?? data?.display_name ?? sym.toUpperCase(),
          price: price ? parseFloat(price) : null,
        });
        if (orderType === 'limit' && price) {
          setLimitPrice(parseFloat(price).toFixed(2));
        }
      } catch {
        toast.error(`Asset "${sym.toUpperCase()}" not found.`);
      } finally {
        setLookingUp(false);
      }
    },
    [orderType]
  );

  const handleSideChange = (next: Side) => {
    setSide(next);
    setAsset(null);
    setSymbolInput('');
    setShares('');
    setLimitPrice('');
  };

  const handleOrderTypeChange = (next: OrderType) => {
    setOrderType(next);
    if (next !== 'limit') setLimitPrice('');
  };

  const handlePlaceOrder = async () => {
    if (!accountId) {
      toast.error('No investment account found.');
      return;
    }
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
      const orderData: any = {
        symbol: asset.symbol,
        side,
        type: orderType === 'stop' ? 'stop' : orderType,
        time_in_force: 'day',
        qty: parseFloat(shares).toFixed(4),
      };
      if (orderType === 'limit') {
        orderData.limit_price = parseFloat(limitPrice).toFixed(2);
      }
      const result = await InvestmentService.placeOrder(accountId, orderData);
      setOrderId(result?.id ?? result?.order_id ?? result?.data?.id ?? '—');
      setShowReview(false);
      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to place order.');
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceAnother = () => {
    setShowSuccess(false);
    setShares('');
    setLimitPrice('');
    setAsset(null);
    setSymbolInput('');
  };

  const isSell = side === 'sell';

  return (
    <div className="w-full flex flex-col gap-8 px-6 py-6 bg-[#0F2A20] border border-[#1E3D2F] rounded-[32px]">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h3 className="text-white text-lg font-normal font-manrope">Quick Trade</h3>
        <div className="flex p-1 bg-[#0E231F] border border-[#1E3D2F] rounded-full">
          {(['buy', 'sell'] as Side[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSideChange(s)}
              className={cn(
                'px-6 py-1.5 text-sm font-normal font-inter rounded-full transition-all capitalize',
                side === s ? 'bg-[#57B75C] text-white shadow-sm' : 'text-[#A1BEAD] hover:text-white'
              )}
            >
              {s === 'buy' ? 'Buy' : 'Sell'}
            </button>
          ))}
        </div>
      </header>

      {/* Form Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          {/* Asset Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium font-manrope text-[#A1BEAD] uppercase tracking-wider">Asset Type</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAssetMenu((v) => !v)}
                className="w-full flex items-center justify-between h-10.5 px-4 bg-[#0E231F] border border-[#1E3D2F] rounded-full text-sm font-manrope text-white hover:border-[#30D158] transition-colors"
              >
                <span>{assetType}</span>
                <ChevronDown className={cn('w-4 h-4 text-[#6B7280] transition-transform', showAssetMenu && 'rotate-180')} />
              </button>
              {showAssetMenu && (
                <ul className="absolute z-10 mt-1 w-full bg-[#0F2A20] border border-[#1E3D2F] rounded-2xl overflow-hidden shadow-lg">
                  {ASSET_TYPES.map((t) => (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() => {
                          setAssetType(t);
                          setShowAssetMenu(false);
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm font-manrope transition-colors hover:bg-[#1E3D2F]',
                          assetType === t ? 'text-[#30D158]' : 'text-white'
                        )}
                      >
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Ticker Symbol */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium font-manrope text-[#A1BEAD] uppercase tracking-wider">Ticker Symbol</label>
            <div className="relative">
              <input
                type="text"
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup(symbolInput)}
                placeholder="e.g. NVDA"
                className="w-full h-10.5 pl-12 pr-10 bg-[#0E231F] border border-[#1E3D2F] rounded-full text-base font-normal text-white uppercase placeholder:text-[#4B5563] placeholder:normal-case placeholder:text-sm placeholder:font-normal focus:outline-none focus:border-[#30D158] transition-colors"
              />
              {/* Ticker badge */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-[#30D158] text-[#0E231F] text-[10px] font-normal font-manrope rounded">
                {symbolInput ? symbolInput[0] : '#'}
              </div>

              {/* Lookup button */}
              <button
                type="button"
                onClick={() => handleLookup(symbolInput)}
                disabled={lookingUp || !symbolInput.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1BEAD] hover:text-[#30D158] disabled:opacity-30 transition-colors"
                aria-label="Look up symbol"
              >
                {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-between px-1 min-h-4">
              <span className="text-xs font-manrope text-[#A1BEAD]">
                {asset?.name ?? (lookingUp ? 'Looking up…' : 'Enter a symbol and press Enter')}
              </span>
              {asset?.price != null && <span className="text-xs font-manrope text-[#30D158]">Last: ${asset.price.toFixed(2)}</span>}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Order Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium font-manrope text-[#A1BEAD] uppercase tracking-wider">Order Type</label>
            <div className="flex gap-2">
              {(['limit', 'market', 'stop'] as OrderType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleOrderTypeChange(t)}
                  className={cn(
                    'flex-1 py-2 rounded-full text-sm font-medium font-manrope transition-colors capitalize',
                    orderType === t
                      ? 'bg-[rgba(43,238,108,0.05)] border border-[#30D158] text-[#30D158]'
                      : 'bg-[#0E231F] border border-[#1E3D2F] text-[#A1BEAD] hover:text-white'
                  )}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Shares & Limit Price */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium font-manrope text-[#A1BEAD] uppercase tracking-wider">Shares</label>
              <input
                type="number"
                min="0"
                step="0.0001"
                placeholder="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full h-10.5 px-4 bg-[#0E231F] border border-[#1E3D2F] rounded-full text-sm font-manrope text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#30D158] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className={cn(
                  'text-xs font-medium font-manrope uppercase tracking-wider transition-colors',
                  orderType == 'market' ? 'text-[#4B5563]' : 'text-[#A1BEAD]'
                )}
              >
                {orderType === 'stop' ? 'Stop Price' : 'Limit Price'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1BEAD] font-manrope text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  disabled={orderType === 'market'}
                  className={cn(
                    'w-full h-10.5 pl-8 pr-4 bg-[#0E231F] border rounded-full text-sm font-manrope text-white placeholder:text-[#4B5563] focus:outline-none transition-colors',
                    orderType === 'market' ? 'border-[#1E3D2F] opacity-40 cursor-not-allowed' : 'border-[#1E3D2F] focus:border-[#30D158]'
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between pt-6 border-t border-[#1E3D2F]">
        <div className="flex flex-col">
          <span className="text-xs font-manrope text-[#A1BEAD]">Estimated Total</span>
          <span className="text-xl font-bold font-manrope text-white">
            {estimatedTotal != null ? `$${estimatedTotal.toFixed(2)}` : '—'}
          </span>
        </div>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placing || !asset || !shares}
          className={cn(
            'flex items-center gap-2 px-8 py-3 font-normal font-manrope rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
            isSell ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#57B75C] hover:bg-[#4ca651] text-white'
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

      {/* Order Review Modal */}
      {asset && (
        <OrderReviewModal
          open={showReview}
          onClose={() => setShowReview(false)}
          onConfirm={confirmOrder}
          placing={placing}
          side={side}
          asset={asset}
          orderType={orderType}
          shares={shares}
          limitPrice={limitPrice}
          estimatedTotal={estimatedTotal}
        />
      )}

      {/* Order Success Modal */}
      {asset && (
        <OrderSuccessModal
          open={showSuccess}
          onClose={() => setShowSuccess(false)}
          onPlaceAnother={handlePlaceAnother}
          side={side}
          asset={asset}
          orderType={orderType}
          shares={shares}
          estimatedTotal={estimatedTotal}
          orderId={orderId}
        />
      )}
    </div>
  );
}

export default QuickTrade;
