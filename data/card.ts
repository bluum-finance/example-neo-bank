// Card data

export interface Card {
  id: string;
  type: 'virtual' | 'physical';
  last4: string;
  expiryDate: string;
  status: 'active' | 'frozen' | 'expired';
  spendingLimit?: number;
  cardholderName: string;
}

export const cards: Card[] = [
  {
    id: '1',
    type: 'physical',
    last4: '4567',
    expiryDate: '12/25',
    status: 'active',
    spendingLimit: 100000,
    cardholderName: 'John Doe',
  },
  {
    id: '2',
    type: 'virtual',
    last4: '8901',
    expiryDate: '06/26',
    status: 'active',
    cardholderName: 'John Doe',
  },
];

