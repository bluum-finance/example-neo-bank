// Card data

export interface Card {
  id: string;
  cardholderName: string;
  last4: string;
  type: 'physical' | 'virtual';
  accountName: string;
  spentThisMonth: number;
  expiryDate: string;
  status: 'active' | 'frozen' | 'expired';
}

export const cards: Card[] = [
  {
    id: '1',
    cardholderName: 'Tosin Oladokun',
    last4: '3295',
    type: 'physical',
    accountName: 'Checking ••3168',
    spentThisMonth: 0.00,
    expiryDate: '12/25',
    status: 'active',
  },

];

