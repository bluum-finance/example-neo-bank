// Account Types
export interface Account {
  id: string;
  account_number?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  balance?: string;
  crypto_status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  currency: string;
  last_equity: string;
  created_at: string;
  account_type: 'trading' | 'individual' | 'joint' | 'ira' | 'corporate';
  trading_type?: 'margin' | 'cash';
  contact?: {
    email_address: string;
    phone_number?: string;
    street_address: string[];
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  identity?: {
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    country_of_citizenship?: string;
    country_of_birth?: string;
    tax_id_type?: string;
    country_of_tax_residence?: string;
    funding_source?: string[];
  };
}

export interface NewAccountRequest {
  account_type: 'trading' | 'individual' | 'joint' | 'ira' | 'corporate';
  contact: {
    email_address: string;
    phone_number: string;
    street_address: string[];
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  identity: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    tax_id: string;
    tax_id_type: 'SSN' | 'ITIN' | 'EIN' | 'SIN' | 'NINO' | 'TFN' | 'VAT' | 'TIN' | 'OTHER';
    country_of_citizenship: string;
    country_of_birth: string;
    country_of_tax_residence: string;
    funding_source?: ('employment_income' | 'business_income' | 'investment_income' | 'inheritance' | 'gift' | 'other')[];
  };
  disclosures?: {
    is_control_person?: boolean;
    is_affiliated_exchange_or_finra?: boolean;
    is_politically_exposed?: boolean;
    immediate_family_exposed?: boolean;
  };
  agreements?: Array<{
    agreement: 'account_agreement' | 'customer_agreement' | 'margin_agreement' | 'options_agreement' | 'privacy_policy';
    agreed: boolean;
    signed_at: string;
    ip_address: string;
  }>;
}

// Asset Types
export interface Asset {
  id: string;
  class: 'us_equity' | 'crypto' | 'us_option';
  market: string;
  symbol: string;
  name: string;
  status: 'active' | 'inactive';
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
}

// Position Types
export interface Position {
  id: string;
  account_id: string;
  symbol: string;
  asset_id: string;
  quantity: string;
  average_cost_basis: string;
  total_cost_basis: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_pl_percent: string;
  last_transaction_at?: string;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface OrderRequest {
  symbol: string;
  market?: string;
  isin?: string;
  figi?: string;
  qty?: string;
  notional?: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: string;
  stop_price?: string;
  trail_percent?: string;
  trail_price?: string;
  extended_hours?: boolean;
  client_order_id?: string;
  commission?: string;
  commission_type?: 'notional' | 'qty' | 'bps';
}

export interface Order {
  id: string;
  account_id: string;
  symbol: string;
  qty?: string;
  notional?: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: string;
  stop_price?: string;
  status: 'accepted' | 'filled' | 'partially_filled' | 'canceled' | 'rejected';
  filled_qty?: string;
  remaining_qty?: string;
  average_price?: string;
  commission?: string;
  commission_type?: 'notional' | 'qty' | 'bps';
  submitted_at: string;
  filled_at?: string;
  canceled_at?: string;
  reject_reason?: string;
}

// Transaction Types
export interface Transaction {
  transaction_id: string;
  account_id: string;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'processing' | 'settled' | 'failed' | 'canceled';
  amount: string;
  currency: string;
  funding_type: 'fiat' | 'crypto';
  funding_details: FiatFundingDetails | CryptoFundingDetails;
  description?: string;
  external_reference_id?: string;
  fee: string;
  net_amount: string;
  created_at: string;
  settled_at?: string | null;
  failed_at?: string | null;
  failure_reason?: string | null;
}

// Funding Details Types
export interface FiatFundingDetails {
  funding_type: 'fiat';
  fiat_currency: 'USD';
  bank_account_id: string;
  method: 'ach' | 'wire';
}

export interface CryptoFundingDetails {
  funding_type: 'crypto';
  crypto_asset: 'BTC' | 'ETH' | 'USDC' | 'USDT';
  wallet_address: string;
  network: 'Bitcoin' | 'Ethereum' | 'Polygon';
}

// Fund Request (for deposits)
export interface FundRequest {
  amount: string;
  funding_details: FiatFundingDetails | CryptoFundingDetails;
  description?: string;
  external_reference_id?: string;
}

// Withdrawal Request
export interface WithdrawalRequest {
  account_id: string;
  amount: string;
  funding_details: FiatFundingDetails | CryptoFundingDetails;
  description?: string;
  external_reference_id?: string;
}

