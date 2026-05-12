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
- **Zustand 5** — minimal global state with localStorage persistence
- **Radix UI primitives** + Shadcn UI patterns in `components/ui/`
- **Sonner** for toast notifications, **Recharts** for charts, **Lucide React** for icons
- **Prettier** — 140 char width, single quotes, trailing commas (es5), 2-space indent

## Architecture

### Three-Tier API Pattern

All data flows through three layers — never call the Bluum backend directly from client components:

1. **`lib/bluum-api.ts`** — Server-only Bluum API client (Basic Auth with `BLUUM_API_KEY:BLUUM_SECRET_KEY`). Only used inside `app/api/` route handlers.
2. **`app/api/`** — Next.js API routes that bridge client ↔ Bluum backend. Investment/trading uses the dynamic proxy `app/api/bluum/[[...path]]/` (allowlisted segments); other areas include `wealth/`, `widget/`, `currency/`, `health/`.
3. **`services/*.service.ts`** — Client-side service classes that call the Next.js API routes via `fetch()`. All API communication from components **must** go through services.

**Example flow:** Component → `InvestmentService.getPositions(accountId)` → `fetch('/api/bluum/investors/{id}/positions')` → `bluumApi.forward()` → Bluum backend

### State Management

- **Global:** Zustand in `store/user.store.ts` (auth, user profile) and `store/account.store.ts` (portfolio data). Both persist to localStorage.
- **Component-level:** `useState`/`useEffect` calling services directly.
- Selector hooks from stores: `useIsAuthenticated()`, `useUser()`, `useExternalAccountId()`.

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
- **Don't** use `lib/bluum-api.ts` in client components or pages — server-side only.

## Environment Variables

Defined in `.env`, configured in `lib/config.ts`:

- `BLUUM_API_BASE_URL` — Bluum backend base URL
- `BLUUM_API_KEY` / `BLUUM_SECRET_KEY` — server-side only credentials
- `NEXT_PUBLIC_DEMO_INVESTOR_ACCOUNT_ID` — safe to expose to client
