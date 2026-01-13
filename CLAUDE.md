# CLAUDE.md - BuybidHQ Project Guidelines

This file provides context for Claude Code when working on the BuybidHQ codebase.

## Project Overview

BuybidHQ is a vehicle bid request platform for auto dealers. It enables dealers to send, manage, and track buy bids on used vehicles via SMS and email.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: TanStack Query v5 (server state), React hooks (local state)
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth)
- **Integrations**: Stripe (payments), Twilio (SMS), Resend (email), NHTSA (VIN decoding)
- **Testing**: Vitest + React Testing Library

## Common Commands

```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run e2e:stripe   # Run Stripe E2E tests
```

## Project Structure

```
src/
├── components/      # UI components organized by feature
├── pages/           # Route components
├── hooks/           # Custom React hooks (use* prefix)
├── contexts/        # React contexts (AuthContext, NotificationContext)
├── types/           # TypeScript interfaces and types
├── utils/           # Helper functions
├── services/        # API service integrations
├── integrations/    # External service configs
└── __tests__/       # Test files
```

## Key Patterns

### Imports
Use path alias `@/*` for imports from `src/`:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
```

### Components
- Use functional components with TypeScript
- shadcn/ui components are in `src/components/ui/`
- Feature components are grouped by domain (e.g., `components/bid-request/`)

### Data Fetching
Use TanStack Query hooks:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
});
```

### Forms
Use React Hook Form with Zod validation:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
});
```

### Supabase
Access via the client in `src/integrations/supabase/client.ts`:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

## User Roles

Roles in order of privilege:
1. **Member** - Basic account members
2. **Manager** - Team managers (group plans)
3. **Account Admin** - Account administrators with billing
4. **Super Admin** - System administrators

## ESLint Configuration

The project uses relaxed TypeScript rules for flexibility:
- `@typescript-eslint/no-explicit-any`: off
- `@typescript-eslint/no-unused-vars`: off
- `no-console`: off

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Testing

Tests are in `src/__tests__/` and use Vitest:
```bash
npm run test         # Run tests (if configured)
```

## Deployment

- **Platform**: Netlify (auto-deploy from main branch)
- **Build output**: `dist/`
- **Staging workflow**: Push to `staging` branch first, then merge to `main`

## React Code Quality Standards

When writing or reviewing React/TypeScript code, enforce these patterns:

### Required Practices
1. **TypeScript interfaces** for all props—never use `any` or implicit types
2. **Custom hooks** when 3+ related useState calls exist in one component
3. **Early returns** for loading/error/empty states before main render
4. **React Query/SWR** for data fetching—no raw useEffect + fetch patterns
5. **Component extraction** when JSX exceeds ~50 lines
6. **Descriptive naming**: `handleBidSubmit` not `onClick2` or `handleClick`

### Prohibited Patterns (Flag and Refactor)
- Inline async functions in onClick/onChange handlers
- Props drilled more than 2 levels deep (use context or composition)
- Nested ternaries in JSX (3+ levels)
- Optional chaining chains (`a?.b?.c?.d?.e`)—indicates missing types
- Components over 200 lines
- Multiple useEffects with overlapping dependencies
- Copy-pasted fetch/API calls (abstract to service layer)

### Code Review Behavior
When I paste React code:
1. Identify violations silently
2. Provide refactored version first
3. List specific violations fixed (brief bullet points)
4. If code is clean, confirm with single line—no unnecessary praise

### Generation Behavior
When generating new React code:
- Start with interface/type definitions
- Use composition over monolithic components
- Include error boundaries where appropriate
- Default to controlled components with proper TypeScript events

## Custom Hooks Library

### Bid Request Hooks (`@/hooks/bid-request`)
- `useBidRequestImages` - Image fetching and carousel state
- `useBidRequestBuyers` - Invited buyers fetching with response data
- `useOfferStatus` - Optimistic offer status updates
- `useReconEstimate` - Currency formatting for recon estimates
- `useQuadrantData` - Brakes/tires quadrant measurement parsing

### Marketplace Hooks (`@/hooks/marketplace`)
- `useMarketplaceVehicle` - Vehicle data fetching
- `usePriceVisibility` - Plan-based price visibility
- `useVehicleImages` - Cached image fetching with TanStack Query

## VIN Service Architecture

The VIN service is organized as a modular package:
```
src/services/vin/
├── index.ts          # Barrel export
├── types.ts          # TypeScript interfaces
└── constants/        # Fallback data
```

Usage:
```typescript
import { vinService, VehicleData, TrimOption } from "@/services/vin";
```

## Type Definitions

Shared types are in `src/types/`:
- `notification.ts` - Toast options and notification types
- `security.ts` - Security event and session types
- `accounts.ts`, `users.ts`, etc. - Domain-specific types

## Important Notes

- Multi-tenant architecture with account-based data isolation
- Row Level Security (RLS) enforced at database level
- Authentication handled by Supabase Auth with MFA support
- Built with Lovable - commits from Lovable are auto-synced
