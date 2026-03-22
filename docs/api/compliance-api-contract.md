# API Contract: External B2B — Compliance

> Generated: March 21, 2026  
> Source: Bluum Web API — `src/external/api/modules/compliance.yaml`, `src/external/api/modules/accounts.yaml` (compliance status), `src/external/api/schemas/account-schemas.yaml`, `src/external/controllers/compliance.controller.ts`, `src/validations/compliance.validation.ts`, `src/utils/compliance.formatter.ts`

## Auth quick reference

**External API (`/v1/*`)**

| Item | Value |
|------|--------|
| Auth | HTTP Basic — `Authorization: Basic base64(API_KEY:API_SECRET)` |
| Tenant | Resolved from the API key; partner tenant **KYC must be VERIFIED** unless `BYPASS_KYC` in non-production |
| Account scope | `account_id` must belong to the authenticated tenant (enforced in controllers) |

**Base URLs** (from `src/external/api/main.yaml`)

| Environment | Base URL |
|-------------|----------|
| Production | `https://service.bluumfinance.com/v1` |
| Sandbox / testing | `https://test-service.bluumfinance.com/v1` |

All paths below are relative to the base (include the `/v1` prefix in the host as above).

---

## Table of Contents

- [Endpoints](#endpoints)
  - [GET /v1/accounts/{account_id}/compliance](#get-v1accountsaccount_idcompliance)
  - [POST /v1/accounts/{account_id}/compliance/submit](#post-v1accountsaccount_idcompliancesubmit)
  - [POST /v1/accounts/{account_id}/compliance/restart](#post-v1accountsaccount_idcompliancerestart)
  - [GET /v1/accounts/{account_id}/compliance/workflows/{workflow_id}](#get-v1accountsaccount_idcomplianceworkflowsworkflow_id)
- [Account status vs compliance](#account-status-vs-compliance-lifecycle)
- [Error shape](#error-shape)

---

## GET /v1/accounts/{account_id}/compliance

**Summary**: Returns the **most recent** compliance workflow summary for the account (investor), including per-check results.

**OpenAPI tags**: Accounts

### Authentication

| API | Mechanism | Header(s) |
|-----|-----------|-----------|
| External `/v1/*` | HTTP Basic Auth | `Authorization: Basic base64(API_KEY:API_SECRET)` |

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `account_id` | string (UUID) | Yes | Investor / account id |

### Query parameters

None.

### Request body

None.

### Responses

#### 200 OK

```json
{
  "status": "success",
  "data": {
    "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
    "workflow_status": "in_progress",
    "workflow_type": "kyc",
    "risk_level": null,
    "checks": [
      {
        "type": "identity_verification",
        "status": "pending",
        "completed_at": null
      }
    ],
    "created_at": "2026-03-15T10:00:00.000Z",
    "updated_at": "2026-03-15T10:00:00.000Z"
  }
}
```

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `status` | string | No | Always `"success"` on success |
| `data.account_id` | string (UUID) | No | Account id |
| `data.workflow_status` | string | No | `in_progress`, `pending_review`, `approved`, `rejected`, `suspended`, `expired` |
| `data.workflow_type` | string | No | `kyc`, `kyb`, `periodic_review` |
| `data.risk_level` | string | Yes | `low`, `medium`, `high`, `prohibited` when known |
| `data.checks` | array | No | Latest snapshot of checks |
| `data.checks[].type` | string | No | e.g. `identity_verification`, `tax_id_verification`, `screening`, `risk_assessment`, `business_verification` |
| `data.checks[].status` | string | No | e.g. `pending`, `clear`, `review_required`, `failed`, `error` |
| `data.checks[].completed_at` | string (ISO 8601) | Yes | When the check finished |
| `data.created_at` | string (ISO 8601) | No | Workflow start |
| `data.updated_at` | string (ISO 8601) | No | Last update |

#### Error responses

| HTTP Status | Description |
|-------------|-------------|
| 401 | Missing/invalid Basic auth |
| 403 | Access denied to this account (wrong tenant) |
| 404 | Account not found |

---

## POST /v1/accounts/{account_id}/compliance/submit

**Summary**: Submit provider completion data for a check when **not** relying on Bluum webhooks (e.g. after Persona or Dojah client flows).

**Operation ID**: `submitComplianceCheck`

### Authentication

| API | Mechanism | Header(s) |
|-----|-----------|-----------|
| External `/v1/*` | HTTP Basic Auth | `Authorization: Basic base64(API_KEY:API_SECRET)` |

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `account_id` | string (UUID) | Yes | Investor / account id |

### Query parameters

None.

### Request body

Content-Type: `application/json`

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `workflow_id` | string | Yes | UUID | Workflow id from create-account or restart response |
| `check_type` | string | Yes | enum below | Must match a pending check on that workflow |
| `provider_payload` | object | Yes | Record (any values) | Provider-specific payload |

**`check_type` enum** (Zod + OpenAPI): `identity_verification`, `tax_id_verification`, `screening`, `business_verification`

```json
{
  "workflow_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "check_type": "identity_verification",
  "provider_payload": {
    "event_type": "inquiry.approved",
    "inquiry_id": "inq_abc123def456",
    "status": "approved"
  }
}
```

### Responses

#### 200 OK

OpenAPI documents **`ComplianceCheckResponse`** with **snake_case** fields (`check_type`, `workflow_id`, etc.). The live handler returns the service **`ComplianceCheckSummary`** object, which uses **camelCase** keys (`checkType`, `status`, `provider`, `externalId`, `verificationUrl`, `verificationToken`). **Type your client against a real response** or normalize in one adapter layer.

Example **runtime-oriented** shape:

```json
{
  "checkType": "identity_verification",
  "status": "clear",
  "provider": "persona-identity",
  "externalId": "inq_abc123def456",
  "verificationUrl": null,
  "verificationToken": null
}
```

#### Error responses

| HTTP Status | Code (typical) | Description |
|-------------|------------------|-------------|
| 400 | `BLUM-400-001` | Validation failed or no callback handler for check |
| 401 | `BLUM-401-*` | Auth failure |
| 404 | `BLUM-404-001` | Workflow/check not found, or account not in tenant |
| 409 | `BLUM-409-*` | Check not in `PENDING` (already completed) |

---

## POST /v1/accounts/{account_id}/compliance/restart

**Summary**: Creates a **new** KYC compliance workflow and runs checks. Use after rejection or when the user must re-verify. If the investor **`Investor.status`** is `REJECTED`, the service may transition them back toward verification (see Bluum `ComplianceService.initiateWorkflow`).

**Operation ID**: `restartComplianceWorkflow`

### Authentication

| API | Mechanism | Header(s) |
|-----|-----------|-----------|
| External `/v1/*` | HTTP Basic Auth | `Authorization: Basic base64(API_KEY:API_SECRET)` |

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `account_id` | string (UUID) | Yes | Investor / account id |

### Query parameters

None.

### Request body

None.

### Responses

#### 200 OK

```json
{
  "workflowId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "status": "IN_PROGRESS",
  "complianceChecks": [
    {
      "checkType": "identity_verification",
      "status": "pending",
      "provider": "persona-identity",
      "verificationUrl": "https://withpersona.com/verify/inq_abc123",
      "verificationToken": "sdk-token-xyz",
      "externalId": null
    }
  ]
}
```

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `workflowId` | string (UUID) | No | New workflow id — use for submit/poll |
| `status` | string | No | e.g. `IN_PROGRESS`, `APPROVED`, `REJECTED`, `PENDING_REVIEW` |
| `complianceChecks` | array | No | Per-check summaries and async handoff fields |

Nested items align with **`ComplianceCheckResponse`** in OpenAPI (mixed casing in examples — prefer camelCase from API for `checkType`, `verificationUrl`, `verificationToken`).

#### Error responses

| HTTP Status | Description |
|-------------|-------------|
| 401 | Auth failure |
| 404 | Account not found / not in tenant |
| 500 | Compliance providers not configured on the server |

---

## GET /v1/accounts/{account_id}/compliance/workflows/{workflow_id}

**Summary**: Fetch a **specific** workflow by id (useful for polling after async checks).

**Operation ID**: `getComplianceWorkflowStatus`

### Authentication

| API | Mechanism | Header(s) |
|-----|-----------|-----------|
| External `/v1/*` | HTTP Basic Auth | `Authorization: Basic base64(API_KEY:API_SECRET)` |

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `account_id` | string (UUID) | Yes | Investor / account id |
| `workflow_id` | string (UUID) | Yes | Workflow id |

### Query parameters

None.

### Request body

None.

### Responses

#### 200 OK

Response is **snake_case** (see `formatWorkflowResponse` in Bluum):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "in_progress",
  "risk_level": null,
  "checks": [
    {
      "check_type": "identity_verification",
      "status": "clear",
      "provider": "persona-identity",
      "external_id": "inq_abc123def456",
      "started_at": "2026-03-15T10:00:00.000Z",
      "completed_at": "2026-03-15T10:05:00.000Z"
    }
  ],
  "created_at": "2026-03-15T10:00:00.000Z",
  "updated_at": "2026-03-15T10:05:00.000Z"
}
```

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | No | Workflow id |
| `status` | string | No | Lowercase workflow status |
| `risk_level` | string | Yes | `low`, `medium`, `high`, `prohibited` |
| `checks` | array | No | Per-check results and timestamps |
| `checks[].check_type` | string | No | Check type (lowercase in response) |
| `checks[].status` | string | No | Check result (lowercase) |
| `checks[].provider` | string | No | Provider name |
| `checks[].external_id` | string | Yes | Provider reference |
| `checks[].started_at` | string (ISO 8601) | Yes | |
| `checks[].completed_at` | string (ISO 8601) | Yes | |
| `created_at` | string (ISO 8601) | No | |
| `updated_at` | string (ISO 8601) | No | |

#### Error responses

| HTTP Status | Description |
|-------------|-------------|
| 401 | Auth failure |
| 404 | Account/workflow not found or tenant mismatch |

---

## Account status vs compliance lifecycle

Bluum’s **investor account** record uses `Investor.status` and `kycStatus`. On create (without `BYPASS_KYC`), **`status`** is typically **`PENDING`** until the compliance workflow **approves**, then moves to **`ACTIVE`**; **`kycStatus`** tracks verification state. Use **GET account** (accounts API) for `account.status` / trading eligibility, and the compliance endpoints above for **workflow** state and **check** handoff URLs.

---

## Error shape

Typical error JSON:

```json
{
  "code": "BLUM-404-001",
  "message": "Account not found"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | `BLUM-{http}-{seq}` |
| `message` | string | Human-readable |

---

## Example: submit after hosted flow

```http
POST /v1/accounts/3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b/compliance/submit HTTP/1.1
Host: service.bluumfinance.com
Authorization: Basic <base64(API_KEY:API_SECRET)>
Content-Type: application/json

{
  "workflow_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "check_type": "identity_verification",
  "provider_payload": {
    "event_type": "inquiry.completed",
    "inquiry_id": "inq_abc123def456"
  }
}
```

---

*Upstream spec: `src/external/api/main.yaml` → modules `compliance.yaml`, `accounts.yaml`. Regenerate bundled docs in the API repo with `yarn docs:bundle`.*
