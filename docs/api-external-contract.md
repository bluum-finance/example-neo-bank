# Bluum External API Contract

> **Note:** This document is generated from OpenAPI schemas to ensure accuracy. All response structures match the exact schema definitions in `src/external/api/schemas/`.

**Base URL:** `https://api.bluumfinance.com/v1` (Production)  
**Sandbox:** `https://sandbox.api.bluumfinance.com/v1`

**Authentication:** HTTP Basic Auth using API Key (username) and API Secret (password). Base64 encode `API_KEY:API_SECRET` and send in `Authorization` header.

---

## Table of Contents
- [Accounts](#accounts)
- [Documents](#documents)
- [Trading](#trading)
- [Positions](#positions)
- [Assets](#assets)
- [Funding Sources](#funding-sources)
- [Webhooks](#webhooks)
- [Transfers](#transfers)
- [Wealth Management](#wealth-management)

---

## Accounts

### List Accounts
**GET** `/accounts`

**Response (200):**
```json
[
  {
    "id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
    "account_number": "968430933",
    "status": "ACTIVE",
    "currency": "USD",
    "balance": "1000.00",
    "account_type": "trading",
    "contact": { ... },
    "identity": { ... }
  }
]
```

**Error (401):** `{ "code": "BLUM-401-001", "message": "Missing or invalid Authorization header." }`

**Note:** Returns all accounts for authenticated tenant.

---

### Create Account
**POST** `/accounts`

**Request Body:**
```json
{
  "account_type": "trading",
  "contact": {
    "email_address": "john.doe@example.com",
    "phone_number": "+15555555555",
    "street_address": ["123 Main St"],
    "city": "Berkeley",
    "state": "CA",
    "postal_code": "94704",
    "country": "US"
  },
  "identity": {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1980-01-01",
    "tax_id": "123-45-6789",
    "tax_id_type": "SSN",
    "country_of_citizenship": "US",
    "country_of_birth": "US",
    "country_of_tax_residence": "US",
    "funding_source": ["employment_income"]
  },
  "disclosures": {
    "is_control_person": false,
    "is_affiliated_exchange_or_finra": false,
    "is_politically_exposed": false,
    "immediate_family_exposed": false
  },
  "agreements": [
    {
      "agreement": "account_agreement",
      "agreed": true,
      "signed_at": "2025-01-15T10:30:00Z",
      "ip_address": "192.168.1.1"
    }
  ]
}
```

**Response (201):** Account object (same structure as GET)

**Error (400):** `{ "code": "BLUM-400-002", "message": "Required field 'symbol' is missing." }`

**Note:** Account created in PENDING status, requires approval. All required fields must be provided.

---

### Get Account
**GET** `/accounts/{account_id}`

**Response (200):** Account object

**Error (404):** `{ "code": "BLUM-404-001", "message": "Account with ID acc_a1b2c3d4e5f6g7h8 not found." }`

---

### List Account Wallets
**GET** `/accounts/{account_id}/wallets`

**Response (200):**
```json
{
  "wallets": [
    {
      "wallet_id": "w_a1b2c3d4e5f6",
      "currency": "USD",
      "balance": "1500.00",
      "available_balance": "1200.00",
      "reserved_balance": "300.00",
      "status": "active",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Note:** Each wallet holds balance for a specific currency.

---

### List Account Transactions
**GET** `/accounts/{account_id}/transactions`

**Query Parameters:**
- `type` (optional): `deposit` | `withdrawal`
- `status` (optional): `pending` | `processing` | `received` | `completed` | `submitted` | `expired` | `canceled` | `failed`
- `currency` (optional): 3-letter ISO code (e.g., `USD`)
- `date_from` (optional): `YYYY-MM-DD`
- `date_to` (optional): `YYYY-MM-DD`
- `limit` (optional): 1-100, default: 50
- `offset` (optional): default: 0

**Response (200):**
```json
{
  "transactions": [
    {
      "transaction_id": "dep_a1b2c3d4e5f6",
      "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
      "wallet_id": "w_a1b2c3d4e5f6",
      "type": "deposit",
      "status": "completed",
      "amount": "5000.00",
      "currency": "USD",
      "method": "ach_plaid",
      "description": "Initial account funding",
      "created_at": "2025-01-15T10:30:00Z",
      "completed_at": "2025-01-16T14:20:00Z"
    }
  ]
}
```

**Note:** Unified list of deposits and withdrawals. Supports pagination via `limit` and `offset`.

---

## Documents

### Upload Document
**POST** `/documents/accounts/{account_id}/upload`

**Request:** `multipart/form-data`
- `file`: File to upload
- `document_type`: `id_verification` | `proof_of_address` | `w9_form`

**Response (201):**
```json
{
  "document_id": "doc_a1b2c3d4e5f6g7h8",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "document_type": "id_verification",
  "upload_status": "processing",
  "uploaded_at": "2025-01-15T10:30:00Z"
}
```

**Note:** Document processing begins asynchronously. Check status via GET endpoint.

---

### List Documents
**GET** `/documents/accounts/{account_id}/upload`

**Query Parameters:**
- `document_type` (optional): `id_verification` | `proof_of_address` | `w9_form`
- `status` (optional): `processing` | `approved` | `rejected`

**Response (200):** Array of DocumentResponse objects

---

### Get Document
**GET** `/documents/{document_id}`

**Response (200):** DocumentResponse object

---

### Delete Document
**DELETE** `/documents/{document_id}`

**Response (204):** No content

---

## Trading

### Place Order
**POST** `/trading/accounts/{account_id}/orders`

**Request Body:**
```json
{
  "symbol": "AAPL",
  "side": "buy",
  "type": "market",
  "time_in_force": "day",
  "qty": "10",
  "extended_hours": false
}
```

**Order Types:**
- `market`: Market order (requires `qty` or `notional`)
- `limit`: Limit order (requires `limit_price`)
- `stop`: Stop loss (requires `stop_price`)
- `trailing_stop`: Trailing stop (requires `trail_percent`)

**Response (201):**
```json
{
  "id": "ord_x9y8z7a6b5c4d3e2",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "symbol": "AAPL",
  "qty": "10",
  "side": "buy",
  "type": "market",
  "time_in_force": "day",
  "status": "accepted",
  "filled_qty": "0",
  "remaining_qty": "10",
  "average_price": "0.00",
  "submitted_at": "2025-01-15T14:30:00Z"
}
```

**Note:** Use `qty` for shares or `notional` for dollar amount. `client_order_id` optional for tracking.

---

### List Orders
**GET** `/trading/accounts/{account_id}/orders`

**Query Parameters:**
- `status` (optional): `accepted` | `filled` | `partially_filled` | `canceled` | `rejected`
- `symbol` (optional): Filter by symbol
- `side` (optional): `buy` | `sell`
- `limit` (optional): 1-100, default: 50
- `offset` (optional): default: 0

**Response (200):** Array of Order objects

---

### Get Order
**GET** `/trading/orders/{order_id}`

**Response (200):** Order object

---

## Positions

### List Positions
**GET** `/trading/accounts/{account_id}/positions`

**Query Parameters:**
- `symbol` (optional): Filter by symbol
- `non_zero_only` (optional): boolean, default: false
- `refresh_prices` (optional): boolean, default: false (fetches live prices, adds latency)

**Response (200):**
```json
[
  {
    "id": "pos_a1b2c3d4e5f6g7h8",
    "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
    "symbol": "AAPL",
    "quantity": "10.5",
    "average_cost_basis": "175.50",
    "total_cost_basis": "1842.75",
    "current_price": "180.00",
    "market_value": "1890.00",
    "unrealized_pl": "47.25",
    "unrealized_pl_percent": "2.56"
  }
]
```

**Note:** `refresh_prices=true` adds `price_source`, `price_confidence`, and `price_timestamp` fields.

---

### Get Position
**GET** `/trading/accounts/{account_id}/positions/{position_id}`

**Query Parameters:**
- `refresh_prices` (optional): boolean, default: false

**Response (200):** Position object

---

## Assets

### Search Assets
**GET** `/assets/search`

**Query Parameters:**
- `q` (optional): Search query (ticker, name, or partial match)
- `status` (optional): `active` | `inactive`, default: `active`
- `asset_class` (optional): `us_equity` | `crypto` | `us_option`
- `limit` (optional): 1-100, default: 50

**Response (200):**
```json
{
  "data": [
    {
      "id": "b0b6dd9d-8b9b-48b9-bbb8-bbbb49bb1bbb",
      "class": "us_equity",
      "market": "NASDAQ",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "status": "active",
      "tradable": true,
      "marginable": true,
      "shortable": true,
      "easy_to_borrow": true,
      "fractionable": true,
      "currency": "USD"
    }
  ],
  "count": 1
}
```

---

### List Assets
**GET** `/assets/list`

**Query Parameters:**
- `status` (optional): `active` | `inactive`, default: `active`
- `asset_class` (optional): `us_equity` | `crypto` | `us_option`
- `tradable` (optional): boolean

**Response (200):** Array of AssetSearchResult objects

---

### Get Chart Data
**GET** `/assets/chart`

**Query Parameters:**
- `symbol` (required): Asset ticker (e.g., `AAPL`)
- `timeframe` (required): `1Min` | `5Min` | `15Min` | `30Min` | `1Hour` | `1Day` | `1Week` | `1Month`
- `start` (optional): ISO 8601 datetime
- `end` (optional): ISO 8601 datetime
- `limit` (optional): 1-10000, default: 100
- `adjustment` (optional): `raw` | `split` | `dividend` | `all`, default: `raw`
- `feed` (optional): `iex` | `sip` | `otc`, default: `iex`

**Response (200):**
```json
{
  "data": {
    "symbol": "AAPL",
    "bars": [
      {
        "timestamp": "2025-01-15T16:00:00Z",
        "open": 175.25,
        "high": 177.50,
        "low": 174.80,
        "close": 176.75,
        "volume": 5000000,
        "tradeCount": 12500,
        "volumeWeightedAveragePrice": 176.20
      }
    ],
    "nextPageToken": null
  }
}
```

**Note:** Returns historical bar data. Maximum 10000 bars per request.

---

### Get Asset by Symbol
**GET** `/assets/{symbol}`

**Query Parameters:**
- `market` (optional): `XNAS` | `XNYS` | `BATS` | `ARCA` | `OTC` | `XNSA` (hint for faster lookup)

**Response (200):**
```json
{
  "data": {
    "id": "b0b6dd9d-8b9b-48b9-bbb8-bbbb49bb1bbb",
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 178.50,
    "change": 1.50,
    "changePercent": 0.85,
    "previousClose": 177.00,
    "bidPrice": 178.48,
    "askPrice": 178.52
  }
}
```

**Note:** Searches all providers if `market` not provided. Includes current price data.

---

## Funding Sources

### List Funding Sources
**GET** `/accounts/{account_id}/funding-sources`

**Query Parameters:**
- `type` (optional): `plaid` | `all`, default: `all`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "itemId": "item_abc123",
        "institutionId": "ins_123456",
        "institutionName": "Chase Bank",
        "status": "ACTIVE",
        "accounts": [
          {
            "id": "234f5678-f9ac-23e4-b567-537725285115",
            "accountId": "acc_1234567890",
            "accountName": "Checking Account",
            "accountType": "depository",
            "accountSubtype": "checking",
            "mask": "0000"
          }
        ]
      }
    ]
  }
}
```

---

### Create Plaid Link Token
**POST** `/accounts/{account_id}/funding-sources/plaid/link-token`

**Request Body:**
```json
{
  "enable_hosted_link": false
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "link_token": "link-production-abc123def456",
    "hosted_link_url": null
  }
}
```

**Note:** Set `enable_hosted_link: true` for hosted Plaid Link flow. Otherwise use SDK with `link_token`.

---

### Connect Plaid Account
**POST** `/accounts/{account_id}/funding-sources/plaid/connect`

**Request Body:**
```json
{
  "public_token": "public-production-abc123def456"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Account connected successfully",
  "data": {
    "item": { ... }
  }
}
```

**Note:** Exchange Plaid public token for access token. Required before deposits/withdrawals.

---

### Disconnect Funding Source
**DELETE** `/accounts/{account_id}/funding-sources/{id}`

**Query Parameters:**
- `type` (optional): `plaid`, default: `plaid`

**Response (200):**
```json
{
  "status": "success",
  "message": "Funding source disconnected successfully"
}
```

---

## Webhooks

### Get Event Types
**GET** `/webhooks/event-types`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "eventTypes": [
      {
        "name": "order.filled",
        "description": "Order filled"
      }
    ]
  }
}
```

---

### List Webhooks
**GET** `/webhooks`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "webhooks": [
      {
        "webhook_id": "wh_123",
        "name": "Order Notifications",
        "url": "https://example.com/webhook",
        "eventTypeNames": ["order.filled", "order.canceled"],
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

### Create Webhook
**POST** `/webhooks`

**Request Body:**
```json
{
  "name": "Order Notifications",
  "url": "https://example.com/webhook",
  "eventTypeNames": ["order.filled", "order.canceled"],
  "description": "Notify on order events"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "webhook": { ... }
  }
}
```

---

### Update Webhook
**PATCH** `/webhooks/{webhook_id}`

**Request Body:**
```json
{
  "eventTypeNames": ["order.filled"],
  "status": "ACTIVE"
}
```

**Response (200):** Webhook object

---

### Delete Webhook
**DELETE** `/webhooks/{webhook_id}`

**Response (200):**
```json
{
  "status": "success",
  "message": "Webhook deleted successfully"
}
```

---

## Transfers

### Create Deposit
**POST** `/accounts/{account_id}/deposits`

**Headers:**
- `Idempotency-Key` (optional): Unique key for idempotent requests

**Request Body:**
```json
{
  "amount": "5000.00",
  "currency": "USD",
  "method": "ach_plaid",
  "funding_source_id": "123e4567-e89b-12d3-a456-426614174000",
  "description": "Initial deposit"
}
```

**Methods:** `ach_plaid` | `manual_bank_transfer` | `wire`

**Response (201):**
```json
{
  "deposit_id": "dep_a1b2c3d4e5f6",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "amount": "5000.00",
  "currency": "USD",
  "status": "pending",
  "method": "ach_plaid",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Error (409):** Idempotency key already used

**Note:** ACH deposits typically take 1-3 business days. Wire transfers are faster but may have fees.

---

### List Deposits
**GET** `/accounts/{account_id}/deposits`

**Query Parameters:**
- `method` (optional): `ach_plaid` | `manual_bank_transfer` | `wire`
- `status` (optional): `pending` | `processing` | `received` | `completed` | `expired` | `canceled` | `failed`
- `currency` (optional): 3-letter ISO code
- `date_from` (optional): `YYYY-MM-DD`
- `date_to` (optional): `YYYY-MM-DD`
- `limit` (optional): 1-100, default: 50
- `offset` (optional): default: 0

**Response (200):**
```json
{
  "deposits": [ ... ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

---

### Get Deposit
**GET** `/accounts/{account_id}/deposits/{deposit_id}`

**Response (200):** DepositResponse object

---

### Cancel Deposit
**POST** `/accounts/{account_id}/deposits/{deposit_id}/cancel`

**Response (200):** DepositResponse object

**Note:** Only cancellable if status is `pending`.

---

### Create Withdrawal
**POST** `/accounts/{account_id}/withdrawals`

**Headers:**
- `Idempotency-Key` (optional): Unique key for idempotent requests

**Request Body:**
```json
{
  "amount": "1000.00",
  "currency": "USD",
  "method": "ach_plaid",
  "funding_source_id": "123e4567-e89b-12d3-a456-426614174000",
  "description": "Withdrawal to bank"
}
```

**Methods:** `ach_plaid` | `wire`

**Response (201):** WithdrawalResponse object

**Note:** Funds are reserved immediately. ACH withdrawals take 1-3 business days.

---

### List Withdrawals
**GET** `/accounts/{account_id}/withdrawals`

**Query Parameters:** Same as deposits

**Response (200):**
```json
{
  "withdrawals": [ ... ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

### Get Withdrawal
**GET** `/accounts/{account_id}/withdrawals/{withdrawal_id}`

**Response (200):** WithdrawalResponse object

---

### Cancel Withdrawal
**POST** `/accounts/{account_id}/withdrawals/{withdrawal_id}/cancel`

**Response (200):** WithdrawalResponse object

**Note:** Only cancellable if status is `pending`. Releases hold on funds.

---

## Wealth Management

### Goals

#### Create Goal
**POST** `/wealth/accounts/{account_id}/goals`

**Headers:**
- `Idempotency-Key` (optional)

**Request Body:**
```json
{
  "name": "Retirement Fund",
  "goal_type": "retirement",
  "target_amount": "500000.00",
  "target_date": "2045-01-01",
  "priority": 1,
  "monthly_contribution": "500.00"
}
```

**Goal Types:** `retirement` | `education` | `emergency` | `wealth_growth` | `home_purchase` | `custom`

**Response (201):** Goal object

---

#### List Goals
**GET** `/wealth/accounts/{account_id}/goals`

**Query Parameters:**
- `status` (optional): `active` | `completed` | `archived`
- `goal_type` (optional): Filter by type
- `include_projections` (optional): boolean, default: false

**Response (200):**
```json
{
  "goals": [ ... ],
  "total_count": 3
}
```

---

#### Get Goal
**GET** `/wealth/accounts/{account_id}/goals/{goal_id}`

**Query Parameters:**
- `include_projections` (optional): boolean, default: false

**Response (200):** Goal object

---

#### Update Goal
**PUT** `/wealth/accounts/{account_id}/goals/{goal_id}`

**Request Body:** Partial update (only provided fields)

**Response (200):** Goal object

---

#### Delete Goal
**DELETE** `/wealth/accounts/{account_id}/goals/{goal_id}`

**Response (204):** No content

**Note:** Soft delete (sets status to `archived`).

---

### Life Events

#### Create Life Event
**POST** `/wealth/accounts/{account_id}/life-events`

**Request Body:**
```json
{
  "name": "College for Sarah",
  "event_type": "college",
  "expected_date": "2030-09-01",
  "estimated_cost": "100000.00",
  "notes": "4-year university tuition"
}
```

**Event Types:** `college` | `wedding` | `home_purchase` | `retirement` | `major_purchase` | `career_change` | `custom`

**Response (201):** LifeEvent object

---

#### List Life Events
**GET** `/wealth/accounts/{account_id}/life-events`

**Query Parameters:**
- `status` (optional): `active` | `completed` | `archived`
- `event_type` (optional): Filter by type

**Response (200):**
```json
{
  "life_events": [ ... ],
  "total_count": 2
}
```

---

#### Get/Update/Delete Life Event
**GET/PUT/DELETE** `/wealth/accounts/{account_id}/life-events/{event_id}`

Similar to Goals endpoints.

---

### External Accounts

#### Create External Account
**POST** `/wealth/accounts/{account_id}/external-accounts`

**Request Body:**
```json
{
  "name": "Chase Checking",
  "account_type": "checking",
  "is_asset": true,
  "balance": "15000.00",
  "institution": "JPMorgan Chase"
}
```

**Account Types:** `checking` | `savings` | `investment` | `retirement` | `real_estate` | `vehicle` | `loan` | `mortgage` | `credit_card` | `other_asset` | `other_liability`

**Response (201):** ExternalAccount object

---

#### List External Accounts
**GET** `/wealth/accounts/{account_id}/external-accounts`

**Query Parameters:**
- `status` (optional): `active` | `archived`
- `is_asset` (optional): boolean
- `account_type` (optional): Filter by type

**Response (200):**
```json
{
  "external_accounts": [ ... ],
  "total_count": 3
}
```

---

#### Get/Update/Delete External Account
**GET/PUT/DELETE** `/wealth/accounts/{account_id}/external-accounts/{external_account_id}`

Similar to Goals endpoints.

---

### Financial Plan

#### Create/Update Financial Plan
**PUT** `/wealth/accounts/{account_id}/financial-plan`

**Request Body:**
```json
{
  "goals": [ ... ],
  "life_events": [ ... ],
  "external_accounts": [ ... ],
  "income": {
    "total_monthly_income": "12000.00",
    "sources": [ ... ]
  },
  "expenses": {
    "total_monthly_expenses": "8000.00",
    "categories": [ ... ]
  },
  "investment_outlook": {
    "expected_return_rate": "7.00",
    "inflation_assumption": "2.50",
    "risk_capacity": "moderate",
    "tax_bracket": "24"
  }
}
```

**Response (200):** FinancialPlan object

**Note:** Idempotent - creates if not exists, updates if exists.

---

#### Get Financial Plan
**GET** `/wealth/accounts/{account_id}/financial-plan`

**Query Parameters:**
- `include_projections` (optional): boolean, default: false

**Response (200):** FinancialPlan object

---

#### Get Financial Plan Summary
**GET** `/wealth/accounts/{account_id}/financial-plan/summary`

**Response (200):**
```json
{
  "total_net_worth": "275000.00",
  "total_assets": "625000.00",
  "total_liabilities": "350000.00",
  "total_goal_progress": "35.00",
  "goals_on_track": 3,
  "goals_at_risk": 1,
  "monthly_cash_flow": "4000.00",
  "savings_rate": "33.33"
}
```

---

### Investment Policy Statement

#### Create/Update IPS
**PUT** `/wealth/accounts/{account_id}/investment-policy`

**Request Body:**
```json
{
  "risk_profile": {
    "risk_tolerance": "moderate",
    "risk_score": 6,
    "volatility_tolerance": "medium"
  },
  "time_horizon": {
    "years": 15,
    "category": "long_term"
  },
  "investment_objectives": {
    "primary": "capital_appreciation",
    "secondary": ["income_generation", "tax_efficiency"],
    "target_annual_return": "7.00"
  },
  "target_allocation": {
    "equities": {
      "target_percent": "50.00",
      "min_percent": "40.00",
      "max_percent": "60.00"
    },
    "fixed_income": {
      "target_percent": "25.00",
      "min_percent": "20.00",
      "max_percent": "30.00"
    }
  },
  "constraints": {
    "liquidity_requirements": {
      "minimum_cash_percent": "5.00",
      "emergency_fund_months": 6
    },
    "tax_considerations": {
      "tax_loss_harvesting": true,
      "tax_bracket": "24"
    },
    "restrictions": {
      "excluded_sectors": ["tobacco", "gambling"],
      "esg_screening": true
    },
    "rebalancing_policy": {
      "frequency": "quarterly",
      "threshold_percent": "5.00",
      "tax_aware": true
    }
  }
}
```

**Response (200):** InvestmentPolicyStatement object

**Error (400):** Target allocation must sum to 100%

**Note:** Creates new version on update. Previous versions marked as superseded.

---

#### Get IPS
**GET** `/wealth/accounts/{account_id}/investment-policy`

**Query Parameters:**
- `version` (optional): Get specific version (default: latest)
- `include_history` (optional): boolean, default: false

**Response (200):** InvestmentPolicyStatement object (with optional version_history)

---

#### Validate Portfolio Against IPS
**POST** `/wealth/accounts/{account_id}/investment-policy/validate`

**Request Body:**
```json
{
  "portfolio_id": "port_a1b2c3d4e5f6"
}
```

**Response (200):**
```json
{
  "is_compliant": false,
  "validation_results": {
    "allocation_compliance": {
      "compliant": false,
      "deviations": [
        {
          "asset_class": "equities",
          "target_percent": "50.00",
          "current_percent": "62.00",
          "deviation": "12.00",
          "within_bands": false
        },
        {
          "asset_class": "fixed_income",
          "target_percent": "25.00",
          "current_percent": "20.00",
          "deviation": "-5.00",
          "within_bands": true
        }
      ]
    },
    "restriction_compliance": {
      "compliant": true,
      "violations": []
    },
    "liquidity_compliance": {
      "compliant": true,
      "current_cash_percent": "8.00",
      "required_cash_percent": "5.00"
    }
  },
  "recommended_actions": [
    {
      "action_type": "rebalance",
      "description": "Reduce equity allocation by 12%",
      "priority": "high"
    }
  ],
  "validated_at": "2025-01-15T16:00:00Z"
}
```

**Note:** `validation_results` includes `allocation_compliance`, `restriction_compliance`, and `liquidity_compliance`. All three are always present.

---

### Portfolio Management

#### Get Portfolio Summary
**GET** `/wealth/accounts/{account_id}/portfolios/{portfolio_id}/summary`

**Query Parameters:**
- `refresh_prices` (optional): boolean, default: false

**Response (200):**
```json
{
  "portfolio_id": "port_a1b2c3d4e5f6",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "name": "Main Portfolio",
  "currency": "USD",
  "valuation": {
    "total_value": "125000.00",
    "cash_value": "10000.00",
    "positions_value": "115000.00",
    "unrealized_gain_loss": "15000.00",
    "unrealized_gain_loss_percent": "13.64",
    "as_of": "2025-01-15T16:00:00Z"
  },
  "allocation": {
    "by_asset_class": [
      {
        "asset_class": "equities",
        "value": "62500.00",
        "percent": "50.00"
      },
      {
        "asset_class": "fixed_income",
        "value": "31250.00",
        "percent": "25.00"
      }
    ],
    "by_sector": [
      {
        "sector": "technology",
        "value": "25000.00",
        "percent": "20.00"
      }
    ]
  },
  "rebalancing_status": {
    "needs_rebalancing": false,
    "last_rebalanced_at": "2024-10-01T10:00:00Z",
    "next_scheduled": "2025-01-15",
    "max_deviation_percent": "3.50"
  },
  "strategy_application": {
    "strategy_id": "strat_123456",
    "strategy_version_id": "sv_789012",
    "applied_at": "2024-01-01T10:00:00Z",
    "status": "active"
  },
  "linked_goals": [
    {
      "goal_id": "goal_1234567890",
      "name": "Retirement Fund"
    }
  ],
  "created_at": "2023-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

#### Get Portfolio Holdings
**GET** `/wealth/accounts/{account_id}/portfolios/{portfolio_id}/holdings`

**Query Parameters:**
- `refresh_prices` (optional): boolean, default: false
- `include_lots` (optional): boolean, default: false
- `group_by` (optional): `asset_class` | `sector` | `none`, default: `none`

**Response (200):**
```json
{
  "portfolio_id": "port_a1b2c3d4e5f6",
  "currency": "USD",
  "as_of": "2025-01-15T16:00:00Z",
  "cash": {
    "balance": "10000.00",
    "available": "9500.00",
    "reserved": "500.00"
  },
  "holdings": [
    {
      "position_id": "pos_001",
      "asset_id": "asset_vti",
      "symbol": "VTI",
      "name": "Vanguard Total Stock Market ETF",
      "asset_class": "equities",
      "sector": "diversified",
      "quantity": "100.00",
      "average_cost_basis": "200.00",
      "total_cost_basis": "20000.00",
      "current_price": "225.00",
      "market_value": "22500.00",
      "unrealized_pl": "2500.00",
      "unrealized_pl_percent": "12.50",
      "weight_percent": "18.00",
      "price_source": "ALPACA",
      "price_confidence": "REAL_TIME",
      "price_timestamp": "2025-01-15T15:59:00Z"
    }
  ],
  "totals": {
    "total_value": "125000.00",
    "total_cost_basis": "100000.00",
    "total_unrealized_pl": "25000.00",
    "total_unrealized_pl_percent": "25.00"
  }
}
```

**Note:** `price_source`, `price_confidence`, and `price_timestamp` are only included when `refresh_prices=true`. `include_lots=true` adds tax lot details to holdings.

---

#### Get Portfolio Performance
**GET** `/wealth/accounts/{account_id}/portfolios/{portfolio_id}/performance`

**Query Parameters:**
- `period` (optional): `1d` | `1w` | `1m` | `3m` | `6m` | `ytd` | `1y` | `3y` | `5y` | `all`, default: `1y`
- `start_date` (optional): `YYYY-MM-DD` (overrides period)
- `end_date` (optional): `YYYY-MM-DD`
- `benchmark` (optional): Benchmark symbol (e.g., `SPY`)

**Response (200):**
```json
{
  "portfolio_id": "port_a1b2c3d4e5f6",
  "period": {
    "start_date": "2024-01-15",
    "end_date": "2025-01-15",
    "label": "1y"
  },
  "returns": {
    "time_weighted_return": "12.50",
    "money_weighted_return": "11.80",
    "total_return": "15000.00",
    "annualized_return": "12.50"
  },
  "benchmark_comparison": {
    "benchmark_symbol": "SPY",
    "benchmark_name": "S&P 500 ETF",
    "benchmark_return": "10.20",
    "alpha": "2.30",
    "tracking_error": "3.50"
  },
  "risk_metrics": {
    "volatility": "14.50",
    "sharpe_ratio": "0.86",
    "max_drawdown": "-8.20",
    "max_drawdown_date": "2024-08-05",
    "beta": "0.95"
  },
  "period_breakdown": {
    "starting_value": "100000.00",
    "ending_value": "125000.00",
    "net_contributions": "10000.00",
    "net_withdrawals": "0.00",
    "investment_gains": "15000.00",
    "dividends_received": "2500.00",
    "fees_paid": "250.00"
  },
  "value_history": [
    {
      "date": "2024-01-15",
      "value": "100000.00"
    },
    {
      "date": "2024-07-15",
      "value": "110000.00"
    },
    {
      "date": "2025-01-15",
      "value": "125000.00"
    }
  ]
}
```

**Note:** `benchmark_comparison` is only included when a `benchmark` query parameter is provided. `value_history` may be empty or limited based on available data. All monetary values are strings to preserve precision.

---

#### Get Rebalancing Analysis
**GET** `/wealth/accounts/{account_id}/portfolios/{portfolio_id}/rebalancing`

**Response (200):**
```json
{
  "portfolio_id": "port_a1b2c3d4e5f6",
  "analysis_timestamp": "2025-01-15T16:00:00Z",
  "needs_rebalancing": true,
  "rebalancing_reason": "allocation_drift",
  "current_allocation": {
    "equities": {
      "target": "50.00",
      "actual": "58.00",
      "drift": "8.00"
    },
    "fixed_income": {
      "target": "25.00",
      "actual": "22.00",
      "drift": "-3.00"
    },
    "treasury": {
      "target": "20.00",
      "actual": "17.00",
      "drift": "-3.00"
    },
    "alternatives": {
      "target": "5.00",
      "actual": "3.00",
      "drift": "-2.00"
    }
  },
  "recommended_trades": [
    {
      "action": "sell",
      "symbol": "VTI",
      "asset_class": "equities",
      "quantity": "25.00",
      "notional": "5625.00",
      "reason": "Reduce equity overweight"
    },
    {
      "action": "buy",
      "symbol": "BND",
      "asset_class": "fixed_income",
      "quantity": "30.00",
      "notional": "2340.00",
      "reason": "Increase fixed income allocation"
    }
  ],
  "tax_impact": {
    "estimated_short_term_gains": "500.00",
    "estimated_long_term_gains": "1200.00",
    "tax_loss_harvesting_available": true,
    "harvestable_losses": "300.00"
  },
  "last_rebalanced_at": "2024-10-01T10:00:00Z"
}
```

---

#### Execute Rebalance
**POST** `/wealth/accounts/{account_id}/portfolios/{portfolio_id}/rebalancing`

**Headers:**
- `Idempotency-Key` (required)

**Request Body:**
```json
{
  "execution_type": "full",
  "tax_aware": true,
  "exclude_positions": []
}
```

**Response (202):**
```json
{
  "rebalance_id": "reb_a1b2c3d4e5f6",
  "portfolio_id": "port_a1b2c3d4e5f6",
  "status": "pending",
  "execution_type": "full",
  "trade_plan_id": "tp_789012345678",
  "estimated_trades": 4,
  "estimated_completion": "2025-01-15T16:30:00Z",
  "created_at": "2025-01-15T16:00:00Z"
}
```

**Error (409):** Portfolio has active rebalancing in progress

---

### Auto-Invest

#### Create Auto-Invest Schedule
**POST** `/wealth/accounts/{account_id}/auto-invest`

**Request Body:**
```json
{
  "name": "Monthly Investment",
  "portfolio_id": "port_a1b2c3d4e5f6",
  "funding_source_id": "fs_123456789",
  "amount": "500.00",
  "currency": "USD",
  "frequency": "monthly",
  "schedule": {
    "day_of_month": 15,
    "time": "09:30"
  },
  "allocation_rule": "ips_target",
  "start_date": "2025-02-15"
}
```

**Frequencies:** `weekly` | `biweekly` | `monthly` | `quarterly`

**Allocation Rules:** `ips_target` | `custom`

**Response (201):** AutoInvestSchedule object

---

#### List Auto-Invest Schedules
**GET** `/wealth/accounts/{account_id}/auto-invest`

**Query Parameters:**
- `status` (optional): `active` | `paused` | `completed` | `cancelled`
- `portfolio_id` (optional): Filter by portfolio

**Response (200):**
```json
{
  "schedules": [ ... ],
  "total_count": 2
}
```

---

#### Get/Update/Delete Auto-Invest Schedule
**GET/PATCH/DELETE** `/wealth/accounts/{account_id}/auto-invest/{schedule_id}`

**Pause:** `POST /wealth/accounts/{account_id}/auto-invest/{schedule_id}/pause`  
**Resume:** `POST /wealth/accounts/{account_id}/auto-invest/{schedule_id}/resume`

---

#### Configure DRIP
**PUT** `/wealth/accounts/{account_id}/portfolios/{portfolio_id}/drip`

**Request Body:**
```json
{
  "enabled": true,
  "reinvestment_rule": "same_security",
  "minimum_amount": "10.00",
  "cash_sweep_enabled": true,
  "cash_sweep_threshold": "100.00"
}
```

**Reinvestment Rules:** `same_security` | `portfolio_allocation` | `custom`

**Response (200):** DripConfiguration object

---

#### Get DRIP Configuration
**GET** `/wealth/accounts/{account_id}/portfolios/{portfolio_id}/drip`

**Response (200):** DripConfiguration object

---

### Insights & Recommendations

#### Get Insights
**GET** `/wealth/accounts/{account_id}/insights`

**Query Parameters:**
- `category` (optional): `all` | `opportunity` | `risk` | `tax` | `rebalancing`, default: `all`
- `limit` (optional): 1-50, default: 10

**Response (200):**
```json
{
  "insights": [
    {
      "insight_id": "ins_001",
      "category": "tax",
      "title": "Tax Optimization Opportunity",
      "summary": "You have $2,500 in unrealized losses",
      "priority": "high",
      "action": {
        "type": "tax_loss_harvest",
        "description": "Harvest losses in VTI position"
      }
    }
  ]
}
```

---

#### Get Recommendations
**GET** `/wealth/accounts/{account_id}/recommendations`

**Query Parameters:**
- `type` (optional): `allocation` | `security` | `strategy` | `all`, default: `all`
- `goal_id` (optional): Filter by goal

**Response (200):**
```json
{
  "recommendations": [
    {
      "recommendation_id": "rec_001",
      "type": "allocation",
      "title": "Increase International Exposure",
      "rationale": "Portfolio is underweight international",
      "confidence": "high",
      "suggested_actions": [
        {
          "action": "buy",
          "symbol": "VXUS",
          "target_allocation": "10"
        }
      ]
    }
  ]
}
```

---

#### Get Tax Optimization
**GET** `/wealth/accounts/{account_id}/tax-optimization`

**Query Parameters:**
- `tax_year` (optional): integer (default: current year)

**Response (200):**
```json
{
  "tax_year": 2025,
  "tax_summary": {
    "estimated_short_term_gains": "5000.00",
    "estimated_long_term_gains": "15000.00",
    "harvestable_losses": "3500.00"
  },
  "opportunities": [
    {
      "type": "tax_loss_harvest",
      "title": "Tax Loss Harvesting",
      "estimated_tax_savings": "875.00",
      "positions": [ ... ]
    }
  ]
}
```

---

#### AI Assistant Chat
**POST** `/wealth/accounts/{account_id}/assistant/chat`

**Request Body:**
```json
{
  "message": "What's my current allocation and should I rebalance?",
  "context": {
    "portfolio_id": "port_a1b2c3d4e5f6",
    "include_positions": true
  }
}
```

**Response (200):**
```json
{
  "response_id": "resp_a1b2c3d4e5f6",
  "message": "Based on your Investment Policy Statement...",
  "suggestions": [
    {
      "type": "action",
      "label": "View Rebalancing Trades",
      "action_url": "/wealth/accounts/{account_id}/portfolios/{portfolio_id}/rebalancing"
    }
  ],
  "context_used": ["portfolio_summary", "ips", "positions"]
}
```

---

### Reports

#### Get Account Statement
**GET** `/wealth/accounts/{account_id}/statements`

**Query Parameters:**
- `period` (optional): `monthly` | `quarterly` | `annual` | `custom`, default: `monthly`
- `start_date` (optional): `YYYY-MM-DD` (for custom)
- `end_date` (optional): `YYYY-MM-DD` (for custom)
- `format` (optional): `json` | `pdf`, default: `json`

**Response (200):**
```json
{
  "statement_id": "stmt_a1b2c3d4e5f6",
  "period": {
    "start_date": "2024-10-01",
    "end_date": "2024-12-31",
    "label": "Q4 2024"
  },
  "summary": {
    "beginning_value": "100000.00",
    "ending_value": "110000.00",
    "net_change": "10000.00"
  },
  "activity": {
    "deposits": [ ... ],
    "withdrawals": [ ... ],
    "trades": [ ... ],
    "dividends": [ ... ]
  },
  "holdings_end_of_period": [ ... ]
}
```

**Note:** PDF format returns binary file.

---

#### Get P&L Report
**GET** `/wealth/accounts/{account_id}/reports/pnl`

**Query Parameters:**
- `start_date` (optional): `YYYY-MM-DD`
- `end_date` (optional): `YYYY-MM-DD`
- `realized_only` (optional): boolean, default: false

**Response (200):**
```json
{
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "summary": {
    "total_pnl": "25000.00",
    "realized_pnl": "10000.00",
    "unrealized_pnl": "15000.00",
    "dividend_income": "3000.00",
    "interest_income": "500.00",
    "fees_paid": "300.00"
  },
  "realized_gains_losses": {
    "short_term_gains": "3000.00",
    "short_term_losses": "-500.00",
    "long_term_gains": "8000.00",
    "long_term_losses": "-500.00",
    "net_realized": "10000.00"
  },
  "by_position": [
    {
      "symbol": "AAPL",
      "realized_pnl": "2500.00",
      "unrealized_pnl": "5000.00",
      "dividend_income": "500.00"
    }
  ],
  "by_asset_class": [
    {
      "asset_class": "equities",
      "pnl": "20000.00",
      "pnl_percent": "15.00"
    }
  ]
}
```

---

#### Get Benchmark Report
**GET** `/wealth/accounts/{account_id}/reports/benchmark`

**Query Parameters:**
- `benchmarks` (optional): Comma-separated symbols (e.g., `SPY,AGG`)
- `period` (optional): `1m` | `3m` | `6m` | `ytd` | `1y` | `3y` | `5y`, default: `1y`

**Response (200):**
```json
{
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "period": "1y",
  "portfolio_return": "12.50",
  "comparisons": [
    {
      "benchmark": "SPY",
      "name": "S&P 500 ETF",
      "return": "10.20",
      "alpha": "2.30",
      "correlation": "0.92",
      "beta": "0.95",
      "tracking_error": "3.50"
    },
    {
      "benchmark": "AGG",
      "name": "Bloomberg US Aggregate Bond",
      "return": "5.10",
      "alpha": "7.40",
      "correlation": "0.35",
      "beta": "0.20",
      "tracking_error": "12.00"
    }
  ],
  "chart_data": {
    "dates": [
      "2024-01-15",
      "2024-04-15",
      "2024-07-15",
      "2024-10-15",
      "2025-01-15"
    ],
    "portfolio": [100, 103.5, 107.2, 109.8, 112.5],
    "benchmarks": {
      "SPY": [100, 102.8, 105.5, 108.1, 110.2],
      "AGG": [100, 101.2, 102.5, 103.8, 105.1]
    }
  }
}
```

---

## Error Codes

All errors follow this format:
```json
{
  "code": "BLUM-XXX-XXX",
  "message": "Human-readable error message"
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request - Invalid input or validation error
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Access denied
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Idempotency key already used or resource conflict
- `500`: Internal Server Error - Server-side error

---

## Pagination

List endpoints support pagination via query parameters:
- `limit`: Maximum items per page (typically 1-100)
- `offset`: Number of items to skip

**Example:**
```
GET /accounts/{account_id}/transactions?limit=20&offset=40
```

---

## Idempotency

For POST/PUT endpoints that modify state, include `Idempotency-Key` header:
```
Idempotency-Key: unique-key-12345
```

If the same key is used twice, the original response is returned (409 Conflict if key already processed).

---

## Rate Limits

Rate limits apply per API key. Check response headers:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Webhooks

Webhooks deliver events asynchronously. Configure via `/webhooks` endpoints.

**Event Payload Example:**
```json
{
  "event_type": "order.filled",
  "timestamp": "2025-01-15T14:30:00Z",
  "data": {
    "order_id": "ord_123",
    "account_id": "acc_456",
    "symbol": "AAPL",
    "filled_qty": "10"
  }
}
```

Your webhook endpoint must return `200 OK` within 5 seconds or the event will be retried.

---

## Date Formats

- **Date:** `YYYY-MM-DD` (e.g., `2025-01-15`)
- **DateTime:** ISO 8601 format (e.g., `2025-01-15T14:30:00Z`)
- **Time:** `HH:MM` in 24-hour format (e.g., `09:30`)

---

## Currency

All monetary amounts are strings to preserve precision. Use decimal arithmetic in your application.

**Example:**
```json
{
  "amount": "1000.50",
  "balance": "50000.00"
}
```

---

## Notes

1. **Authentication:** Always include Authorization header with Base64-encoded credentials
2. **Account IDs:** All account IDs are UUIDs
3. **Status Fields:** Check status fields before taking action (e.g., order status, deposit status)
4. **Async Operations:** Some operations (deposits, withdrawals, orders) are asynchronous - poll or use webhooks
5. **Price Refresh:** Use `refresh_prices=true` sparingly as it adds latency
6. **Pagination:** Always handle pagination for list endpoints
7. **Error Handling:** Check error codes and messages for specific guidance
8. **Idempotency:** Use idempotency keys for critical operations to prevent duplicates
