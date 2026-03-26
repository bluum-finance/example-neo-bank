import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
