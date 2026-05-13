import type { Transaction } from '@/lib/bluum-api.types';

/** Human-readable date for activity lists (date + short time when same-day detail helps). */
export function formatTransactionDateTime(tx: Transaction): string {
  const instant = (() => {
    const iso = tx.completed_at || tx.failed_at || null;
    if (iso) {
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) return d;
    }
    if (typeof tx.created === 'number' && tx.created > 0) {
      const d = new Date(tx.created * 1000);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return null;
  })();
  if (!instant) return '—';
  return instant.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatCounterpartyLabel(tx: Transaction): string {
  if (tx.description?.trim()) return tx.description.trim();
  const t = (tx.type || '').toLowerCase();
  if (t === 'deposit') return 'Deposit';
  if (t === 'withdrawal') return 'Withdrawal';
  return tx.type || '—';
}

export function formatMethodLabel(tx: Transaction): string {
  const raw = (tx.method || tx.type || '—').replace(/_/g, ' ');
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function transactionAmountDisplay(tx: Transaction): { text: string; flow: 'in' | 'out' | 'neutral' } {
  const amountNum = tx.amount != null ? parseFloat(String(tx.amount)) : NaN;
  const type = String(tx.type).toLowerCase();
  if (Number.isNaN(amountNum)) {
    return { text: `${tx.amount ?? '—'} ${tx.currency || ''}`.trim(), flow: 'neutral' };
  }
  const isOut = type === 'withdrawal';
  const text = `${isOut ? '−' : '+'}${new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: tx.currency || 'USD',
  }).format(Math.abs(amountNum))}`;
  return { text, flow: isOut ? 'out' : 'in' };
}

export type TxStatusTone = 'success' | 'pending' | 'fail' | 'muted';

export function transactionStatusTone(status: string | undefined): TxStatusTone {
  const s = (status || '').toLowerCase();
  if (['completed', 'received', 'settled'].includes(s)) return 'success';
  if (['failed', 'cancelled', 'canceled', 'rejected', 'expired'].includes(s)) return 'fail';
  if (['pending', 'processing', 'submitted'].includes(s)) return 'pending';
  return 'muted';
}
