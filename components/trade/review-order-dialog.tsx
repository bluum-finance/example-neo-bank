'use client';

import { Loader2, CheckCircle2, Check, Wallet as WalletIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/hooks/use-currency';
import { marketDisplayLabel } from '@/lib/market';
import type { Order, Wallet } from '@/lib/bluum-api.types';

type Side = 'buy' | 'sell';
type OrderType = 'limit' | 'market';

interface AssetInfo {
  symbol: string;
  name: string;
  price: number | null;
  currency?: string;
  market?: string;
}

interface ReviewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  placing: boolean;
  side: Side;
  orderType: OrderType;
  asset: AssetInfo | null;
  shares: string;
  limitPrice: string;
  estimatedTotal: number | null;
  wallets: Wallet[];
  selectedWalletCurrency: string;
  onSelectWalletCurrency: (currency: string) => void;
  placedOrder?: Order | null;
}

function DataRow({ label, value, accent = false }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] uppercase tracking-widest font-medium text-[#9DB9AB] shrink-0">{label}</span>
      <span className={cn('text-sm font-mono font-medium text-right text-white', accent && 'text-[#30D158]')}>{value}</span>
    </div>
  );
}

const hintClass = 'block text-xs font-mono text-[#9DB9AB]';

export function ReviewOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  placing,
  side,
  orderType,
  asset,
  shares,
  limitPrice,
  estimatedTotal,
  wallets,
  selectedWalletCurrency,
  onSelectWalletCurrency,
  placedOrder,
}: ReviewOrderDialogProps) {
  const { displayAmount, displayAmountInUSD, convertToCurrency } = useCurrency();
  const isBuy = side === 'buy';

  const selectedWallet = wallets.find((w) => w.currency === selectedWalletCurrency) ?? null;
  const walletBalance = selectedWallet ? parseFloat(selectedWallet.balance) : null;
  const walletCurrency = selectedWallet?.currency;

  const assetCurrency = asset?.currency ?? 'USD';
  const sharesLabel = `${parseFloat(shares || '0').toLocaleString()} shares`;
  const limitPriceDisplay =
    orderType === 'limit' && limitPrice ? displayAmount(parseFloat(limitPrice), asset?.currency) : null;

  const crossCurrency = walletCurrency != null && assetCurrency !== walletCurrency;
  const estimatedTotalInWalletCurrency =
    estimatedTotal != null && walletCurrency
      ? (convertToCurrency(estimatedTotal, assetCurrency, walletCurrency) ?? null)
      : null;
  const walletTotalHint =
    crossCurrency && walletCurrency !== 'USD' && estimatedTotalInWalletCurrency != null
      ? displayAmount(estimatedTotalInWalletCurrency, walletCurrency)
      : null;
  const usdEstimatedTotalHint = displayAmountInUSD(estimatedTotal, asset?.currency);
  const walletBalanceUsdHint = displayAmountInUSD(walletBalance, walletCurrency);

  const insufficientFunds =
    isBuy && walletBalance != null && estimatedTotalInWalletCurrency != null && estimatedTotalInWalletCurrency > walletBalance;

  const accentColor = isBuy ? '#30D158' : '#FF453A';
  const accentBg = isBuy ? 'rgba(48,209,88,0.08)' : 'rgba(255,69,58,0.08)';
  const accentBorder = isBuy ? 'rgba(48,209,88,0.2)' : 'rgba(255,69,58,0.2)';
  const succeeded = placedOrder != null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !placing && onOpenChange(false)}>
      <div
        className="w-full max-w-[380px] bg-[#0F2A20] border border-[#1E3D2F] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E3D2F]">
          <h4 className="text-white text-lg font-semibold">{succeeded ? 'Order submitted' : 'Review order'}</h4>
          <button type="button" onClick={() => !placing && onOpenChange(false)} disabled={placing} className="text-[#8DA69B] hover:text-white disabled:opacity-30">
            <X className="w-4 h-4" />
          </button>
        </div>

        {succeeded ? (
          <div className="px-6 pt-7 pb-6 flex flex-col items-center gap-5">
            <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
              <CheckCircle2 className="h-9 w-9" style={{ color: accentColor }} />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">Order placed</p>
              <p className="text-[#9DB9AB] text-sm mt-1">
                {side} {parseFloat(shares).toLocaleString()} {asset?.symbol} · {orderType}
              </p>
              {placedOrder?.id && <p className="text-[#6B7280] text-xs font-mono mt-2">{placedOrder.id}</p>}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white"
              style={{ background: accentColor }}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-5 py-5 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
                <span className="text-sm font-bold" style={{ color: accentColor }}>{asset?.symbol?.[0]}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">{asset?.symbol}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ color: accentColor, background: accentBg }}>
                    {side}
                  </span>
                </div>
                {asset?.name && <p className="text-xs text-[#9DB9AB] truncate">{asset.name}</p>}
                {asset?.market && <p className="text-[10px] text-[#6B7280] uppercase">{marketDisplayLabel(asset.market)}</p>}
              </div>
            </div>

            <div className="h-px bg-[#1E3D2F]" />

            <div className="flex flex-col gap-3">
              <DataRow label="Order type" value={<span className="capitalize">{orderType}</span>} />
              <DataRow label="Quantity" value={sharesLabel} accent />
              {limitPriceDisplay && <DataRow label="Limit price" value={limitPriceDisplay} accent />}
            </div>

            {wallets.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-widest font-medium text-[#9DB9AB] flex items-center gap-1.5">
                  <WalletIcon className="w-3 h-3" />
                  {isBuy ? 'Pay from' : 'Receive into'}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {wallets.map((w) => {
                    const active = w.currency === selectedWalletCurrency;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => onSelectWalletCurrency(w.currency)}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 border transition-all text-left',
                          active ? 'border-[#57B75C]/50' : 'border-[#1F4536] bg-[#07120F] hover:border-[#57B75C]/30'
                        )}
                        style={active ? { background: accentBg, borderColor: accentBorder } : undefined}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#1E3D2F] text-[#A1BEAD]">{w.currency}</span>
                          <span className="text-[11px] font-mono text-[#9DB9AB] tabular-nums">
                            {displayAmount(parseFloat(w.balance), w.currency)}
                          </span>
                        </div>
                        {active && (
                          <span className="flex items-center justify-center h-5 w-5 rounded-full shrink-0" style={{ background: accentColor }}>
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl px-4 py-3.5 flex flex-col gap-2" style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#9DB9AB]">Est. Total</span>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono tabular-nums block text-white">
                    {estimatedTotal != null ? displayAmount(estimatedTotal, asset?.currency) : '—'}
                  </span>
                  {walletTotalHint && <span className={hintClass}>≈ {walletTotalHint}</span>}
                  {usdEstimatedTotalHint && <span className={hintClass}>≈ {usdEstimatedTotalHint}</span>}
                </div>
              </div>
              {isBuy && walletBalance != null && (
                <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: accentBorder }}>
                  <span className="text-[11px] uppercase tracking-widest font-medium text-[#9DB9AB]">Balance</span>
                  <div
                    className={cn(
                      'text-right font-mono font-bold tabular-nums',
                      insufficientFunds ? 'text-red-400' : 'text-[#9DB9AB]'
                    )}
                  >
                    <span className="text-xs">{displayAmount(walletBalance, walletCurrency)}</span>
                    {walletBalanceUsdHint && <span className={cn(hintClass, 'mt-1 opacity-70')}>≈ {walletBalanceUsdHint}</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={placing}
                onClick={() => onOpenChange(false)}
                className="flex-1 h-11 rounded-xl border border-[#1F4536] text-sm font-medium text-[#9DB9AB] hover:text-white transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={placing || insufficientFunds}
                onClick={onConfirm}
                className="flex-2 h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: '#57B75C' }}
              >
                {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${side}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
