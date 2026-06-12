/** Matches `ExternalAccountStatus` on Bluum `/v1` responses. */
export type ExternalAccountStatus =
  | 'onboarding'
  | 'under_review'
  | 'awaiting_documents'
  | 'active'
  | 'suspended'
  | 'closed'
  | 'declined'
  | 'setup_failed';

/** Bluum-native order status on order resources. */
export type ExternalOrderStatus = 'open' | 'pending' | 'filled' | 'partial' | 'cancelled' | 'failed';

/** Order list query `status` filter (GET /investors/{id}/orders). */
export type OrderListStatus = ExternalOrderStatus;

/** Matches transfer statuses surfaced on wallet movements. */
export type ExternalTransferStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';

export type SignedAgreementType = 'investor_agreement' | 'margin_disclosure_acknowledged' | 'w8ben_certification';

export type BluumFundingSourceEnum =
  | 'employment_income'
  | 'investments'
  | 'inheritance'
  | 'business_income'
  | 'savings'
  | 'family';

export type AssetClass =
  | 'equity'
  | 'etf'
  | 'bond'
  | 'bill'
  | 'note'
  | 'mutual_fund'
  | 'derivative'
  | 'cryptocurrency'
  | 'commodity'
  | 'real_estate'
  | 'cash';

export type FlatInvestorAddress = {
  street: string[];
  unit?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
};

export type FlatMoneyRange = { min: string; max: string };

/**
 * Request body for `POST /v1/investors` — flat Bluum-native investor
 * (see `flatInvestorRequestSchema` in bluum-web-api).
 */
export interface NewAccountRequest {
  account_type: 'individual' | 'joint' | 'corporate';
  management_type?: 'self_directed' | 'advised';
  tax_advantaged?: boolean;
  tax_designation?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  tax_id: string;
  tax_id_type: string;
  tax_id_country?: string;
  country_of_citizenship: string;
  country_of_birth: string;
  country_of_tax_residence: string;
  funding_source: BluumFundingSourceEnum[];
  annual_income: FlatMoneyRange;
  liquid_net_worth: FlatMoneyRange;
  total_net_worth?: FlatMoneyRange;
  permanent_resident?: boolean;
  visa_type?: string;
  visa_expiration_date?: string;
  email: string;
  phone: string;
  address: FlatInvestorAddress;
  is_control_person: boolean;
  is_affiliated_exchange_or_finra: boolean;
  is_affiliated_exchange_or_iiroc?: boolean;
  is_politically_exposed: boolean;
  immediate_family_exposed: boolean;
  employment_status: 'employed' | 'unemployed' | 'student' | 'retired';
  employer_name?: string;
  employer_address?: string;
  employment_position?: string;
  affiliated_company?: {
    name?: string;
    address?: string;
    compliance_email?: string;
    ticker?: string;
  };
  signed_agreements?: Array<{ type: SignedAgreementType; signed_at: string; ip_address: string }>;
  trusted_contact?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, string>;
}

export type BluumListResponse<T> = {
  object: 'list';
  url: string;
  has_more: boolean;
  data: T[];
};

export type BluumErrorType =
  | 'invalid_request_error'
  | 'authentication_error'
  | 'permission_error'
  | 'not_found_error'
  | 'conflict_error'
  | 'idempotency_error'
  | 'rate_limit_error'
  | 'api_error';

export interface BluumErrorBody {
  type: BluumErrorType;
  code: string;
  message: string;
  param?: string;
  doc_url?: string;
  request_log_url?: string;
}

export interface BluumApiErrorEnvelope {
  error: BluumErrorBody;
}

/** Stripe-shaped resource: id, object, created, livemode, metadata + domain fields. */
export type BluumResourceEnvelope<TFields extends object> = TFields & {
  id: string;
  object: string;
  created: number | null;
  livemode: boolean;
  metadata: Record<string, unknown>;
};

