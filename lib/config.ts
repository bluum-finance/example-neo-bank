export const config = {
  // Frontend configuration
  demoInvestorAccountId: process.env.NEXT_PUBLIC_DEMO_INVESTOR_ACCOUNT_ID || 'a975cd7c-ff3b-4f93-9263-27421bb56ed8',

  // Backend API configuration
  apiBaseUrl: process.env.BLUUM_API_BASE_URL || 'https://test-service.bluumfinance.com/v1',
  apiKey: process.env.BLUUM_API_KEY || '',
  secretKey: process.env.BLUUM_SECRET_KEY || '',
};
