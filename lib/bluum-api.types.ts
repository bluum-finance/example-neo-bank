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

/** Matches `ExternalOrderStatus` on Bluum `/v1` order resources. */
export type ExternalOrderStatus = 'pending' | 'filled' | 'partial' | 'cancelled' | 'failed';

/** Matches `ExternalTransferStatus` where surfaced on wallet movements. */
export type ExternalTransferStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';

export type SignedAgreementType = 'investor_agreement' | 'margin_disclosure_acknowledged' | 'w8ben_certification';

export type BluumFundingSourceEnum =
  | 'employment_income'
  | 'investments'
  | 'inheritance'
  | 'business_income'
  | 'savings'
  | 'family';

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
  checkType?: string;
  check_type?: string;
  status: string;
  provider?: string;
  verificationUrl?: string;
  verification_url?: string;
  verificationToken?: string;
  verification_token?: string;
}

/** Restart workflow + create investor compliance payloads (camelCase from API). */
export interface ComplianceInitiationResponse {
  workflowId?: string;
  workflow_id?: string;
  status?: string;
  complianceChecks?: ComplianceCheckItem[];
  compliance_checks?: ComplianceCheckItem[];
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
  class?: 'us_equity' | 'crypto' | 'us_option';
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

export interface FundRequest {
  amount: string;
  funding_details: FiatFundingDetails | CryptoFundingDetails;
  description?: string;
  external_reference_id?: string;
}

export interface WithdrawalRequest {
  /** Bluum investor id (same as historical `account_id` in demo routes). */
  account_id: string;
  amount: string;
  funding_details: FiatFundingDetails | CryptoFundingDetails;
  description?: string;
  external_reference_id?: string;
}

export type DepositMethod = 'ach' | 'manual_bank_transfer' | 'wire';
export type WithdrawalMethod = 'ach' | 'wire';

export interface ManualBankDetails {
  bankName?: string;
  bankAddress?: string;
  accountName?: string;
  accountNumber?: string;
  accountKind?: string;
  routingNumber?: string;
  swiftCode?: string;
  beneficiaryAddress?: string;
  instructions?: string;
}

export interface ManualBankTransferDetails {
  referenceCode?: string;
  bankDetails?: ManualBankDetails;
  expiresAt?: string;
}

export interface AlpacaAchDetails {
  providerName?: string;
  provider?: string;
  method?: 'ach';
  transferId?: string;
  alpacaStatus?: string;
  externalDepositId?: string;
}

export interface AlpacaWireFundingDetail {
  payment_type?: string;
  currency?: string;
  account_number?: string;
  routing_code?: string;
  bank_name?: string;
}

export interface AlpacaWireDetails {
  providerName?: string;
  provider?: string;
  method?: 'wire';
  fundingDetails?: AlpacaWireFundingDetail[];
}

export type DepositMethodDetails = AlpacaAchDetails | AlpacaWireDetails | ManualBankTransferDetails | Record<string, unknown>;

export interface ExternalDepositResponse extends BluumResourceEnvelope<{
  investor_id?: string;
  wallet_id?: string;
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
  deposit_id?: string;
}

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

export interface AlpacaWithdrawalDetails {
  providerName?: string;
  provider?: string;
  method?: 'ach' | 'wire';
  transferId?: string;
  alpacaStatus?: string;
}

export type WithdrawalMethodDetails = AlpacaWithdrawalDetails | Record<string, unknown>;

export interface ExternalWithdrawalResponse extends BluumResourceEnvelope<{
  investor_id?: string;
  wallet_id?: string;
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
  withdrawal_id?: string;
}
