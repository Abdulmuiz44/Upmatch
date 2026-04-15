# Upmatch Technical README

## What Upmatch Is

Upmatch is a compliance-first Upwork job intelligence copilot for freelancers. It helps users connect their Upwork account, define fit criteria, review job matches, and prepare stronger applications while keeping the actual application step inside Upwork.

## Why It Exists

Freelancers need better signal, not more noise. The Upwork job feed can be broad, repetitive, and time-consuming to triage. Upmatch exists to reduce wasted attention and improve decision quality using official platform integrations and explainable matching logic.

## What the MVP Does

- supports local product account signup and login
- protects a private dashboard
- scaffolds official Upwork OAuth connection
- stores the connection foundation securely
- collects structured job preferences
- prepares the application for profile sync, job ingestion, ranking, and proposal assistance

## What the MVP Does Not Do

- auto-apply to jobs
- submit proposals directly
- scrape Upwork pages
- automate Connects purchasing or usage
- imitate browser activity on behalf of the user

## Recommended Stack

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS
- shadcn/ui-style reusable component primitives
- Postgres
- `pg`
- Zod
- server-side OAuth integration module for Upwork

## Local Development

1. Copy `.env.example` to `.env`.
2. Set a Postgres `DATABASE_URL`.
3. Set app and auth secrets.
4. Install dependencies with `pnpm install`.
5. Run `pnpm run db:push`.
6. Run `pnpm dev`.

## Environment Variables

- `DATABASE_URL`: Postgres connection string
- `NEXTAUTH_SECRET`: session signing secret used by the current auth layer
- `NEXTAUTH_URL`: canonical auth base URL
- `APP_URL`: canonical public app URL
- `UPWORK_CLIENT_ID`: Upwork OAuth client id
- `UPWORK_CLIENT_SECRET`: Upwork OAuth client secret
- `UPWORK_REDIRECT_URI`: callback URL registered with Upwork
- `TOKEN_ENCRYPTION_KEY`: 32-byte key used to encrypt stored Upwork tokens

## Main Routes

- `/`: product landing page
- `/login`: sign-in form
- `/signup`: account creation form
- `/dashboard`: protected workspace shell
- `/dashboard/onboarding`: user preference setup
- `/dashboard/settings`: account and connection settings
- `/dashboard/jobs/[id]`: future matched job detail page
- `/api/upwork/connect`: server route to start OAuth
- `/api/upwork/callback`: server route to receive OAuth callback
- `/api/jobs/refresh`: placeholder refresh endpoint
- `/api/jobs/[id]/save`: placeholder save endpoint
- `/api/jobs/[id]/dismiss`: placeholder dismiss endpoint

## Data Model Summary

- `User`: product account and auth identity
- `ConnectedAccount`: Upwork connection and encrypted token metadata
- `FreelancerProfile`: imported profile snapshot
- `UserPreference`: structured targeting preferences

## Implementation Priorities

1. Finish secure Upwork connection persistence.
2. Import freelancer profile data.
3. Add normalized short-lived jobs storage.
4. Build scoring and explanations.
5. Implement save and dismiss state.
6. Add proposal guidance.

## Compliance Note

Upmatch is designed around official Upwork platform constraints:

- OAuth 2.0 only
- GraphQL APIs only
- tenant header support when required
- commercial API use requires explicit permission from Upwork
- rate limits must be respected
- cached data must stay within allowed retention windows

Product features should always be evaluated against these constraints before implementation expands.
