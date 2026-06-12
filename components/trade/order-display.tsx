import { cn } from '@/lib/utils';
import type { ExternalOrderStatus } from '@/lib/bluum-api.types';

export function OrderStatusBadge({ status }: { status: ExternalOrderStatus | string }) {
  const cfg: Record<string, { label: string; classes: string; dot: string }> = {
    filled: { label: 'Filled', classes: 'text-[#30D158]', dot: 'bg-[#30D158]' },
    partial: { label: 'Partial', classes: 'text-blue-400', dot: 'bg-blue-400' },
    open: { label: 'Open', classes: 'text-sky-400', dot: 'bg-sky-400' },
    pending: { label: 'Pending', classes: 'text-amber-400', dot: 'bg-amber-400' },
    cancelled: { label: 'Cancelled', classes: 'text-[#9DB9AB]', dot: 'bg-[#9DB9AB]/40' },
    failed: { label: 'Failed', classes: 'text-red-400', dot: 'bg-red-400' },
  };

  const { label, classes, dot } = cfg[status] ?? {
    label: status.replace(/_/g, ' '),
    classes: 'text-[#9DB9AB]',
    dot: 'bg-[#9DB9AB]/40',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase', classes)}>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dot)} />
      {label}
    </span>
  );
}

export function formatOrderDate(created?: number | null) {
  if (!created) return '—';
  try {
    const ms = created > 1e12 ? created : created * 1000;
    return new Date(ms).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}
