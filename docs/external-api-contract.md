# API Contract: Bluum Finance Investment API

> Generated: March 2, 2026  
> Source: External B2B API (/v1/*)

## Table of Contents

- [Authentication](#authentication)
- [Accounts](#accounts)
  - [GET /accounts](#get-accounts)
  - [POST /accounts](#post-accounts)
  - [GET /accounts/{account_id}](#get-accountsaccount_id)
  - [GET /accounts/{account_id}/wallets](#get-accountsaccount_idwallets)
  - [GET /accounts/{account_id}/transactions](#get-accountsaccount_idtransactions)
- [Trading](#trading)
  - [POST /trading/accounts/{account_id}/orders](#post-tradingaccountsaccount_idorders)
  - [GET /trading/accounts/{account_id}/orders](#get-tradingaccountsaccount_idorders)
  - [GET /trading/orders/{order_id}](#get-tradingordersorder_id)
- [Positions](#positions)
  - [GET /trading/accounts/{account_id}/positions](#get-tradingaccountsaccount_idpositions)
  - [GET /trading/accounts/{account_id}/positions/{position_id}](#get-tradingaccountsaccount_idpositionsposition_id)
- [Assets](#assets)
  - [GET /assets/search](#get-assetssearch)
  - [GET /assets/list](#get-assetslist)
  - [GET /assets/chart](#get-assetschart)
  - [GET /assets/{symbol}](#get-assetssymbol)
- [Documents](#documents)
  - [POST /documents/accounts/{account_id}/upload](#post-documentsaccountsaccount_idupload)
  - [GET /documents/accounts/{account_id}/upload](#get-documentsaccountsaccount_idupload)
  - [GET /documents/{document_id}](#get-documentsdocument_id)
  - [DELETE /documents/{document_id}](#delete-documentsdocument_id)
- [Funding Sources](#funding-sources)
  - [GET /accounts/{account_id}/funding-sources](#get-accountsaccount_idfunding-sources)
  - [POST /accounts/{account_id}/funding-sources/plaid/link-token](#post-accountsaccount_idfunding-sourcesplaidlink-token)
  - [POST /accounts/{account_id}/funding-sources/plaid/connect](#post-accountsaccount_idfunding-sourcesplaidconnect)
  - [DELETE /accounts/{account_id}/funding-sources/{id}](#delete-accountsaccount_idfunding-sourcesid)
- [Transfers](#transfers)
  - [POST /accounts/{account_id}/deposits](#post-accountsaccount_iddeposits)
  - [GET /accounts/{account_id}/deposits](#get-accountsaccount_iddeposits)
  - [GET /accounts/{account_id}/deposits/{deposit_id}](#get-accountsaccount_iddepositsdeposit_id)
  - [POST /accounts/{account_id}/deposits/{deposit_id}/cancel](#post-accountsaccount_iddepositsdeposit_idcancel)
  - [GET /accounts/{account_id}/deposits/{deposit_id}/wire-details](#get-accountsaccount_iddepositsdeposit_idwire-details)
  - [POST /accounts/{account_id}/withdrawals](#post-accountsaccount_idwithdrawals)
  - [GET /accounts/{account_id}/withdrawals](#get-accountsaccount_idwithdrawals)
  - [GET /accounts/{account_id}/withdrawals/{withdrawal_id}](#get-accountsaccount_idwithdrawalswithdrawal_id)
  - [POST /accounts/{account_id}/withdrawals/{withdrawal_id}/cancel](#post-accountsaccount_idwithdrawalswithdrawal_idcancel)
- [Webhooks](#webhooks)
  - [GET /webhooks/event-types](#get-webhooksevent-types)
  - [GET /webhooks](#get-webhooks)
  - [POST /webhooks](#post-webhooks)
  - [PATCH /webhooks/{webhook_id}](#patch-webhookswebhook_id)
  - [DELETE /webhooks/{webhook_id}](#delete-webhookswebhook_id)
- [Wealth Management](#wealth-management)
  - [GET /wealth/accounts/{account_id}/profile](#get-wealthaccountsaccount_idprofile)
  - [PUT /wealth/accounts/{account_id}/profile](#put-wealthaccountsaccount_idprofile)
  - [GET /wealth/accounts/{account_id}/risk-assessments/current](#get-wealthaccountsaccount_idrisk-assessmentscurrent)
  - [POST /wealth/accounts/{account_id}/risk-assessments](#post-wealthaccountsaccount_idrisk-assessments)
  - [GET /wealth/accounts/{account_id}/goals](#get-wealthaccountsaccount_idgoals)
  - [POST /wealth/accounts/{account_id}/goals](#post-wealthaccountsaccount_idgoals)
  - [GET /wealth/accounts/{account_id}/portfolios](#get-wealthaccountsaccount_idportfolios)
  - [GET /wealth/accounts/{account_id}/portfolios/{portfolio_id}/summary](#get-wealthaccountsaccount_idportfoliosportfolio_idsummary)
  - [GET /wealth/accounts/{account_id}/portfolios/{portfolio_id}/holdings](#get-wealthaccountsaccount_idportfoliosportfolio_idholdings)
  - [GET /wealth/accounts/{account_id}/portfolios/{portfolio_id}/performance](#get-wealthaccountsaccount_idportfoliosportfolio_idperformance)
  - [GET /wealth/accounts/{account_id}/portfolios/{portfolio_id}/rebalancing](#get-wealthaccountsaccount_idportfoliosportfolio_idrebalancing)
  - [POST /wealth/accounts/{account_id}/portfolios/{portfolio_id}/rebalancing](#post-wealthaccountsaccount_idportfoliosportfolio_idrebalancing)
  - [GET /wealth/accounts/{account_id}/insights](#get-wealthaccountsaccount_idinsights)
  - [GET /wealth/accounts/{account_id}/recommendations](#get-wealthaccountsaccount_idrecommendations)
  - [GET /wealth/accounts/{account_id}/tax-optimization](#get-wealthaccountsaccount_idtax-optimization)
  - [POST /wealth/accounts/{account_id}/assistant/chat](#post-wealthaccountsaccount_idassistantchat)
  - [GET /wealth/accounts/{account_id}/statements](#get-wealthaccountsaccount_idstatements)
  - [GET /wealth/accounts/{account_id}/reports/pnl](#get-wealthaccountsaccount_idreportspnl)
  - [GET /wealth/accounts/{account_id}/reports/benchmark](#get-wealthaccountsaccount_idreportsbenchmark)
- [Common Error Responses](#common-error-responses)
- [Example Request](#example-request)
- [Notes](#notes)

---

## Authentication

**External API (`/v1/*`)**
- Auth: HTTP Basic — `Authorization: Basic base64(API_KEY:API_SECRET)`
- Sandbox base URL: `https://sandbox.api.bluumfinance.com/v1`
- Production base URL: `https://api.bluumfinance.com/v1`
- Tenant must have KYC status `VERIFIED` to use the API

---

## Accounts

### GET /accounts

**Summary**: List all user accounts

**Authentication**: HTTP Basic Auth

**Query Parameters**: None

**Response**: `200 OK`

```json
[
  {
    "id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
    "account_number": "968430933",
    "status": "ACTIVE",
    "crypto_status": "INACTIVE",
    "currency": "USD",
    "balance": "1000.00",
    "last_equity": "0",
    "created_at": "2025-10-18T01:08:46.263583Z",
    "account_type": "trading",
    "trading_type": "cash",
    "enabled_assets": ["us_equity"],
    "contact": {
      "email_address": "john.doe@example.com",
      "phone_number": "+15555555555",
      "street_address": ["123 Main St"],
      "city": "Berkeley",
      "state": "CA",
      "postal_code": "94704",
      "country": "USA"
    },
    "identity": {
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1980-01-01",
      "country_of_citizenship": "USA",
      "country_of_birth": "USA",
      "party_type": "natural_person",
      "tax_id_type": "SSN",
      "country_of_tax_residence": "USA",
      "funding_source": ["employment_income"]
    },
    "disclosures": {
      "is_control_person": false,
      "is_affiliated_exchange_or_finra": false,
      "is_politically_exposed": false,
      "immediate_family_exposed": false,
      "is_discretionary": false
    },
    "agreements": []
  }
]
```

**Error Responses**:
- `401` - Unauthorized
- `500` - Internal Server Error

---

### POST /accounts

**Summary**: Create a new investment account

**Authentication**: HTTP Basic Auth

**Request Body**:

```json
{
  "account_type": "trading",
  "contact": {
    "email_address": "john.doe@example.com",
    "phone_number": "+15555555555",
    "street_address": ["123 Main St", "Apt 4B"],
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

**Response**: `201 Created` - Returns Account object (same structure as GET /accounts/{account_id})

**Error Responses**:
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `500` - Internal Server Error

---

### GET /accounts/{account_id}

**Summary**: Retrieve a specific account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Response**: `200 OK` - Returns Account object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

### GET /accounts/{account_id}/wallets

**Summary**: List all wallets for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Response**: `200 OK`

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

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /accounts/{account_id}/transactions

**Summary**: List transactions for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `type` (string, optional) - Filter by type: `deposit`, `withdrawal`
- `status` (string, optional) - Filter by status: `pending`, `processing`, `received`, `completed`, `submitted`, `expired`, `canceled`, `failed`
- `currency` (string, optional) - Filter by currency (3-letter ISO code)
- `date_from` (string, date, optional) - Filter from date (YYYY-MM-DD)
- `date_to` (string, date, optional) - Filter to date (YYYY-MM-DD)
- `limit` (integer, optional, default: 50) - Max results (1-100)
- `offset` (integer, optional, default: 0) - Pagination offset

**Response**: `200 OK`

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
      "completed_at": "2025-01-16T14:20:00Z",
      "failed_at": null,
      "failure_reason": null
    }
  ]
}
```

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

## Trading

### POST /trading/accounts/{account_id}/orders

**Summary**: Place a new investment order

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Request Body**:

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

**Request Body Fields**:
- `symbol` (string, required) - Asset ticker symbol
- `side` (string, required) - Order side: `buy`, `sell`
- `type` (string, required) - Order type: `market`, `limit`, `stop`, `stop_limit`, `trailing_stop`
- `time_in_force` (string, required) - Time in force: `day`, `gtc`, `ioc`, `fok`
- `qty` (string, optional) - Quantity (required if notional not provided)
- `notional` (string, optional) - Dollar amount (required if qty not provided)
- `limit_price` (string, optional) - Required for limit orders
- `stop_price` (string, optional) - Required for stop orders
- `trail_percent` (string, optional) - Required for trailing_stop orders
- `extended_hours` (boolean, optional, default: false) - Allow extended hours trading
- `client_order_id` (string, optional) - Client-provided order ID

**Response**: `201 Created`

```json
{
  "id": "ord_x9y8z7a6b5c4d3e2",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "symbol": "AAPL",
  "currency": "USD",
  "qty": "10",
  "side": "buy",
  "type": "market",
  "time_in_force": "day",
  "extended_hours": false,
  "status": "accepted",
  "filled_qty": "0",
  "remaining_qty": "10",
  "average_price": "0.00",
  "submitted_at": "2025-01-15T14:30:00Z",
  "filled_at": null,
  "canceled_at": null,
  "reject_reason": null
}
```

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### GET /trading/accounts/{account_id}/orders

**Summary**: List orders for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `status` (string, optional) - Filter by status: `accepted`, `filled`, `partially_filled`, `canceled`, `rejected`
- `symbol` (string, optional) - Filter by symbol
- `side` (string, optional) - Filter by side: `buy`, `sell`
- `limit` (integer, optional, default: 50) - Max results (1-100)
- `offset` (integer, optional, default: 0) - Pagination offset

**Response**: `200 OK` - Returns array of Order objects

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /trading/orders/{order_id}

**Summary**: Retrieve a specific trade order

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `order_id` (string, UUID, required) - Order identifier

**Response**: `200 OK` - Returns Order object

**Error Responses**:
- `404` - Not Found

---

## Positions

### GET /trading/accounts/{account_id}/positions

**Summary**: List positions for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `symbol` (string, optional) - Filter by symbol
- `non_zero_only` (boolean, optional, default: false) - Only return non-zero positions
- `refresh_prices` (boolean, optional, default: false) - Fetch live prices (adds latency)

**Response**: `200 OK`

```json
[
  {
    "id": "pos_a1b2c3d4e5f6g7h8",
    "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
    "symbol": "AAPL",
    "asset_id": "6c5b2403-24a9-4b55-a3dd-5cb1e4b50da6",
    "currency": "USD",
    "quantity": "10.5",
    "average_cost_basis": "175.50",
    "total_cost_basis": "1842.75",
    "current_price": "180.00",
    "market_value": "1890.00",
    "unrealized_pl": "47.25",
    "unrealized_pl_percent": "2.56",
    "last_transaction_at": "2025-01-15T14:30:15Z",
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-15T14:30:15Z"
  }
]
```

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /trading/accounts/{account_id}/positions/{position_id}

**Summary**: Retrieve a specific position

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `position_id` (string, UUID, required) - Position identifier

**Query Parameters**:
- `refresh_prices` (boolean, optional, default: false) - Fetch live price

**Response**: `200 OK` - Returns Position object

**Error Responses**:
- `404` - Not Found

---

## Assets

### GET /assets/search

**Summary**: Search for assets by ticker, name, or partial match

**Authentication**: HTTP Basic Auth

**Query Parameters**:
- `q` (string, optional) - Search query (ticker, name, or partial match)
- `status` (string, optional, default: `active`) - Filter by status: `active`, `inactive`
- `asset_class` (string, optional) - Filter by asset class: `us_equity`, `crypto`, `us_option`
- `limit` (integer, optional, default: 50) - Max results (1-100)

**Response**: `200 OK`

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

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `500` - Internal Server Error

---

### GET /assets/list

**Summary**: List all assets with optional filtering

**Authentication**: HTTP Basic Auth

**Query Parameters**:
- `status` (string, optional, default: `active`) - Filter by status: `active`, `inactive`
- `asset_class` (string, optional) - Filter by asset class: `us_equity`, `crypto`, `us_option`
- `tradable` (boolean, optional) - Filter for tradable assets

**Response**: `200 OK` - Returns array of AssetSearchResult objects

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `500` - Internal Server Error

---

### GET /assets/chart

**Summary**: Get historical chart/bar data for an asset

**Authentication**: HTTP Basic Auth

**Query Parameters**:
- `symbol` (string, required) - Asset ticker symbol
- `timeframe` (string, required) - Bar timeframe: `1Min`, `5Min`, `15Min`, `30Min`, `1Hour`, `1Day`, `1Week`, `1Month`
- `start` (string, date-time, optional) - Start date/time (ISO 8601)
- `end` (string, date-time, optional) - End date/time (ISO 8601)
- `limit` (integer, optional, default: 100) - Max bars (1-10000)
- `adjustment` (string, optional, default: `raw`) - Corporate action adjustment: `raw`, `split`, `dividend`, `all`
- `feed` (string, optional, default: `iex`) - Data feed: `iex`, `sip`, `otc`

**Response**: `200 OK`

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

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `500` - Internal Server Error

---

### GET /assets/{symbol}

**Summary**: Get a single asset by symbol/ticker

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `symbol` (string, required) - Asset ticker symbol

**Query Parameters**:
- `market` (string, optional) - Market hint: `XNAS`, `XNYS`, `BATS`, `ARCA`, `OTC`, `XNSA`

**Response**: `200 OK`

```json
{
  "data": {
    "id": "b0b6dd9d-8b9b-48b9-bbb8-bbbb49bb1bbb",
    "class": "us_equity",
    "market": "XNAS",
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "status": "active",
    "tradable": true,
    "marginable": true,
    "shortable": true,
    "easy_to_borrow": true,
    "fractionable": true,
    "currency": "USD",
    "price": 178.50,
    "change": 1.50,
    "changePercent": 0.85,
    "previousClose": 177.00,
    "bidPrice": 178.48,
    "askPrice": 178.52
  }
}
```

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Documents

### POST /documents/accounts/{account_id}/upload

**Summary**: Upload a document for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Request Body**: `multipart/form-data`
- `file` (file, required) - Document file
- `document_type` (string, required) - Document type: `id_verification`, `proof_of_address`, `w9_form`

**Response**: `201 Created`

```json
{
  "document_id": "doc_a1b2c3d4e5f6g7h8",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "document_type": "id_verification",
  "upload_status": "processing",
  "uploaded_at": "2025-01-15T10:30:00Z"
}
```

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### GET /documents/accounts/{account_id}/upload

**Summary**: List documents for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `document_type` (string, optional) - Filter by type: `id_verification`, `proof_of_address`, `w9_form`
- `status` (string, optional) - Filter by status: `processing`, `approved`, `rejected`

**Response**: `200 OK` - Returns array of DocumentResponse objects

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /documents/{document_id}

**Summary**: Retrieve a specific document

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `document_id` (string, UUID, required) - Document identifier

**Response**: `200 OK` - Returns DocumentResponse object

**Error Responses**:
- `404` - Not Found

---

### DELETE /documents/{document_id}

**Summary**: Delete a document

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `document_id` (string, UUID, required) - Document identifier

**Response**: `204 No Content`

**Error Responses**:
- `404` - Not Found

---

## Funding Sources

### GET /accounts/{account_id}/funding-sources

**Summary**: List funding sources for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `type` (string, optional, default: `all`) - Filter by provider: `plaid`, `all`

**Response**: `200 OK`

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
        ],
        "createdAt": "2026-01-22T10:30:00Z",
        "updatedAt": "2026-01-22T10:30:00Z"
      }
    ]
  }
}
```

**Error Responses**:
- `401` - Unauthorized
- `403` - Forbidden (KYC not verified)
- `404` - Not Found

---

### POST /accounts/{account_id}/funding-sources/plaid/link-token

**Summary**: Create a Plaid Link token

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Request Body**:

```json
{
  "enable_hosted_link": false
}
```

**Request Body Fields**:
- `enable_hosted_link` (boolean, optional, default: false) - Enable hosted link URL

**Response**: `200 OK`

```json
{
  "status": "success",
  "data": {
    "link_token": "link-production-abc123def456",
    "hosted_link_url": null
  }
}
```

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden

---

### POST /accounts/{account_id}/funding-sources/plaid/connect

**Summary**: Connect a bank account via Plaid

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Request Body**:

```json
{
  "public_token": "public-production-abc123def456"
}
```

**Request Body Fields**:
- `public_token` (string, required) - Public token from Plaid Link

**Response**: `200 OK`

```json
{
  "status": "success",
  "message": "Account connected successfully",
  "data": {
    "item": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "itemId": "item_abc123",
      "institutionId": "ins_123456",
      "institutionName": "Chase Bank",
      "status": "ACTIVE",
      "accounts": [...]
    }
  }
}
```

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden

---

### DELETE /accounts/{account_id}/funding-sources/{id}

**Summary**: Disconnect a funding source

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `id` (string, UUID, required) - Funding source ID

**Query Parameters**:
- `type` (string, optional, default: `plaid`) - Provider type

**Response**: `200 OK`

```json
{
  "status": "success",
  "message": "Funding source disconnected successfully"
}
```

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found

---

## Transfers

### POST /accounts/{account_id}/deposits

**Summary**: Initiate a new deposit

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Headers**:
- `Idempotency-Key` (string, optional) - Unique key for idempotency

**Request Body**:

```json
{
  "amount": "5000.00",
  "currency": "USD",
  "method": "ach_plaid",
  "funding_source_id": "fs_123456789",
  "description": "Initial deposit"
}
```

**Request Body Fields**:
- `amount` (string, required) - Deposit amount
- `currency` (string, required) - Currency code (3-letter ISO)
- `method` (string, required) - Deposit method: `ach_plaid`, `manual_bank_transfer`, `wire`
- `funding_source_id` (string, required for `ach_plaid`) - Funding source ID
- `description` (string, optional) - Deposit description

**Response**: `201 Created`

```json
{
  "deposit_id": "dep_a1b2c3d4e5f6",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "wallet_id": "w_a1b2c3d4e5f6",
  "amount": "5000.00",
  "currency": "USD",
  "method": "ach_plaid",
  "status": "pending",
  "description": "Initial deposit",
  "created_at": "2025-01-15T10:30:00Z",
  "completed_at": null,
  "failed_at": null,
  "failure_reason": null
}
```

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (idempotency key already used)
- `500` - Internal Server Error

---

### GET /accounts/{account_id}/deposits

**Summary**: List deposits for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `method` (string, optional) - Filter by method: `ach_plaid`, `manual_bank_transfer`, `wire`
- `status` (string, optional) - Filter by status: `pending`, `processing`, `received`, `completed`, `expired`, `canceled`, `failed`
- `currency` (string, optional) - Filter by currency
- `date_from` (string, date, optional) - Filter from date (YYYY-MM-DD)
- `date_to` (string, date, optional) - Filter to date (YYYY-MM-DD)
- `limit` (integer, optional, default: 50) - Max results (1-100)
- `offset` (integer, optional, default: 0) - Pagination offset

**Response**: `200 OK` - Returns DepositListResponse object

**Error Responses**:
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

### GET /accounts/{account_id}/deposits/{deposit_id}

**Summary**: Get deposit details

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `deposit_id` (string, required) - Deposit identifier

**Response**: `200 OK` - Returns DepositResponse object

**Error Responses**:
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

### POST /accounts/{account_id}/deposits/{deposit_id}/cancel

**Summary**: Cancel a pending deposit

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `deposit_id` (string, required) - Deposit identifier

**Response**: `200 OK` - Returns DepositResponse object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

### GET /accounts/{account_id}/deposits/{deposit_id}/wire-details

**Summary**: Download wire details PDF

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `deposit_id` (string, required) - Deposit identifier

**Response**: `200 OK` - Returns PDF binary

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

### POST /accounts/{account_id}/withdrawals

**Summary**: Initiate a new withdrawal

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Headers**:
- `Idempotency-Key` (string, optional) - Unique key for idempotency

**Request Body**:

```json
{
  "amount": "1000.00",
  "currency": "USD",
  "method": "ach_plaid",
  "funding_source_id": "fs_123456789",
  "description": "Withdrawal to bank"
}
```

**Request Body Fields**:
- `amount` (string, required) - Withdrawal amount
- `currency` (string, required) - Currency code (3-letter ISO)
- `method` (string, required) - Withdrawal method: `ach_plaid`, `wire`
- `funding_source_id` (string, required) - Funding source ID
- `description` (string, optional) - Withdrawal description

**Response**: `201 Created` - Returns WithdrawalResponse object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (idempotency key already used)
- `500` - Internal Server Error

---

### GET /accounts/{account_id}/withdrawals

**Summary**: List withdrawals for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `method` (string, optional) - Filter by method: `ach_plaid`, `wire`
- `status` (string, optional) - Filter by status: `pending`, `processing`, `submitted`, `completed`, `canceled`, `failed`
- `currency` (string, optional) - Filter by currency
- `date_from` (string, date, optional) - Filter from date (YYYY-MM-DD)
- `date_to` (string, date, optional) - Filter to date (YYYY-MM-DD)
- `limit` (integer, optional, default: 50) - Max results (1-100)
- `offset` (integer, optional, default: 0) - Pagination offset

**Response**: `200 OK` - Returns WithdrawalListResponse object

**Error Responses**:
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

### GET /accounts/{account_id}/withdrawals/{withdrawal_id}

**Summary**: Get withdrawal details

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `withdrawal_id` (string, required) - Withdrawal identifier

**Response**: `200 OK` - Returns WithdrawalResponse object

**Error Responses**:
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

### POST /accounts/{account_id}/withdrawals/{withdrawal_id}/cancel

**Summary**: Cancel a pending withdrawal

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `withdrawal_id` (string, required) - Withdrawal identifier

**Response**: `200 OK` - Returns WithdrawalResponse object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Webhooks

### GET /webhooks/event-types

**Summary**: Get all available event types

**Authentication**: HTTP Basic Auth

**Response**: `200 OK`

```json
{
  "status": "success",
  "data": {
    "eventTypes": [
      {
        "name": "account.created",
        "description": "Account created",
        "version": "1.0"
      }
    ]
  }
}
```

**Error Responses**:
- `401` - Unauthorized

---

### GET /webhooks

**Summary**: List all webhooks

**Authentication**: HTTP Basic Auth

**Response**: `200 OK`

```json
{
  "status": "success",
  "data": {
    "webhooks": [
      {
        "webhook_id": "wh_a1b2c3d4e5f6",
        "name": "Account Events",
        "url": "https://example.com/webhooks",
        "eventTypeNames": ["account.created", "order.filled"],
        "status": "ACTIVE",
        "created_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

**Error Responses**:
- `401` - Unauthorized

---

### POST /webhooks

**Summary**: Create a new webhook

**Authentication**: HTTP Basic Auth

**Request Body**:

```json
{
  "name": "Account Events",
  "url": "https://example.com/webhooks",
  "eventTypeNames": ["account.created", "order.filled"],
  "description": "Webhook for account events"
}
```

**Request Body Fields**:
- `name` (string, required) - Webhook name
- `url` (string, URI, required) - Webhook URL
- `eventTypeNames` (array[string], required) - Event types to subscribe to
- `description` (string, optional) - Webhook description

**Response**: `201 Created`

```json
{
  "status": "success",
  "message": "Webhook created successfully",
  "data": {
    "webhook": {
      "webhook_id": "wh_a1b2c3d4e5f6",
      "name": "Account Events",
      "url": "https://example.com/webhooks",
      "eventTypeNames": ["account.created", "order.filled"],
      "status": "ACTIVE",
      "created_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized

---

### PATCH /webhooks/{webhook_id}

**Summary**: Update a webhook

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `webhook_id` (string, UUID, required) - Webhook identifier

**Request Body**:

```json
{
  "eventTypeNames": ["account.created", "order.filled", "order.canceled"],
  "name": "Updated Name",
  "url": "https://example.com/webhooks",
  "description": "Updated description",
  "status": "ACTIVE"
}
```

**Request Body Fields** (all optional):
- `eventTypeNames` (array[string]) - Event types
- `name` (string) - Webhook name
- `url` (string, URI) - Webhook URL
- `description` (string) - Description
- `status` (string) - Status: `ACTIVE`, `INACTIVE`

**Response**: `200 OK` - Returns Webhook object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### DELETE /webhooks/{webhook_id}

**Summary**: Delete a webhook

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `webhook_id` (string, UUID, required) - Webhook identifier

**Response**: `200 OK`

```json
{
  "status": "success",
  "message": "Webhook deleted successfully"
}
```

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

## Wealth Management

*Note: Wealth Management endpoints are extensive. This section provides key endpoints. See full OpenAPI spec for complete details.*

### GET /wealth/accounts/{account_id}/profile

**Summary**: Get investor profile

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Response**: `200 OK` - Returns InvestorProfile object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### PUT /wealth/accounts/{account_id}/profile

**Summary**: Update investor profile

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Request Body**: UpdateProfileRequest (partial updates supported)

**Response**: `200 OK` - Returns InvestorProfile object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/risk-assessments/current

**Summary**: Get current risk assessment

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Response**: `200 OK` - Returns RiskAssessmentDetail object, or `204 No Content` if none exists

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### POST /wealth/accounts/{account_id}/risk-assessments

**Summary**: Submit risk assessment

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Headers**:
- `Idempotency-Key` (string, optional) - Unique key for idempotency

**Request Body**: SubmitRiskAssessmentRequest

**Response**: `201 Created` - Returns RiskAssessment object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/goals

**Summary**: List goals

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `status` (string, optional) - Filter by status: `active`, `completed`, `archived`
- `goal_type` (string, optional) - Filter by type: `retirement`, `education`, `emergency`, `wealth_growth`, `home_purchase`, `custom`
- `include_projections` (boolean, optional, default: false) - Include goal progress

**Response**: `200 OK` - Returns GoalList object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### POST /wealth/accounts/{account_id}/goals

**Summary**: Create a goal

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Headers**:
- `Idempotency-Key` (string, optional) - Unique key for idempotency

**Request Body**: CreateGoalRequest

**Response**: `201 Created` - Returns Goal object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/portfolios

**Summary**: List portfolios for an account

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Response**: `200 OK` - Returns PortfolioListResponse object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/portfolios/{portfolio_id}/summary

**Summary**: Get portfolio summary

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `portfolio_id` (string, UUID, required) - Portfolio identifier

**Query Parameters**:
- `refresh_prices` (boolean, optional, default: false) - Fetch live prices

**Response**: `200 OK` - Returns PortfolioSummary object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/portfolios/{portfolio_id}/holdings

**Summary**: Get portfolio holdings

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `portfolio_id` (string, UUID, required) - Portfolio identifier

**Query Parameters**:
- `refresh_prices` (boolean, optional, default: false) - Fetch live prices
- `include_lots` (boolean, optional, default: false) - Include tax lot details
- `group_by` (string, optional, default: `none`) - Group by: `asset_class`, `sector`, `none`

**Response**: `200 OK` - Returns PortfolioHoldings object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/portfolios/{portfolio_id}/performance

**Summary**: Get portfolio performance

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `portfolio_id` (string, UUID, required) - Portfolio identifier

**Query Parameters**:
- `period` (string, optional, default: `1y`) - Period: `1d`, `1w`, `1m`, `3m`, `6m`, `ytd`, `1y`, `3y`, `5y`, `all`
- `start_date` (string, date, optional) - Custom start date
- `end_date` (string, date, optional) - Custom end date
- `benchmark` (string, optional) - Benchmark symbol (e.g., SPY)

**Response**: `200 OK` - Returns PortfolioPerformance object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/portfolios/{portfolio_id}/rebalancing

**Summary**: Get rebalancing analysis

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `portfolio_id` (string, UUID, required) - Portfolio identifier

**Response**: `200 OK` - Returns RebalancingAnalysis object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### POST /wealth/accounts/{account_id}/portfolios/{portfolio_id}/rebalancing

**Summary**: Execute portfolio rebalance

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier
- `portfolio_id` (string, UUID, required) - Portfolio identifier

**Headers**:
- `Idempotency-Key` (string, required) - Unique key for idempotency

**Request Body**: RebalanceRequest

**Response**: `202 Accepted` - Returns RebalanceResponse object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (active rebalancing in progress)

---

### GET /wealth/accounts/{account_id}/insights

**Summary**: Get personalized insights

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `category` (string, optional, default: `all`) - Filter by category: `all`, `opportunity`, `risk`, `tax`, `rebalancing`
- `limit` (integer, optional, default: 10) - Max results (1-50)

**Response**: `200 OK` - Returns InsightList object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/recommendations

**Summary**: Get investment recommendations

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `type` (string, optional, default: `all`) - Filter by type: `allocation`, `security`, `strategy`, `all`
- `goal_id` (string, UUID, optional) - Filter by goal

**Response**: `200 OK` - Returns RecommendationList object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/tax-optimization

**Summary**: Get tax optimization suggestions

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `tax_year` (integer, optional) - Tax year (default: current year)

**Response**: `200 OK` - Returns TaxOptimization object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### POST /wealth/accounts/{account_id}/assistant/chat

**Summary**: AI assistant chat

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Request Body**:

```json
{
  "message": "What's my current allocation and should I rebalance?",
  "context": {
    "portfolio_id": "port_a1b2c3d4e5f6",
    "include_positions": true
  }
}
```

**Request Body Fields**:
- `message` (string, required) - User message
- `context` (object, optional) - Context for the assistant

**Response**: `200 OK` - Returns AssistantChatResponse object

**Error Responses**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/statements

**Summary**: Get account statement

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `period` (string, optional, default: `monthly`) - Period: `monthly`, `quarterly`, `annual`, `custom`
- `start_date` (string, date, optional) - Start date for custom period
- `end_date` (string, date, optional) - End date for custom period
- `format` (string, optional, default: `json`) - Format: `json`, `pdf`

**Response**: `200 OK` - Returns AccountStatement (JSON) or PDF binary

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/reports/pnl

**Summary**: Get P&L report

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `start_date` (string, date, optional) - Report start date
- `end_date` (string, date, optional) - Report end date
- `realized_only` (boolean, optional, default: false) - Only show realized P&L

**Response**: `200 OK` - Returns PnlReport object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

### GET /wealth/accounts/{account_id}/reports/benchmark

**Summary**: Get benchmark comparison report

**Authentication**: HTTP Basic Auth

**Path Parameters**:
- `account_id` (string, UUID, required) - Account identifier

**Query Parameters**:
- `benchmarks` (string, optional) - Comma-separated benchmark symbols (e.g., "SPY,AGG")
- `period` (string, optional, default: `1y`) - Period: `1m`, `3m`, `6m`, `ytd`, `1y`, `3y`, `5y`

**Response**: `200 OK` - Returns BenchmarkReport object

**Error Responses**:
- `401` - Unauthorized
- `404` - Not Found

---

## Common Error Responses

All endpoints may return these error responses:

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request body failed validation |
| 401 | `UNAUTHORIZED` | Missing or invalid credentials |
| 403 | `FORBIDDEN` | KYC not verified or insufficient permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate resource or idempotency key already used |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

**Error Response Format**:

```json
{
  "code": "BLUM-400-001",
  "message": "Validation error",
  "details": {
    "field": "email_address",
    "reason": "Invalid email format"
  }
}
```

---

## Example Request

```http
POST /v1/accounts HTTP/1.1
Host: api.bluumfinance.com
Authorization: Basic <base64(API_KEY:API_SECRET)>
Content-Type: application/json

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

---

## Notes

- All monetary amounts are strings to preserve precision
- All timestamps are ISO 8601 format (UTC)
- UUIDs are used for all resource identifiers
- Pagination uses `limit` and `offset` parameters
- Idempotency keys should be unique per request and can be used to safely retry requests
- For complete schema definitions, refer to the OpenAPI specification files in `src/external/api/`
