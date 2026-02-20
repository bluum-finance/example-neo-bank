'use client';

import { Loader2, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Side = 'buy' | 'sell';
type OrderType = 'limit' | 'market' | 'stop';

interface OrderReviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  placing: boolean;
  side: Side;
  asset: { symbol: string; name: string; price: number | null };
  orderType: OrderType;
  shares: string;
  limitPrice: string;
  estimatedTotal: number | null;
}

export function OrderReviewModal({
  open,
  onClose,
  onConfirm,
  placing,
  side,
  asset,
  orderType,
  shares,
  limitPrice,
  estimatedTotal,
}: OrderReviewModalProps) {
  if (!open) return null;

  const isBuy = side === 'buy';
  const orderTypeLabel = orderType === 'limit' ? 'Limit Order' : orderType === 'stop' ? 'Stop Order' : 'Market Order';
  const priceLabel = orderType === 'stop' ? 'Stop Price' : 'Limit Price';
  const showPrice = orderType !== 'market' && limitPrice;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => !placing && onClose()}
    >
      <div
        className="w-full max-w-111.5 bg-[#0F2A20] border border-[#1E3D2F] rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E3D2F]">
          <h4 className="text-white text-lg font-semibold font-inter">Review Order</h4>
          <button
            type="button"
            onClick={onClose}
            disabled={placing}
            className="text-[#8DA69B] hover:text-white transition-colors disabled:opacity-30"
            aria-label="Close"
          >
            <X className="w-[11.64px] h-[11.64px]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col gap-6 p-6">
          {/* Asset + Side Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Ticker badge */}
              <div className="w-12 h-12 rounded-xl bg-[rgba(20,83,45,0.30)] border border-[rgba(22,101,52,0.50)] flex items-center justify-center shrink-0">
                <span className="text-[#4ADE80] text-sm font-bold font-inter">
                  {asset.symbol[0]}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white text-xl font-bold font-inter leading-7">{asset.symbol}</span>
                <span className="text-[#8DA69B] text-sm font-normal font-inter">{asset.name}</span>
              </div>
            </div>
            {/* Buy/Sell badge */}
            <div
              className={cn(
                'px-2.5 py-0.5 rounded-lg text-xs font-medium font-inter',
                isBuy
                  ? 'bg-[rgba(20,83,45,0.30)] text-[#4ADE80]'
                  : 'bg-[rgba(127,29,29,0.30)] text-red-400'
              )}
            >
              {isBuy ? 'Buy' : 'Sell'}
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="p-4 bg-[#0E231F] rounded-xl border border-[#1E3D2F]">
            <div className="grid grid-cols-2 gap-y-7">
              {/* Order Type */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#8DA69B] font-normal font-inter">Order Type</span>
                <span className="text-sm font-semibold font-inter text-white">{orderTypeLabel}</span>
              </div>
              {/* Shares */}
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs text-[#8DA69B] font-normal font-inter">Shares</span>
                <span className="text-sm font-semibold font-inter text-white">{parseFloat(shares).toFixed(4)}</span>
              </div>
              {/* Limit / Stop Price */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#8DA69B] font-normal font-inter">{priceLabel}</span>
                <span className="text-sm font-semibold font-inter text-white">
                  {showPrice ? `$${parseFloat(limitPrice).toFixed(2)}` : '—'}
                </span>
              </div>
              {/* Estimated Total */}
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs text-[#8DA69B] font-normal font-inter">Estimated Total</span>
                <span className="text-lg font-bold font-inter text-white leading-7">
                  {estimatedTotal != null ? `$${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-3 bg-[#124031] rounded-xl border border-[#1E3D2F]">
            <Info className="w-3 h-3 text-[#8DA69B] mt-0.5 shrink-0" />
            <p className="text-xs text-[#8DA69B] font-normal font-inter leading-relaxed">
              This order will be executed subject to market conditions. The final price may vary slightly from the estimated total.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#1E3D2F]">
          <button
            type="button"
            onClick={onClose}
            disabled={placing}
            className="px-5 py-2.5 bg-[#0F2A20] border border-[#1E3D2F] rounded-full text-sm font-medium font-inter text-[#8DA69B] hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
          >
            Edit Order
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={placing}
            className={cn(
              'flex items-center gap-2 px-5 py-[10.5px] rounded-full text-sm font-medium font-inter text-white shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
              isBuy ? 'bg-[#57B75C] hover:bg-[#4ca651]' : 'bg-red-500 hover:bg-red-600'
            )}
          >
            {placing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Placing…</>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
