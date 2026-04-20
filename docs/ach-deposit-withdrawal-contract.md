# ACH Deposit & Withdrawal — Frontend Integration Contract

This document describes the exact API contract the frontend must follow to implement ACH deposit and withdrawal flows end-to-end.

---

## Overview

ACH requires two prerequisites before a transfer can be initiated:

1. **A connected Plaid bank account** — the user links their bank via Plaid Link. On connect, the backend automatically registers the bank account as an ACH relationship with Alpaca.
2. **An ACH relationship provisioned at Alpaca** — done automatically by the backend during the connect step. The frontend does not call this directly.

Once both are in place, initiating an ACH deposit or withdrawal is a single API call.

---

## Auth

All `/v1/*` endpoints use **HTTP Basic auth**:
```
Authorization: Basic base64(API_KEY_ID:API_KEY_SECRET)
```

---

## Step 1 — Connect a Bank Account (Plaid Link)

### 1a. Get a Plaid Link Token

```
POST /v1/accounts/:account_id/funding-sources/plaid/link-token
```

**Request body:**
```json
{
  "enable_hosted_link": false
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "link_token": "link-sandbox-...",
    "hosted_link_url": null
  }
}
```

- Use `link_token` to initialise the Plaid Link SDK (`usePlaidLink`).
- If `enable_hosted_link: true`, `hosted_link_url` is populated — redirect the user there instead of opening the SDK.

### 1b. Exchange the Public Token

After the user completes Plaid Link, the SDK returns a `publicToken`. Exchange it immediately:

```
POST /v1/accounts/:account_id/funding-sources/plaid/connect
```

**Request body:**
```json
{
  "publicToken": "public-sandbox-..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Funding source connected successfully",
  "data": {
    "fundingSource": {
      "id": "uuid",
      "type": "plaid",
      "providerId": "item_plaid_ext_id",
      "institutionName": "Chase",
      "status": "ACTIVE",
      "accounts": [
        {
          "id": "uuid",
          "accountId": "plaid-account-id",
          "accountName": "Chase Checking",
          "accountType": "depository",
          "accountSubtype": "checking",
          "mask": "0001"
        }
      ],
      "createdAt": "2026-04-20T00:00:00.000Z"
    }
  }
}
```

**What happens on the backend during connect:**
- Exchanges the public token for an access token and stores the Plaid item.
- Calls Plaid `authGet` to retrieve routing and account numbers.
- Calls Alpaca `POST /v1/accounts/{alpacaAccountId}/ach_relationships` with the bank details to provision the ACH relationship.
- ACH provisioning failures are non-fatal — the connect response is still `200`. The provisioning error is logged server-side. If the relationship couldn't be provisioned, ACH transfers will fail at initiation time.

---

## Step 2 — List Connected Accounts

Use this to show which banks are connected and to gate the ACH option in the deposit/withdrawal UI.

```
GET /v1/accounts/:account_id/funding-sources?type=plaid
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "fundingSources": [
      {
        "id": "uuid",
        "type": "plaid",
        "providerId": "item_plaid_ext_id",
        "institutionName": "Chase",
        "status": "ACTIVE",
        "accounts": [...],
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

- `status` values: `ACTIVE`, `DISCONNECTED`, `ERROR`.
- Only show `ACTIVE` items as selectable in the deposit/withdrawal UI.
- If `fundingSources` is empty, prompt the user to connect a bank before allowing ACH.

---

## Step 3a — Initiate ACH Deposit

```
POST /v1/accounts/:account_id/deposits
```

**Request body:**
```json
{
  "amount": "500.00",
  "currency": "USD",
  "method": "ach",
  "description": "ACH deposit"
}
```

- `amount` must be a string with up to 2 decimal places (e.g. `"500.00"`).
- `currency` defaults to `USD` if omitted.
- `method` must be exactly `"ach"`.
- Optionally include `Idempotency-Key` header (UUID) to prevent duplicate submissions on retry.

**Response (201):**
```json
{
  "deposit_id": "uuid",
  "account_id": "uuid",
  "wallet_id": "uuid",
  "method": "ach",
  "status": "pending",
  "amount": "500.00",
  "currency": "USD",
  "description": "ACH deposit",
  "method_details": {
    "transferId": "alpaca-transfer-id",
    "alpacaStatus": "QUEUED"
  },
  "initiated_at": "2026-04-20T00:00:00.000Z",
  "received_at": null,
  "completed_at": null,
  "expires_at": null,
  "failure_reason": null,
  "created_at": "2026-04-20T00:00:00.000Z"
}
```

**Deposit status lifecycle:**
```
pending → processing → received → completed
                    ↘ expired | canceled | failed
