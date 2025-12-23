// Simple authentication state management using localStorage
const AUTH_KEY = 'neobank_auth';

export interface User {
  email: string;
  name: string;
  externalAccountId?: string;
  phoneNumber?: string;
  streetAddress?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
}

// Helper to check if localStorage is available (client-side only)
function isLocalStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function setAuth(user: User) {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
}

export function getAuth(): User | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  const auth = localStorage.getItem(AUTH_KEY);
  return auth ? JSON.parse(auth) : null;
}

export function clearAuth() {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}

export function setExternalAccountId(accountId: string) {
  const user = getAuth();
  if (user) {
    setAuth({
      ...user,
      externalAccountId: accountId,
    });
  }
}
