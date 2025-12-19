// User account data

export interface UserAccount {
  balance: number;
  accountNumber: string;
  name: string;
  email: string;
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

export const userAccount: UserAccount = {
  balance: 125000.5,
  accountNumber: '1234567890',
  name: 'John Doe',
  email: 'demo@neobank.com',
  externalAccountId: '3c239cde-43c5-47c1-9223-884b17b9ab2e',
  // Contact information
  phoneNumber: '+15555555555',
  streetAddress: ['123 Main St'],
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94102',
  country: 'US',
  // Identity information
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-15',
  countryOfBirth: 'US',
};
