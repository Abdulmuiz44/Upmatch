# Upmatch Architecture

## System Overview

Upmatch is a Next.js application with a server-rendered dashboard, a Postgres database accessed through a lightweight `pg` data layer, and server-only integrations for authentication and Upwork connectivity. The product is intentionally designed around compliant job discovery and decision support rather than submission automation.

## Architecture Goals

- keep all external integrations server-side
- make compliance constraints visible in code structure
- minimize sensitive data exposure and retention
- isolate business logic from UI routes
- keep modules replaceable as the product evolves
- support explainable ranking instead of opaque automation

## Module Breakdown

- `app/`: route handlers, layouts, and page shells
- `components/`: reusable UI primitives and page-level sections
- `lib/auth/`: cookie session auth, validation, and handlers
- `lib/upwork/`: OAuth URL building, token exchange scaffolding, tenant-aware request helpers
- `lib/crypto/`: encryption helpers for token-at-rest protection
- `server/repos/`: focused SQL-backed repository modules
- `server/services/`: orchestration and business logic modules
- `db/`: SQL schema bootstrap scripts
- `docs/`: product, architecture, and implementation docs

## Frontend Structure

The UI uses App Router with a split between public and protected experiences.

- public marketing and auth pages live under top-level public route groups
- dashboard routes live under `/dashboard`
- dashboard layout owns navigation, header context, and shell structure
- page components are kept light and pull data through service functions
- reusable sections render connection status, preference summary, and job placeholders

The frontend should remain mostly server-rendered until there is a clear interaction requirement for client components.

## Auth Layer

The foundation uses a clean custom cookie-session auth module rather than binding the whole app to a third-party auth framework on day zero. This keeps the product bootable while leaving a clear migration path to NextAuth/Auth.js or another provider later.

Auth responsibilities:

- create user accounts with hashed passwords
- verify credentials on sign-in
- issue signed session cookies
- read session state in server components
- protect dashboard routes via middleware
- expose clear helpers such as `getCurrentUser` and `requireUser`

The cookie signing secret is sourced from `NEXTAUTH_SECRET` so the future swap to NextAuth remains straightforward.

## Upwork OAuth Module

The Upwork integration layer is separated from route code.

Core responsibilities:

- build authorization URLs
- validate callback parameters
- exchange authorization code for tokens
- capture optional tenant identifier
- encrypt tokens before persistence
- expose a typed account status surface to the rest of the app

The connect and callback routes stay thin and delegate into `lib/upwork` plus service functions.

## Upwork GraphQL Client

The future GraphQL client should sit behind a single server-side abstraction that:

- injects bearer auth
- conditionally sends `X-Upwork-API-TenantId`
- captures request metadata for observability
- enforces conservative pacing and retry behavior
- returns typed, normalized DTOs to services

No client-side component should call Upwork directly.

## Profile Sync Service

The profile sync service will:

- read a connected Upwork account for a user
- call allowed profile queries through the official GraphQL API
- normalize profile fields for local use
- write the current freelancer profile snapshot
- preserve only the minimum raw payload required for traceability

The service should tolerate partial data and avoid hard-failing the dashboard when profile sync is unavailable.

## Job Search Service

The job search service will:

- read user preferences and profile context
- build compliant search inputs for official GraphQL queries
- fetch jobs within rate budgets
- normalize jobs into a short-lived local representation
- record sync timestamps and partial failures

Retention rule:

- job cache data should be treated as expiring operational data and pruned aggressively to stay within documented limits

## Ranking Engine Design

The ranking engine should remain deterministic in v1.

Inputs:

- user preferences
- freelancer profile strengths
- normalized job attributes
- exclusion rules
- freshness signals

Outputs:

- numeric match score
- ranked list ordering
- explanation items
- warning flags such as low budget or excluded term matches

The engine must be pure enough to unit test independently from the UI and external APIs.

## Proposal Assist Service

Proposal assist is an advisory module, not a submission module.

It should eventually:

- summarize job needs
- extract relevant profile evidence
- suggest talking points
- highlight missing proof points
- produce drafts or outlines for the user to review manually

It must never submit a proposal, manage Connects automatically, or impersonate user intent.

## Background Worker Strategy

The foundation does not introduce a worker system yet. The architecture should prepare for one.

Future worker responsibilities:

- scheduled profile refresh
- controlled job sync
- retention cleanup
- token refresh
- retry processing for transient upstream failures

A queue-backed or cron-backed worker layer should be added only when sync complexity justifies it.

## Data Flow

1. User signs up or signs in.
2. Middleware validates session cookie for protected routes.
3. User initiates Upwork connection from the dashboard or settings page.
4. Upmatch redirects the user to the OAuth authorize endpoint.
5. Upwork redirects back with `code` and state metadata.
6. Callback handler exchanges code for tokens server-side.
7. Tokens are encrypted before they are stored in `ConnectedAccount`.
8. Onboarding writes `UserPreference`.
9. Future services sync profile and job data into normalized tables.
10. Ranking service computes scores and explanations for dashboard display.

## Directory Structure

```text
app/
  api/
  dashboard/
  (auth)/
  (marketing)/
components/
  forms/
  layout/
  ui/
lib/
  auth/
  crypto/
  upwork/
  env.ts
  utils.ts
server/
  repos/
  services/
db/
  schema.sql
docs/
public/
```

## Schema Overview

### `User`

- account identity
- hashed password
- timestamps
- relations to connected accounts, profile, and preferences

### `ConnectedAccount`

- provider identity, initially `upwork`
- encrypted token fields
- token expiry metadata
- tenant id
- connection status
- sync timestamps

### `FreelancerProfile`

- one active profile snapshot per user
- core Upwork identifiers
- title, overview, rate, categories, skills
- raw data reference for careful audit/debug use

### `UserPreference`

- role targeting
- budget/rate minimums
- preferred and excluded keywords
- industries
- contract types

## Security Architecture

- passwords are stored as hashes only
- session cookies are signed, HTTP-only, same-site, and server-controlled
- Upwork secrets remain in server-only env access
- access and refresh tokens are encrypted before persistence
- route handlers perform auth checks server-side
- dashboard pages rely on authenticated server rendering
- future audit events should record account connect, refresh, and sync activity

## Failure Handling

- invalid auth input returns user-facing form errors
- missing session redirects to login
- missing Upwork configuration returns a controlled server error
- OAuth callback failures redirect back to settings with an error code
- token exchange should treat upstream failures as non-destructive and retryable
- placeholder dashboard content should remain available even when sync is not configured

## Testing Strategy

- unit tests for env parsing, auth validation, token crypto, and ranking logic
- integration tests for signup, login, protected routing, onboarding persistence, and OAuth callback handling
- service tests for repository and service boundaries
- end-to-end smoke tests for landing, auth, and dashboard access flows

## Engineering Rules

- do not implement unsupported Upwork write actions
- do not scrape Upwork pages
- do not expose external API logic to client components
- keep route handlers thin
- keep business logic inside services
- validate all inputs with Zod
- prefer typed DTOs over raw anonymous objects
- default to conservative compliance choices when docs are ambiguous
- document assumptions in code near sensitive integration points
