# External Deposit and Withdrawal Contract

This document describes the **external API** contract for deposit and withdrawal flows. Use these endpoints from the frontend or any B2B integration. Do not use the internal `/api/investors/...` endpoints for frontend work.

## Base Path

All endpoints below are under:

`/v1/accounts/{account_id}`

## Authentication

External API requests require API key authentication.

Supported auth patterns:
- `BLUUM-API-KEY-ID` and `BLUUM-API-SECRET-KEY` headers
- HTTP Basic Auth

## Shared Conventions

- Amounts are strings with up to 2 decimal places, for example `"100.00"`.
- Currency is a 3-letter ISO code, for example `"USD"`.
- Methods are lowercase strings.
- External responses are returned as plain JSON objects, not wrapped in an additional `{ status, data }` envelope.

## Deposit Endpoints

### Create Deposit

`POST /v1/accounts/{account_id}/deposits`

Request body:

```json
{
  "amount": "100.00",
  "currency": "USD",
  "method": "ach",
  "description": "optional",
  "manual_options": {},
  "wire_options": {}
}
```

Request fields:
- `amount` required
- `currency` optional, defaults to `USD`
- `method` required, one of:
  - `ach`
  - `manual_bank_transfer`
  - `wire`
- `description` optional
- `manual_options` optional, currently empty object
- `wire_options` optional, currently empty object

Current Alpaca usage:
- `method: "ach"` is used for ACH deposit flows.
- `method: "wire"` is used for wire deposit flows.
- `manual_bank_transfer` remains available for the legacy manual transfer flow.

Success response `201`:

```json
{
  "deposit_id": "dep_123",
  "account_id": "acc_123",
  "wallet_id": "wal_123",
  "method": "ach",
  "status": "pending",
  "amount": "100.00",
  "currency": "USD",
  "description": "My deposit",
  "method_details": {},
  "initiated_at": "2026-04-14T10:00:00.000Z",
  "received_at": null,
  "completed_at": null,
  "expires_at": null,
  "failure_reason": null,
  "created_at": "2026-04-14T10:00:00.000Z"
}
```

Method-specific `method_details` examples:

ACH deposit:

```json
{
  "providerName": "alpaca",
  "provider": "alpaca",
  "method": "ach",
  "transferId": "alpaca_transfer_id",
  "alpacaStatus": "QUEUED",
  "externalDepositId": "alpaca_transfer_id"
}
```

Wire deposit:

```json
{
  "providerName": "alpaca",
  "provider": "alpaca",
  "method": "wire",
  "fundingDetails": [
    {
      "payment_type": "swift_wire",
      "currency": "USD",
      "account_number": "123456789",
      "routing_code": "ABCDEF",
      "bank_name": "Alpaca Bank"
    }
  ]
}
```

Manual bank transfer deposit:

```json
{
  "referenceCode": "BLUUM-ABC123-9XYZ",
  "bankDetails": {
    "bankName": "Bluum Bank",
    "bankAddress": "optional",
    "accountName": "Bluum Finance LLC",
    "accountNumber": "1234567890",
    "accountKind": "Savings",
    "routingNumber": "021000021",
    "swiftCode": "optional",
    "beneficiaryAddress": "optional",
    "instructions": "Include reference code \"BLUUM-ABC123-9XYZ\" in your transfer memo/description. Transfer must be received within N days."
  },
  "expiresAt": "2026-04-21T10:00:00.000Z"
}
```

### External Manual Deposit Flow

Use this flow for `method: "manual_bank_transfer"`:

1. Create manual deposit:
   - `POST /v1/accounts/{account_id}/deposits`
   - body:

```json
{
  "amount": "500.00",
  "currency": "USD",
  "method": "manual_bank_transfer",
  "description": "Manual deposit"
}
```

2. Show transfer instructions from response:
   - `method_details.referenceCode`
   - `method_details.bankDetails.*`
   - `expires_at`

3. User sends transfer from their bank:
   - User must include `referenceCode` in bank memo/description.

4. Track status:
   - Poll `GET /v1/accounts/{account_id}/deposits/{deposit_id}` or list endpoint.
   - Typical lifecycle: `pending` -> `processing` -> `received` -> `completed`
   - Terminal statuses: `completed`, `expired`, `canceled`, `failed`

5. Optional actions:
   - Download wire instructions PDF (manual deposits only):
     - `GET /v1/accounts/{account_id}/deposits/{deposit_id}/wire-details`
   - Cancel while pending/processing:
     - `POST /v1/accounts/{account_id}/deposits/{deposit_id}/cancel`

### Get Deposit

`GET /v1/accounts/{account_id}/deposits/{deposit_id}`

Success response `200`:

```json
{
  "deposit_id": "dep_123",
  "account_id": "acc_123",
  "wallet_id": "wal_123",
  "method": "ach",
  "status": "pending",
  "amount": "100.00",
  "currency": "USD",
  "description": "My deposit",
  "method_details": {},
  "initiated_at": "2026-04-14T10:00:00.000Z",
  "received_at": null,
  "completed_at": null,
  "expires_at": null,
  "failure_reason": null,
  "created_at": "2026-04-14T10:00:00.000Z"
}
```

