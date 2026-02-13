# AGENT.md - Bluum Invest Project

## Role

Senior Frontend Developer: **Clean Code**, **Performance**, and **Proactive**.

## Project Overview

An invest application built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives + Shadcn UI patterns
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Charts**: Recharts
- **State**: React hooks (useState, useEffect)

## Design System

### Theme

- **Default Theme**: Dark mode only (`#0E231F` background)
- **Primary Color**: `#083423` (dark green)
- **Card Background**: `#0F2A20`
- **Border Color**: `#1E3D2F`
- **Text Colors**:
  - Primary: White (`#FFFFFF`)
  - Muted: `#8DA69B`, `#A1BEAD`, `#B0B8BD`
  - Accent: `#30D158` (green)

### Typography

- **Font Family**: Inter (via Next.js font optimization)
- **Font Sizes**: Use Tailwind text utilities (`text-sm`, `text-base`, `text-lg`, etc.)
- **Font Weights**: `font-extralight`, `font-light`, `font-normal`, `font-medium`, `font-semibold`

## Code Style Guidelines

### Components

- Use functional components with TypeScript
- Use Shadcn UI components from `@/components/ui/`
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks when appropriate

### Styling

- **Prefer Tailwind classes** over inline styles
- Try to avoid inline styles, only use when necessary
- Follow existing patterns
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Use semantic color tokens: `bg-card`, `text-foreground`, `border-border`

### File Structure

```
app/
  ├── (dashboard)/          # Route groups with shared layout
  │   ├── dashboard/         # Main dashboard
  │   ├── (invest)/         # Investment-related routes
  │   └── onboarding/       # User onboarding flow
  ├── signin/               # Authentication
  ├── api/                  # API routes
  └── layout.tsx            # Root layout

components/
  ├── ui/                   # Shadcn UI components
  ├── invest/               # Investment-specific components
  └── navigation/           # Navigation components

lib/                        # Utilities, auth, constants
services/                   # API service clients
types/                      # TypeScript definitions
```

### Naming Conventions

- Components: PascalCase (`SidebarNav.tsx`)
- Files: kebab-case for pages, PascalCase for components
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE (`DEFAULT_EMAIL`)

## Key Patterns

### Authentication

- Use `getAuth()` from `@/lib/auth` to get current user

### API Integration

- Use service classes from `@/services/` directory
- Handle errors with try/catch and toast notifications
- Use `toast.success()` and `toast.error()` from Sonner

### Form Handling

### Navigation

- Use Next.js `Link` component for client-side navigation
- Use `useRouter()` from `next/navigation` for programmatic navigation
- Check active routes with `usePathname()`

## Common Tasks

### Adding a New Page

1. Create file in appropriate `app/` directory
2. Use `'use client'` if component needs interactivity
3. Follow existing layout patterns
4. Use dark theme colors

### Adding a New Component

1. Create in `components/` directory (or subdirectory)
2. Export as named export
3. Use TypeScript interfaces for props
4. Include proper error handling
5. user `name.icon.tsx` for icons (`components/icons`)

### Styling Components

1. Start with Tailwind utility classes
2. Use design tokens from `globals.css` when possible
3. Match existing component patterns
4. Ensure dark mode compatibility

## Important Notes

### Dark Theme

- **Use dark theme** - it's the default and only theme at the moment.

### Figma Integration

- When converting Figma designs, preserve exact colors, spacing, and typography
- Use exact hex colors from Figma when Tailwind doesn't have a match
- Remove unnecessary wrappers and styling properties, and redundant divs
- Maintain visual fidelity to designs

### Performance

## Don'ts

- Don't create new UI components if Shadcn UI has equivalents
- Don't call API endpoints directly use /service methods
