import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function isBluumList(body: unknown): body is { object: 'list'; data: unknown[] } {
  return (
    body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    (body as Record<string, unknown>).object === 'list' &&
    Array.isArray((body as Record<string, unknown>).data)
  );
}

/** Unwrap Bluum/Stripe-style `{ object: 'list', data: [...] }` or pass through arrays. */
export function unwrapList<T>(body: unknown, fallback: T[] = []): T[] {
  if (isBluumList(body)) return body.data as T[];
  if (Array.isArray(body)) return body as T[];
  return fallback;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Sets or replaces a query parameter on an absolute URL string. */
export function appendParamToUrl(url: string, paramKey: string, paramValue: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set(paramKey, paramValue);
    return u.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}${encodeURIComponent(paramKey)}=${encodeURIComponent(paramValue)}`;
  }
}

/** `{origin}/invest` for post-verification redirect (same host/port as the app). */
export function getInvestRedirectUri(): string {
  if (typeof window === 'undefined') return '';
  return new URL('/invest', window.location.origin).href;
}
