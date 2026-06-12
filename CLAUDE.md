# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server (port 3001)
npm run lint     # ESLint via Next.js
```

No test framework is configured.

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript 5** (strict mode)
- **Tailwind CSS v4** — dark mode only, no light theme
- **Zustand 5** — global state; `user.store` persists to `localStorage`
- **Radix UI primitives** + Shadcn UI patterns in `components/ui/`
- **Sonner** for toast notifications, **Recharts** for charts, **Lucide React** for icons
- **Prettier** — 140 char width, single quotes, trailing commas (es5), 2-space indent

## Architecture

### Three-Tier API Pattern

All data flows through three layers — never call the Bluum backend directly from client components:

1. **`lib/bluum-api.ts`** — Server-only Bluum API client (Basic Auth with `BLUUM_API_KEY:BLUUM_SECRET_KEY`). Only used inside `app/api/` route handlers.
2. **`app/api/`** — Next.js routes that bridge client ↔ Bluum:
   - **Dynamic Bluum proxy** — `app/api/bluum/[[...path]]/route.ts` forwards to `BLUUM_API_BASE_URL` (`/v1/...`). Only these first path segments are allowed: `investors`, `assets`, `documents`, `banks`, `markets`, `webhooks`. Forwards method, query string, JSON body, and `Idempotency-Key` when present.
   - **Do not** add one-off Next routes whose only job is to re-proxy a Bluum path (e.g. `/api/accounts/.../transactions`). Client services should call `/api/bluum/...` so everything goes through this single proxy.
   - **Other** routes: `wealth/`, `widget/`, `currency/`, `health/`. (An `investment/` API tree may still exist under `app/api/` but **`services/` do not call it**; Bluum `/v1` traffic from the app goes through `/api/bluum/...` only.)
3. **`services/*.service.ts`** — Client-side services that call Next API routes via `fetch()`. All API access from components **must** go through services.

**Example flow:** Component → `InvestmentService.getPositions(accountId)` → `fetch('/api/bluum/investors/{id}/positions')` → `bluumApi.forward({ url: '/investors/{id}/positions' })` → Bluum backend.

**Naming:** External docs sometimes say `account_id`; Bluum REST paths use **`investors/{investor_id}`**. In this demo the persisted `externalAccountId` / `NEXT_PUBLIC_DEMO_INVESTOR_ACCOUNT_ID` is that investor id.

### State Management

- **Global:** Zustand in `store/user.store.ts` (auth, user profile) — persists to `localStorage` as `bluum-user`. `store/account.store.ts` holds portfolio data in memory (re-fetched per session; after a successful `getAccount`, `externalAccountId` may be synced to the canonical `account.id`).
- **Component-level:** `useState`/`useEffect` calling services directly.
- Selector hooks from stores: `useIsAuthenticated()`, `useUser()`, `useExternalAccountId()`.

### Services (non-exhaustive)

- **`InvestmentService`** — positions, orders, assets, market data; delegates `getTransactions` to `TransactionService`.
- **`TransactionService`** — `GET /api/bluum/investors/{id}/transactions` (filters: `type`, `status`, `currency`, dates, `limit`, `offset`).
- **`TransferService`** — deposits and withdrawals via `/api/bluum/investors/{id}/deposits|withdrawals`.
- **`AccountService`**, **`FundingSourceService`**, **`WidgetService`**, wealth helpers — see `services/`.

Display helpers for the transactions UI live in `lib/transaction-format.ts` (no API calls).

### Routing & Auth

- Route group `app/(dashboard)/` wraps all authenticated pages — its `layout.tsx` acts as the auth guard, redirecting unauthenticated users to `/signin`.
- Nested route group `app/(dashboard)/(invest)/` groups investment features under a shared sub-layout.
- **Demo auth only** — no real backend. Predefined accounts:
  - `wealth@bluuminvest.com` — AI Wealth flow
  - `self@bluuminvest.com` — Self-Directed flow
  - `demo@bluuminvest.com` — New investor flow
  - Password: any string ≥ 8 chars

### Styling Conventions

Dark mode only. Design tokens are defined in `app/globals.css`:

| Token | Value |
|-------|-------|
| Background | `#0E231F` |
| Primary | `#083423` |
| Card | `#0F2A20` |
| Border | `#1E3D2F` |
| Accent/success | `#30D158` |
| Text muted | `#8DA69B`, `#A1BEAD` |

Always use `cn()` from `@/lib/utils` for conditional Tailwind classes. Prefer semantic tokens (`bg-card`, `text-foreground`, `border-border`) over raw hex unless Tailwind has no match. Avoid inline styles.

## Key Conventions

- **`'use client'`** directive required for any component using hooks or interactivity.
- **Components:** PascalCase filenames, named exports, TypeScript interfaces for all props.
- **Pages/routes:** kebab-case directory names.
- **Icons:** Use Lucide React or create icon components in `components/icons/` with the `name.icon.tsx` naming pattern.
- **Error handling:** `try/catch` in service calls → `toast.error(err.message)` from Sonner.
- **Don't** create new UI components if Shadcn UI (`components/ui/`) has an equivalent.
- **Don't** call `app/api/` endpoints directly from components — always use a service class.
- **Don't** add Next routes that only re-wrap Bluum `/v1` paths — use `/api/bluum/...` from services instead.
- **Don't** use `lib/bluum-api.ts` in client components or pages — server-side only.
- **Don't** expose internal demo implementation in user-facing copy, toasts, or UI (no `demo`/`seed` in visible order ids or error messages). Use `lib/order-id.ts` (`createOrderId`, `formatOrderReference`) for simulated orders.

## Demo vs API data sources

Asset quotes and trading (positions, orders, wallets) use **independent** toggles (`lib/demo-mode.ts`). Both default to **`demo`** unless env is explicitly `api`.

| Toggle | Env var | When `demo` |
|--------|---------|-------------|
| Asset data | `NEXT_PUBLIC_ASSET_DATA_SOURCE` | `InvestmentService` asset/quote methods use `lib/demo/assets.ts` |
| Trading data | `NEXT_PUBLIC_TRADING_DATA_SOURCE` | Positions, orders, wallets use `lib/demo/trading-store.ts` (localStorage) |

**Not gated by trading demo:** wealth/widget APIs — account, summary, chart, IPS, insights, goals (`WidgetService`, `AccountService`, transfers). The invest page uses `wealthAccountId` (`externalAccountId`) for those and `tradingAccountId` (`resolveDemoInvestorKey(...)`) for positions/orders only.

**Trading demo specifics:**
- Simulated state in `localStorage` (`bluum-demo-trading:{investorKey}`); writes dispatch `demo-trading-updated`.
- Bank wallets: Checking `3168`, Savings `2651` (`lib/demo/bank-accounts.ts`); deposits/withdrawals and order placement debit/credit by `wallet_id`.
- Seed holdings: MSFT, AAPL, NVDA + matching filled buy orders. Portfolio total (`usePortfolioValue`) = sum of position `market_value` only (cash lives in bank wallets).
- Components that must stay in sync listen for `demo-trading-updated` and refetch (e.g. invest page positions/orders, `RecentTrades`, `useBankAccounts`).

**Recent Trades** (`components/widget/recent-trades.tsx`) shows **orders** (not positions), via `fetchOrders` + shared `order-display` helpers.

## Environment Variables

Defined in `.env`, configured in `lib/config.ts`:

- `BLUUM_API_BASE_URL` — Bluum backend base URL
- `BLUUM_API_KEY` / `BLUUM_SECRET_KEY` — server-side only credentials
- `NEXT_PUBLIC_DEMO_INVESTOR_ACCOUNT_ID` — safe to expose to client
- `NEXT_PUBLIC_ASSET_DATA_SOURCE` — `api` \| `demo` (default: `demo`)
- `NEXT_PUBLIC_TRADING_DATA_SOURCE` — `api` \| `demo` (default: `demo`)
