# API Contract: External B2B — Assets

> Generated: March 20, 2026  
> Source: Bluum Web API — `src/external/api/modules/assets.yaml`, `src/external/api/schemas/assets-schemas.yaml`, `src/external/controllers/assets.controller.ts`, `src/validations/assets.validation.ts`

## Auth quick reference

**External API (`/v1/*`)**

| Item | Value |
|------|--------|
| Mechanism | HTTP Basic — `Authorization: Basic base64(API_KEY:API_SECRET)` |
| Tenant | Resolved from the API key; tenant **KYC must be `VERIFIED`** to call the API (unless `BYPASS_KYC` in dev) |

**Base URLs** (from `src/external/api/main.yaml`)

| Environment | Base |
|---------------|------|
| Production | `https://service.bluumfinance.com/v1` |
| Sandbox / test | `https://test-service.bluumfinance.com/v1` |

All paths below are relative to the base (include `/v1` in the host base URL).

---

## Table of contents

- [Authentication](#auth-quick-reference)
- [Endpoints](#endpoints)
  - [GET /assets/search](#get-v1assetssearch)
  - [GET /assets/list](#get-v1assetslist)
  - [GET /assets/chart](#get-v1assetschart)
  - [GET /assets/{symbol}](#get-v1assetssymbol)
- [Shared types](#shared-response-shapes)
- [Implementation notes](#implementation-notes)

---

## GET `/v1/assets/search`

**Summary:** Search tradable assets by ticker, name, or partial string. If `q` is omitted, returns a capped list (see server default for limit).

### Authentication

| API | Mechanism | Header |
|-----|-----------|--------|
| External `/v1/*` | HTTP Basic | `Authorization: Basic base64(API_KEY:API_SECRET)` |

### Path parameters

None.

### Query parameters

| Name | Type | Required | Default | Validation | Description |
|------|------|----------|---------|------------|-------------|
| `q` | string | No | — | — | Search text (ticker, name, partial) |
| `status` | string | No | `active` | `active` \| `inactive` | Listing status filter |
| `asset_class` | string | No | — | `us_equity` \| `crypto` \| `us_option` | Asset class filter |
| `market` | string | No | — | — | Optional market hint (validated in service layer) |
| `limit` | integer | No | **50** (server default when omitted) | 1–100 | Max results |

### Request body

None.

### Responses

#### 200 OK

Success responses include an envelope from the controller:

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
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

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `status` | string | No | Always `"success"` on success |
| `data` | array | No | `AssetSearchResult` items (see [Shared types](#shared-response-shapes)) |
| `count` | integer | No | `data.length` |

#### Error responses

| HTTP | Code (typical) | Description |
|------|----------------|-------------|
| 400 | `BLUM-400-*` | Invalid query (e.g. `ASSET_SEARCH_QUERY_PARAMETER_VALIDATION`) |
| 401 | `BLUM-401-*` | Missing/invalid API credentials |
| 500 | `BLUM-500-*` | Server error |

### Example request

```http
GET /v1/assets/search?q=AAPL&status=active&limit=20 HTTP/1.1
Host: service.bluumfinance.com
Authorization: Basic <base64(API_KEY:API_SECRET)>
```

---

## GET `/v1/assets/list`

**Summary:** List assets with optional filters (broader browse than search).

### Path parameters

None.

### Query parameters

| Name | Type | Required | Default | Validation | Description |
|------|------|----------|---------|------------|-------------|
| `status` | string | No | `active` | `active` \| `inactive` | Status filter |
| `asset_class` | string | No | — | `us_equity` \| `crypto` \| `us_option` | Asset class |
| `market` | string | No | — | — | Optional market filter |
| `tradable` | boolean | No | — | `true` / `false` (query string) | Only tradable when `true` |
| `limit` | integer | No | — | 1–100 | Cap result count (server may apply additional defaults) |

### Responses

#### 200 OK

```json
{
  "status": "success",
  "data": [ { "...": "AssetSearchResult" } ],
  "count": 0
}
```

#### Error responses

| HTTP | Code (typical) | Description |
|------|----------------|-------------|
| 400 | `BLUM-400-*` | Invalid query (`ASSET_LIST_QUERY_PARAMETER_VALIDATION`) |
| 401 | `BLUM-401-*` | Auth failure |
| 500 | `BLUM-500-*` | Server error |

### Example request

```http
GET /v1/assets/list?asset_class=us_equity&tradable=true HTTP/1.1
Host: service.bluumfinance.com
Authorization: Basic <base64(API_KEY:API_SECRET)>
```

---

## GET `/v1/assets/chart`

**Summary:** Historical OHLCV bars for charting.

### Path parameters

None.

### Query parameters

| Name | Type | Required | Default | Validation | Description |
|------|------|----------|---------|------------|-------------|
| `symbol` | string | **Yes** | — | Non-empty; normalized uppercase | Ticker (e.g. `AAPL`) |
| `timeframe` | string | **Yes** | — | See enum below | Bar size |
| `start` | string (ISO 8601) | No | — | Strict ISO pattern in Zod | Range start |
| `end` | string (ISO 8601) | No | — | Same | Range end |
| `limit` | integer | No | (service default) | 1–10000 | Max bars |
| `adjustment` | string | No | — | `raw` \| `split` \| `dividend` \| `all` | Corporate-action adjustment |
| `feed` | string | No | — | `iex` \| `sip` \| `otc` | Market data feed |

**`timeframe` allowed values** (from `Timeframe` enum / `TIMEFRAME_VALUES`):  
`1Min`, `5Min`, `15Min`, `30Min`, `1Hour`, `1Day`, `1Week`, `1Month`

### Responses

#### 200 OK

```json
{
  "status": "success",
  "data": {
    "symbol": "AAPL",
    "bars": [
      {
        "timestamp": "2025-01-15T16:00:00.000Z",
        "open": 175.25,
        "high": 177.5,
        "low": 174.8,
        "close": 176.75,
        "volume": 5000000,
        "tradeCount": 12500,
        "volumeWeightedAveragePrice": 176.2
      }
    ],
    "nextPageToken": null
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.symbol` | string | Ticker |
| `data.bars` | array | `ChartBar` rows |
| `data.nextPageToken` | string \| null | Pagination token if provided by custodian |

#### Error responses

| HTTP | Code (typical) | Description |
|------|----------------|-------------|
| 400 | `BLUM-400-*` | Invalid chart params (`CHART_QUERY_PARAMETER_VALIDATION`) |
| 401 | `BLUM-401-*` | Auth failure |
| 500 | `BLUM-500-*` | Server error |

### Example request

```http
GET /v1/assets/chart?symbol=AAPL&timeframe=1Day&limit=100 HTTP/1.1
Host: service.bluumfinance.com
Authorization: Basic <base64(API_KEY:API_SECRET)>
```

---

## GET `/v1/assets/{symbol}`

**Summary:** Resolve a single asset by ticker (DB first, then custodian resolution). Optional `market` speeds up lookup.

### Path parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | string | Yes | Ticker; trimmed and uppercased server-side |

### Query parameters

| Name | Type | Required | Validation | Description |
|------|------|----------|------------|-------------|
| `market` | string | No | Uppercased if present | Hint: `XNAS`, `XNYS`, `BATS`, `ARCA`, `OTC`, `XNSA` |

### Responses

#### 200 OK

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
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
    "price": 178.5,
    "change": 1.5,
    "changePercent": 0.85,
    "previousClose": 177,
    "bidPrice": 178.48,
    "askPrice": 178.52
  }
}
```

Optional numeric quote fields may be omitted when unavailable.

#### Error responses

| HTTP | Code (typical) | Description |
|------|----------------|-------------|
| 400 | `BLUM-400-*` | Invalid path/query |
| 401 | `BLUM-401-*` | Auth failure |
| 404 | `BLUM-404-*` | Asset not found (`ASSET_NOT_FOUND`) |
| 500 | `BLUM-500-*` | Server error |

### Example request

```http
GET /v1/assets/AAPL?market=XNAS HTTP/1.1
Host: service.bluumfinance.com
Authorization: Basic <base64(API_KEY:API_SECRET)>
```

---

## Shared response shapes

### `AssetSearchResult` (array items / single `data`)

| Field | Type | Required in schema | Notes |
|-------|------|--------------------|--------|
| `id` | string | Yes | UUID |
| `class` | string | Yes | `us_equity`, `crypto`, `us_option`, `ng_equity`, `ng_bond`, `ng_etf`, … |
| `market` | string | Yes | MIC or venue label (e.g. `XNAS`, `NASDAQ`) |
| `symbol` | string | Yes | Ticker |
| `name` | string | Yes | Issuer name |
| `status` | string | Yes | `active` \| `inactive` |
| `tradable` | boolean | Yes | |
| `marginable` | boolean | Yes | |
| `shortable` | boolean | Yes | |
| `easy_to_borrow` | boolean | Yes | |
| `fractionable` | boolean | Yes | |
| `currency` | string | Yes | ISO 4217 |
| `price` | number | No | Often on detail (`GET /assets/{symbol}`) |
| `change` | number | No | |
| `changePercent` | number | No | |
| `previousClose` | number | No | |
| `bidPrice` | number | No | |
| `askPrice` | number | No | |

### `ChartBar`

| Field | Type | Required |
|-------|------|----------|
| `timestamp` | string (ISO date-time) | Yes |
| `open`, `high`, `low`, `close` | number | Yes |
| `volume` | integer | Yes |
| `tradeCount` | integer | No |
| `volumeWeightedAveragePrice` | number | No |

---

## Implementation notes

1. **Envelope:** Live API responses use `{ "status": "success", ... }` from `AssetsController`. Bundled OpenAPI examples sometimes show only `data` / raw arrays—**use the controller shape** for FE types.
2. **Search vs list:** `search` supports `q` and defaults **limit to 50** in `AssetService.searchAssets` when omitted. `list` supports `tradable` and optional `limit` per validation schema.
3. **Chart dates:** `start` / `end` must match the Zod ISO pattern in `assets.validation.ts` (see `isoDateTimeSchema`).
4. **Security:** Never embed API secrets in client-side apps; call through your backend or a secure BFF.

---

*Bluum OpenAPI entrypoint: `src/external/api/main.yaml` (paths under `/assets/*` reference `modules/assets.yaml`).*
