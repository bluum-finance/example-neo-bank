// Simple authentication state management using localStorage

const AUTH_KEY = 'neobank_auth';

export interface User {
  email: string;
  name: string;
  externalAccountId?: string;
  // Contact information
  phoneNumber?: string;
  streetAddress?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Identity information
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  countryOfBirth?: string;
}

export function setAuth(user: User) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getAuth(): User | null {
  const auth = localStorage.getItem(AUTH_KEY);
  return auth ? JSON.parse(auth) : null;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}

// Investment terms acceptance
const INVEST_TERMS_KEY = 'neobank_invest_terms_accepted';

export function hasAcceptedInvestTerms(): boolean {
  const accepted = localStorage.getItem(INVEST_TERMS_KEY);
  return accepted === 'true';
}

export function acceptInvestTerms() {
  localStorage.setItem(INVEST_TERMS_KEY, 'true');
}