```

**Error — no ACH relationship:**
```json
{ "error": "No approved ACH relationship found for account {alpacaAccountId}" }
```
HTTP 400/500. This means the bank connect step either failed or hasn't completed yet. Prompt the user to reconnect their bank.

---

## Step 3b — Initiate ACH Withdrawal

```
POST /v1/accounts/:account_id/withdrawals
```

**Request body:**
```json
{
  "amount": "250.00",
  "currency": "USD",
  "method": "ach",
  "description": "ACH withdrawal"
}
```

**Response (201):**
```json
{
  "withdrawal_id": "uuid",
  "account_id": "uuid",
  "wallet_id": "uuid",
  "method": "ach",
  "status": "pending",
  "amount": "250.00",
  "currency": "USD",
  "description": "ACH withdrawal",
  "method_details": { ... },
  "destination_details": { ... },
  "initiated_at": "2026-04-20T00:00:00.000Z",
  "submitted_at": null,
  "completed_at": null,
  "failure_reason": null,
  "created_at": "2026-04-20T00:00:00.000Z"
}
```

**Withdrawal status lifecycle:**
```
pending → submitted → completed
        ↘ canceled | failed
```

---

## Step 4 — Poll Transfer Status (Optional)

### Get deposit
```
GET /v1/accounts/:account_id/deposits/:deposit_id
```

### Get withdrawal
```
GET /v1/accounts/:account_id/withdrawals/:withdrawal_id
```

Poll at ~5s intervals while `status` is `pending` or `processing`. Stop when terminal: `completed`, `failed`, `canceled`, `expired`.

---

## Step 5 — Cancel (if needed)

```
POST /v1/accounts/:account_id/deposits/:deposit_id/cancel
POST /v1/accounts/:account_id/withdrawals/:withdrawal_id/cancel
```

Only callable while status is `pending`. Returns the updated transfer object.

---

## Step 6 — Disconnect a Bank Account

```
DELETE /v1/accounts/:account_id/funding-sources/:funding_source_id?type=plaid
```

`funding_source_id` is the `id` (not `providerId`) from the funding sources list. Returns `204 No Content`.

---

## Frontend State Machine

```
[No bank connected]
  → Show "Connect Bank" → Plaid Link → POST /connect → [Bank connected]

[Bank connected]
  → Show connected institution in ACH method selector
  → User selects amount + ACH method → Confirm → POST /deposits or /withdrawals
  → Show status: pending
  → Poll GET /deposits/:id until terminal status
  → Show result (completed / failed)

[Transfer fails with "No ACH relationship"]
  → Show error + "Reconnect bank account" CTA → re-run Plaid Link flow
```

---

## Field Mapping — Demo App to API

| Demo app field | API field | Notes |
|---|---|---|
| `accountId` | `:account_id` path param | Investor UUID |
| `amount` (float) | `amount` (string) | Use `.toFixed(2)` |
| `depositMethod === 'ach'` | `method: "ach"` | Exact string match |
| `fundingSource.id` | `funding_source_id` for disconnect | DB UUID, not Plaid item ID |
| `fundingSource.providerId` | Plaid external `item_id` | Don't send to deposit endpoint |
| `deposit.deposit_id` | poll/cancel path param | |
| `deposit.method_details.transferId` | Display as "Transfer ID" | May be null until Alpaca queues |
| `deposit.method_details.alpacaStatus` | Display as "Provider status" | Raw Alpaca enum |

---

## Error Handling

| Scenario | HTTP | Handling |
|---|---|---|
| Invalid amount format | 400 | Show validation error inline |
| No ACH relationship found | 400/500 | "Bank connection issue — reconnect your bank" |
| Plaid item not found | 404 | Refresh funding sources list |
| Insufficient funds (withdrawal) | 400 | Show balance error |
| Deposit already cancelled | 409 | Reload deposit status |
| Network failure | — | Retry with same `Idempotency-Key` header |