export interface ComplianceCheckItem {
  workflow_id?: string;
  check_type?: string;
  status: string;
  provider?: string | null;
  external_id?: string | null;
  verification_url?: string | null;
  verification_token?: string | null;
}

/** GET /investors/:id envelope (subset used by demo). */
export interface Account extends BluumResourceEnvelope<{
  status: ExternalAccountStatus;
  account_type?: string;
  balance?: string;
  last_equity?: string;
  currency?: string;
  account_number?: string | null;
  portfolios?: Array<{ id?: string; status?: string }>;
  compliance_checks?: ComplianceCheckItem[];
}> {}

export interface Asset {
  id?: string;
  object?: string;
  livemode?: boolean;
  class?: AssetClass;
  /** @deprecated Use `class` + `country`. Still accepted by Bluum for backwards compatibility. */
  asset_class?: string;
  country?: string | null;
  market?: string;
  symbol?: string;
  name?: string;
  currency?: string;
  status?: 'active' | 'inactive';
  tradable?: boolean;
  marginable?: boolean;
  shortable?: boolean;
  easy_to_borrow?: boolean;
  fractionable?: boolean;
}

/** Asset profile from `GET /assets/{symbol}` (includes optional quote fields per OpenAPI). */
export interface MarketDataAsset extends Asset {
  price?: number;
  change?: number;
  changePercent?: number;
  previousClose?: number;
  bidPrice?: number;
  askPrice?: number;
  price_timestamp?: string | null;
  last_synced_at?: string | null;
  market_name?: string;
  display_name?: string;
}

/** Position resource from `/v1/investors/:id/positions` list. */
export interface Position {
  id: string;
  object?: string;
  investor_id: string;
  symbol: string;
  asset_id?: string;
  currency: string;
  quantity: string;
  average_cost_basis?: string;
  total_cost_basis?: string;
  current_price?: string;
  market_value?: string;
  unrealized_pl?: string;
  unrealized_pl_percent?: string;
  last_transaction_at?: string | null;
  created?: number | null;
}

export interface OrderRequest {
  symbol: string;
  market?: string;
  isin?: string;
  figi?: string;
  class?: AssetClass | string;
  country?: string;
  quantity?: string;
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
  wallet_currency?: string;
  /** Demo trading: debit/credit by bank wallet id (e.g. bank-3168). Ignored by live API. */
  wallet_id?: string;
}

export interface Order extends BluumResourceEnvelope<{
  investor_id: string;
  symbol: string;
  currency?: string;
  quantity?: string;
  notional?: string | null;
  side: string;
  type: string;
  time_in_force: string;
  limit_price?: string | null;
  stop_price?: string | null;
  trail_percent?: string | null;
  trail_price?: string | null;
  extended_hours?: boolean;
  client_order_id?: string | null;
  status: ExternalOrderStatus;
  filled_quantity?: string | null;
  remaining_quantity?: string | null;
  average_price?: string | null;
  commission?: string | null;
  commission_type?: string | null;
  submitted_at?: string | null;
  filled_at?: string | null;
  cancelled_at?: string | null;
  failure_reason?: string | null;
}> {}

export interface Transaction extends BluumResourceEnvelope<{
  investor_id: string;
  wallet_id?: string | null;
  type: string;
  status: string;
  amount: string;
  currency: string;
  method?: string | null;
  description?: string | null;
  balance_before?: string | null;
  balance_after?: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
  failure_reason?: string | null;
}> {}

export type DepositMethod = 'ach' | 'manual_bank_transfer' | 'wire';
export type WithdrawalMethod = 'ach' | 'wire';

export interface ManualBankDetails {
  bank_name?: string;
  bank_address?: string | null;
  account_name?: string;
  account_number?: string;
  routing_number?: string;
  swift_code?: string | null;
  instructions?: string;
}

export interface ManualBankTransferDetails {
  reference_code?: string;
  bank_details?: ManualBankDetails;
  expires_at?: string;
}

