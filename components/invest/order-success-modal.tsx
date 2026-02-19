'use client';

import { CheckCheck, ExternalLink } from 'lucide-react';

type Side = 'buy' | 'sell';
type OrderType = 'limit' | 'market' | 'stop';

interface OrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onPlaceAnother: () => void;
  side: Side;
  asset: { symbol: string; name: string };
  orderType: OrderType;
  shares: string;
  estimatedTotal: number | null;
  orderId?: string;
  timestamp?: string;
}

export function OrderSuccessModal({
  open,
  onClose,
  onPlaceAnother,
  side,
  asset,
  orderType,
  shares,
  estimatedTotal,
  orderId = '—',
  timestamp,
}: OrderSuccessModalProps) {
  if (!open) return null;

  const orderTypeLabel = `${orderType.charAt(0).toUpperCase() + orderType.slice(1)} ${side === 'buy' ? 'Buy' : 'Sell'}`;
  const formattedTimestamp =
    timestamp ??
    new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(',', '') ;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0F2A20] border border-[#1E3D2F] rounded-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero section */}
        <div className="flex flex-col items-center justify-center gap-5 px-8 pt-10 pb-8 border-b border-[#1E3D2F]">
          <div className="w-16 flex justify-center py-3 bg-[#1A3A2C] rounded-full">
            <CheckCheck className="w-6.5 h-5 text-[#4ADE80]" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-white text-2xl font-bold font-inter">Order Placed</h3>
            <p className="text-[#8DA69B] text-base font-normal font-inter leading-6 max-w-104.5">
              Your {orderType} {side} order for{' '}
              <span className="text-white font-medium">{asset.symbol}</span> has been
              successfully queued.
            </p>
          </div>
        </div>

        {/* Details section */}
        <div className="flex flex-col gap-6 p-8">
          {/* Primary stats grid */}
          <div className="grid grid-cols-2 gap-y-8">
            <div className="flex flex-col gap-1">
              <span className="text-[#8DA69B] text-xs font-normal font-inter uppercase tracking-wider">
                Order ID
              </span>
              <span className="text-white text-sm font-normal font-inter">{orderId}</span>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[#8DA69B] text-xs font-normal font-inter uppercase tracking-wider">
                Status
              </span>
              <span className="px-2 py-0.5 bg-[#1A3A2C] rounded-lg text-xs font-medium font-inter text-[#93C5FD]">
                Pending Fill
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[#8DA69B] text-xs font-normal font-inter uppercase tracking-wider">
                Estimated Cost
              </span>
              <span className="text-white text-lg font-semibold font-inter leading-7">
                {estimatedTotal != null
                  ? `$${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[#8DA69B] text-xs font-normal font-inter uppercase tracking-wider">
                Shares
              </span>
              <span className="text-white text-lg font-semibold font-inter leading-7">
                {parseFloat(shares).toLocaleString()}
              </span>
            </div>
          </div>

          <hr className="border-[#1E3D2F]" />

          {/* Meta rows */}
          <dl className="flex flex-col gap-3">
            {[
              { label: 'Settlement Currency', value: 'USD' },
              { label: 'Order Type', value: orderTypeLabel },
              { label: 'Timestamp', value: formattedTimestamp },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <dt className="text-[#8DA69B] text-sm font-normal font-inter">{label}</dt>
                <dd className="text-white text-sm font-medium font-inter">{value}</dd>
              </div>
            ))}
          </dl>

          {/* CTAs */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#57B75C] hover:bg-[#4ca651] rounded-full text-white text-base font-semibold font-inter transition-colors"
            >
              View in Recent Trades
              <ExternalLink className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={onPlaceAnother}
              className="w-full py-2 text-[#8DA69B] text-sm font-medium font-inter hover:text-white transition-colors text-center"
            >
              Place another trade
            </button>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <p className="max-w-96 text-center text-xs font-normal font-inter text-[#9CA3AF] leading-4">
        Market orders are executed at the best available price. Settlement typically occurs within
        T+2 business days.
      </p>
    </div>
  );
}
