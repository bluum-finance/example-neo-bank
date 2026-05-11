# Funding Sources — Frontend API Contract

A funding source represents a bank account an investor can use for deposits and withdrawals. Two types are supported: **Plaid** (OAuth-linked, multiple accounts per connection) and **Manual** (direct account number entry).

---

## Authentication


| API surface         | Auth mechanism                                                    |
| ------------------- | ----------------------------------------------------------------- |
| Internal (`/api/`*) | Clerk JWT — `Authorization: Bearer <token>`                       |
| External (`/v1/*`)  | HTTP Basic — `Authorization: Basic base64(apiKeyId:apiKeySecret)` |


---

## Shared Object: `FundingSource`

Returned by all list and connect endpoints.

### Internal API shape (camelCase)

```ts
{
  id: string              // UUID
  type: "plaid" | "manual"
  status: "active" | "disconnected" | "error"
  bankName: string | null
  mask: string | null     // last 4 digits of account number

  // Only present when type = "plaid"
  providerId?: string     // Plaid item_id (external Plaid identifier)
  accountName?: string
  accountType?: string    // e.g. "depository"
  accountSubtype?: string // e.g. "checking", "savings"

  currency: string | null // 3-char ISO code, e.g. "USD", "NGN"
  country: string | null  // 2-char ISO code, e.g. "US", "NG"

  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}
```

### External API shape (snake_case, list endpoint only differs slightly)

```ts
{
  id: string
  type: "plaid" | "manual"
  status: "active" | "disconnected" | "error"
  bank_name: string | null
  mask: string | null

  // Only present when type = "plaid"
  provider_id?: string
  account_name?: string
  account_type?: string
  account_subtype?: string

  currency: string | null
  country: string | null

  created_at: string
  updated_at: string
}
```

> The connect response on the external API returns the full `FundingSource` shape (camelCase, from `formatFundingSource`). Only the GET list endpoint remaps to snake_case.

---

## Endpoints

### 1. Create Plaid Link Token

Required first step for connecting a Plaid account. Returns a token to initialise the Plaid Link SDK or a hosted URL.


|        | Internal                                                      | External                                                    |
| ------ | ------------------------------------------------------------- | ----------------------------------------------------------- |
| Method | `POST`                                                        | `POST`                                                      |
| Path   | `/api/investors/:investorId/funding-sources/plaid/link-token` | `/v1/accounts/:account_id/funding-sources/plaid/link-token` |
| Status | `200`                                                         | `200`                                                       |


**Request body**

```ts
{
  enable_hosted_link?: boolean  // default false — set true to get a hosted_link_url
}
```

**Response**

```ts
{
  status: "success",
  data: {
    link_token: string         // pass to Plaid Link SDK
    hosted_link_url: string | null
  }
}
```

---

### 2. Connect Funding Source

Single endpoint for both Plaid and manual connections. Discriminated by `type`.


|                 | Internal                                             | External                                           |
| --------------- | ---------------------------------------------------- | -------------------------------------------------- |
| Method          | `POST`                                               | `POST`                                             |
| Path            | `/api/investors/:investorId/funding-sources/connect` | `/v1/accounts/:account_id/funding-sources/connect` |
| Status (Plaid)  | `200`                                                | `200`                                              |
| Status (Manual) | `201`                                                | `201`                                              |


#### Plaid body

```ts
{
  type: "plaid"
  public_token: string  // from Plaid Link onSuccess callback
}
```

**Response (200)**

```ts
{
  status: "success",
  message: "Funding source connected successfully",
  data: {
    fundingSources: FundingSource[]   // internal
    // funding_sources: FundingSource[] // external
  }
}
```

> One Plaid connection can yield multiple funding sources (one per bank account in the link).

#### Manual body

```ts
{
  type: "manual"
  bank_name: string               // required
  account_holder_name: string     // required
  account_number: string          // required, min 4 chars
  bank_account_type?: "CHECKING" | "SAVINGS"
  routing_number?: string         // 9 chars, for domestic ACH
  swift_code?: string             // for international wire
  beneficiary_address?: string
  currency?: string               // 3-char ISO code, e.g. "USD" or "NGN" — can be used to filter sources by currency on the frontend
  country?: string                // 2-char ISO code, derived from currency ("USD" → "US", "NGN" → "NG")
  bank_code?: string              // provider-specific bank code
  metadata?: Record<string, unknown>
}
```

**Response (201)**

```ts
{
  status: "success",
  message: "Funding source connected successfully",
  data: {
    fundingSource: FundingSource   // internal
    // funding_source: FundingSource // external
  }
}
```

---

### 3. List Funding Sources


|        | Internal                                     | External                                   |
| ------ | -------------------------------------------- | ------------------------------------------ |
| Method | `GET`                                        | `GET`                                      |
| Path   | `/api/investors/:investorId/funding-sources` | `/v1/accounts/:account_id/funding-sources` |
| Status | `200`                                        | `200`                                      |


**Query parameters**


| Param  | Values                           | Default |
| ------ | -------------------------------- | ------- |
| `type` | `"plaid"` | `"manual"` | `"all"` | `"all"` |


**Response**

```ts
{
  status: "success",
  data: {
    fundingSources: FundingSource[]   // internal
    // funding_sources: FundingSource[] // external
  }
}
```

---

### 4. Disconnect Funding Source

Sets status to `DISCONNECTED`. Does **not** delete — history is preserved. If all accounts under a Plaid item are disconnected, the Plaid item itself is also disconnected from Plaid.