### List Deposits

`GET /v1/accounts/{account_id}/deposits`

Query params:
- `method` optional, one of `ach`, `manual_bank_transfer`, `wire`
- `status` optional, one of `pending`, `processing`, `received`, `completed`, `expired`, `canceled`, `failed`
- `currency` optional, 3-letter ISO code
- `date_from` optional, `YYYY-MM-DD`
- `date_to` optional, `YYYY-MM-DD`
- `limit` optional
- `offset` optional

Success response `200`:

```json
{
  "deposits": [],
  "total": 0
}
```

### Cancel Deposit

`POST /v1/accounts/{account_id}/deposits/{deposit_id}/cancel`

Success response `200`:

```json
{
  "deposit_id": "dep_123",
  "account_id": "acc_123",
  "wallet_id": "wal_123",
  "method": "ach",
  "status": "canceled",
  "amount": "100.00",
  "currency": "USD",
  "description": "My deposit",
  "method_details": {},
  "initiated_at": "2026-04-14T10:00:00.000Z",
  "received_at": null,
  "completed_at": null,
  "expires_at": null,
  "failure_reason": null,
  "created_at": "2026-04-14T10:00:00.000Z"
}
```

### Download Wire Details

`GET /v1/accounts/{account_id}/deposits/{deposit_id}/wire-details`

Important:
- This endpoint is only available for `manual_bank_transfer` deposits.
- It returns a PDF file.

## Withdrawal Endpoints

### Create Withdrawal

`POST /v1/accounts/{account_id}/withdrawals`

Request body:

```json
{
  "amount": "100.00",
  "currency": "USD",
  "method": "ach",
  "description": "optional",
  "wire_options": {}
}
```

Request fields:
- `amount` required
- `currency` optional, defaults to `USD`
- `method` required, one of `ach` or `wire`
- `description` optional
- `wire_options` optional, currently empty object

Current Alpaca usage:
- `method: "ach"` is used for ACH withdrawal flows.
- `method: "wire"` is used for wire withdrawal flows.

Success response `201`:

```json
{
  "withdrawal_id": "wd_123",
  "account_id": "acc_123",
  "wallet_id": "wal_123",
  "method": "ach",
  "status": "pending",
  "amount": "100.00",
  "currency": "USD",
  "description": "Withdrawal to bank",
  "method_details": {},
  "destination_details": {},
  "initiated_at": "2026-04-14T10:00:00.000Z",
  "submitted_at": null,
  "completed_at": null,
  "failure_reason": null,
  "created_at": "2026-04-14T10:00:00.000Z"
}
```

Method-specific `method_details` example for Alpaca:

```json
{
  "providerName": "alpaca",
  "provider": "alpaca",
  "method": "ach",
  "transferId": "alpaca_transfer_id",
  "alpacaStatus": "QUEUED"
}
```

### Get Withdrawal

`GET /v1/accounts/{account_id}/withdrawals/{withdrawal_id}`

Success response `200`:

```json
{
  "withdrawal_id": "wd_123",
  "account_id": "acc_123",
  "wallet_id": "wal_123",
  "method": "ach",
  "status": "pending",
  "amount": "100.00",
  "currency": "USD",
  "description": "Withdrawal to bank",
  "method_details": {},
  "destination_details": {},
  "initiated_at": "2026-04-14T10:00:00.000Z",
  "submitted_at": null,
  "completed_at": null,
  "failure_reason": null,
  "created_at": "2026-04-14T10:00:00.000Z"
}
```

### List Withdrawals

`GET /v1/accounts/{account_id}/withdrawals`

Query params:
- `method` optional, one of `ach` or `wire`
- `status` optional, one of `pending`, `processing`, `submitted`, `completed`, `canceled`, `failed`
- `currency` optional, 3-letter ISO code
- `date_from` optional, `YYYY-MM-DD`
- `date_to` optional, `YYYY-MM-DD`
- `limit` optional
- `offset` optional

Success response `200`:

```json
{
  "withdrawals": [],
  "total": 0
}
```

### Cancel Withdrawal

`POST /v1/accounts/{account_id}/withdrawals/{withdrawal_id}/cancel`

Success response `200`:

```json
{
  "withdrawal_id": "wd_123",
  "account_id": "acc_123",
  "wallet_id": "wal_123",
  "method": "ach",
  "status": "canceled",
  "amount": "100.00",
  "currency": "USD",
  "description": "Withdrawal to bank",
  "method_details": {},
  "destination_details": {},
  "initiated_at": "2026-04-14T10:00:00.000Z",
  "submitted_at": null,
  "completed_at": null,
  "failure_reason": null,
  "created_at": "2026-04-14T10:00:00.000Z"
}
```

## Notes For Frontend

- Use these external endpoints for the wallet UI.
- The current external contract is method-based, but it does not yet expose Alpaca-specific ACH relationship fields or wire recipient-bank fields in the request body.
- For Alpaca wire deposits, expect instruction data in `method_details.fundingDetails`.
- For Alpaca ACH flows, keep the UI flexible because the server currently resolves much of the provider-specific context.
- Do not assume the internal `/api/investors/...` response envelope when calling the external API.