export interface AchMethodDetails {
  provider_name?: string;
  transfer_id?: string;
  alpaca_status?: string;
}

export interface WireFundingDetail {
  payment_type?: string;
  currency?: string;
  account_number?: string;
  routing_code?: string;
  bank_name?: string;
}

export interface WireMethodDetails {
  provider_name?: string;
  funding_details?: WireFundingDetail[];
}

export type DepositMethodDetails =
  | AchMethodDetails
  | WireMethodDetails
  | ManualBankTransferDetails
  | Record<string, unknown>;

export interface ExternalDepositResponse extends BluumResourceEnvelope<{
  investor_id?: string;
  wallet_id?: string;
  funding_source_id?: string | null;
  method?: DepositMethod;
  status?: string;
  amount?: string;
  currency?: string;
  description?: string | null;
  method_details?: DepositMethodDetails;
  initiated_at?: string | null;
  received_at?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
  failure_reason?: string | null;
}> {
  /** @deprecated Prefer envelope `id`. */
  deposit_id?: string;
}

/** Bluum API funding source (snake_case envelope). */
export interface BluumFundingSource extends BluumResourceEnvelope<{
  type: 'plaid' | 'manual';
  status: 'active' | 'disconnected' | 'error';
  bank_name: string | null;
  mask: string | null;
  provider_id?: string;
  account_name?: string;
  account_type?: string;
  account_subtype?: string;
  currency?: string | null;
  country?: string | null;
  updated_at?: string;
}> {}

/** UI-normalized funding source (camelCase). */
export interface FundingSource {
  id: string;
  type: 'plaid' | 'manual';
  status: 'active' | 'disconnected' | 'error';
  bankName: string | null;
  mask: string | null;
  providerId?: string;
  accountName?: string;
  accountType?: string;
  accountSubtype?: string;
  currency: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NigerianBank {
  name: string;
  code: string;
}

export interface WithdrawalMethodDetails extends AchMethodDetails, Record<string, unknown> {}

export interface ExternalWithdrawalResponse extends BluumResourceEnvelope<{
  investor_id?: string;
  wallet_id?: string;
  funding_source_id?: string | null;
  method?: WithdrawalMethod;
  status?: string;
  amount?: string;
  currency?: string;
  description?: string | null;
  method_details?: WithdrawalMethodDetails;
  destination_details?: Record<string, unknown>;
  initiated_at?: string | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  failure_reason?: string | null;
}> {
  /** @deprecated Prefer envelope `id`. */
  withdrawal_id?: string;
}

/** @deprecated Use AchMethodDetails / snake_case fields from API. */
export type AlpacaAchDetails = AchMethodDetails & {
  providerName?: string;
  transferId?: string;
  alpacaStatus?: string;
};

/** @deprecated Use WireMethodDetails. */
export type AlpacaWireDetails = WireMethodDetails & {
  providerName?: string;
  fundingDetails?: WireFundingDetail[];
};

/** Wallet resource from `/v1/investors/{id}/wallets` list. */
export interface Wallet extends BluumResourceEnvelope<{
  currency: string;
  balance: string;
  available_balance: string;
  reserved_balance: string;
  cash_withdrawable: string;
  buying_power: string;
  equity: string;
  status: 'active' | 'suspended' | 'closed';
}> {}

/** @deprecated Use WithdrawalMethodDetails. */
export type AlpacaWithdrawalDetails = AchMethodDetails & {
  providerName?: string;
  transferId?: string;
  alpacaStatus?: string;
};

/** @deprecated Use ManualBankTransferDetails with snake_case fields. */
export type LegacyManualBankTransferDetails = ManualBankTransferDetails & {
  referenceCode?: string;
  bankDetails?: ManualBankDetails & {
    bankName?: string;
    bankAddress?: string;
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
    instructions?: string;
  };
  expiresAt?: string;
};