|        | Internal                                         | External                                       |
| ------ | ------------------------------------------------ | ---------------------------------------------- |
| Method | `DELETE`                                         | `DELETE`                                       |
| Path   | `/api/investors/:investorId/funding-sources/:id` | `/v1/accounts/:account_id/funding-sources/:id` |
| Status | `200`                                            | `204` (no body)                                |


**Query parameters**


| Param  | Values                 | Default   |
| ------ | ---------------------- | --------- |
| `type` | `"plaid"` | `"manual"` | `"plaid"` |


**Internal response (200)**

```ts
{
  status: "success",
  message: "Funding source disconnected successfully"
}
```

---

## Using a Funding Source in Deposits & Withdrawals

A `fundingSourceId` is **required** when `method` is `"ach"`. It is ignored for `manual_bank_transfer` and `wire` (wire uses `wire_options` instead).

The funding source must be:

- Owned by the same investor/account
- `status = "active"`

Validation error is returned otherwise (see errors section).

### Deposit body (relevant fields)

```ts
// Internal
{
  amount: string             // decimal string, e.g. "100.00"
  currency: string           // 3-char, default "USD"
  method: "ach" | "manual_bank_transfer" | "wire"
  fundingSourceId?: string   // UUID — required if method = "ach"
}

// External
{
  amount: string
  currency: string
  method: "ach" | "manual_bank_transfer" | "wire"
  funding_source_id?: string // UUID — required if method = "ach"
}
```

### Withdrawal body (relevant fields)

```ts
// Internal
{
  amount: string
  currency: string
  method: "ach" | "wire"
  fundingSourceId?: string   // UUID — required if method = "ach"
}

// External
{
  amount: string
  currency: string
  method: "ach" | "wire"
  funding_source_id?: string // UUID — required if method = "ach"
}
```

---

## Currency & Plaid Availability

The currency selector is surfaced in the Deposit and Withdrawal UI. The selected currency determines:

1. **Which funding sources are shown** — the frontend filters the full list returned by the list endpoint:
  - `USD` → sources where `currency` is `null` or `"USD"`
  - `NGN` → sources where `currency` is `null` or `"NGN"`
  - `null` means the source was connected without specifying a currency and should be treated as compatible with any currency
2. **Whether Plaid is available** — Plaid is a US-only connection method. The "Connect via Plaid" button is hidden when NGN is selected; only manual account entry is shown.
3. **What `currency`/`country` are sent on manual connect** — the frontend derives `country` automatically from `currency` (`"USD"` → `"US"`, `"NGN"` → `"NG"`) so the user never has to enter it manually.


| Selected currency | Plaid available | Manual available | `country` sent |
| ----------------- | --------------- | ---------------- | -------------- |
| `USD`             | Yes             | Yes              | `"US"`         |
| `NGN`             | No              | Yes              | `"NG"`         |


---

## Nigerian Banks List

When `NGN` is selected, the frontend can fetch the list of supported Nigerian banks to populate a dropdown/search input for manual account entry.

### Endpoint


|        | Internal                       | External                      |
| ------ | ------------------------------ | ----------------------------- |
| Method | `GET`                          | `GET`                         |
| Path   | `/api/lookup/nigerian-banks`   | `/v1/lookup/nigerian-banks`   |
| Status | `200`                          | `200`                         |


### Response

```ts
{
  status: "success",
  data: {
    banks: [
      { name: "Access Bank", code: "044" },
      { name: "Carbon", code: "565" },
      { name: "First Bank of Nigeria", code: "011" },
      { name: "Guaranty Trust Bank", code: "058" },
      { name: "Kuda Bank", code: "50211" },
      { name: "OPay Digital Services Limited (OPay)", code: "999992" },
      // ... 35 total banks (see src/internal/lookup/nigerian-banks.json)
    ]
  }
}
```

### Usage in Manual Connect

When connecting a manual NGN funding source, use the selected bank's `name` for `bank_name` and include the `code` or `bank_code`:

```ts
{
  type: "manual"
  bank_name: "Access Bank",      // from the dropdown selection
  account_holder_name: "...",
  account_number: "...",
  currency: "NGN",
  country: "NG",
  bank_code: "044",                // optional: provider-specific code
  bank_account_type: "SAVINGS"     // optional: "CHECKING" | "SAVINGS"
}
```

---

## Error Responses

All errors follow this envelope:

```ts
{
  status: "error",
  code: string     // BLUM-{HTTP_STATUS}-{SEQ}
  message: string
}
```


| HTTP  | Scenario                                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `400` | Validation failure (e.g. missing `public_token`, `account_number` too short, `fundingSourceId` missing for ACH, funding source not active) |
| `401` | Missing or invalid auth credentials                                                                                                        |
| `403` | Funding source belongs to a different investor                                                                                             |
| `404` | Investor/account or funding source not found                                                                                               |
| `500` | Unexpected server error                                                                                                                    |


---

## Plaid Integration Flow

```
1. POST /funding-sources/plaid/link-token
       → receive link_token (and optionally hosted_link_url)

2a. Hosted:   redirect user to hosted_link_url
2b. SDK:      initialise Plaid Link with link_token
              onSuccess(public_token, metadata) callback fires

3. POST /funding-sources/connect  { type: "plaid", public_token }
       → backend exchanges token, upserts FundingSource rows
       → ACH provisioning attempted automatically (non-blocking)
       → returns array of FundingSource (one per linked bank account)
```

---

## Disconnect Behaviour

- Disconnect marks `status = "disconnected"`, not a hard delete.
- A disconnected funding source **cannot** be used in new ACH deposits or withdrawals.
- If the disconnected source was the last active account under a Plaid item, the Plaid item token is also revoked.
- Existing historical `Deposit`/`Withdrawal` records that reference the source are unaffected.

