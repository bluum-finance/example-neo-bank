// Investment data

export interface Stock {
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  purchasePrice: number;
  value: number;
  gain: number;
  gainPercent: number;
}

export const stocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 10,
    currentPrice: 175.50,
    purchasePrice: 165.00,
    value: 1755.00,
    gain: 105.00,
    gainPercent: 6.36,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 5,
    currentPrice: 142.30,
    purchasePrice: 150.00,
    value: 711.50,
    gain: -38.50,
    gainPercent: -5.13,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    shares: 8,
    currentPrice: 380.25,
    purchasePrice: 375.00,
    value: 3042.00,
    gain: 42.00,
    gainPercent: 1.40,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 15,
    currentPrice: 245.80,
    purchasePrice: 240.00,
    value: 3687.00,
    gain: 87.00,
    gainPercent: 2.42,
  },
];

// Calculate portfolio totals
export const investmentBalance = stocks.reduce((sum, stock) => sum + stock.value, 0);
export const totalGain = stocks.reduce((sum, stock) => sum + stock.gain, 0);
const totalCost = stocks.reduce((sum, stock) => sum + (stock.purchasePrice * stock.shares), 0);
export const totalGainPercent = totalCost > 0 
  ? (totalGain / totalCost) * 100 
  : 0;

